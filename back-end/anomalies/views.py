from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.forms.models import model_to_dict
from .models import anomalies
import pandas as pd

import os
import boto3
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

from io import BytesIO
import requests
import traceback


AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")
AWS_S3_REGION_NAME = os.getenv("AWS_S3_REGION_NAME")
AI_API_URL = os.getenv("AI_API_URL")

def upload_file(file_path,object_name):
    # Create the S3 client with credentials
    s3 = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=AWS_S3_REGION_NAME
    )


    try:
        # Upload the file
        s3.upload_file(file_path, AWS_S3_BUCKET_NAME, object_name)
    except Exception as e:
        print(f"Error uploading file: {e}")

Base = declarative_base()
def get_file(file_name):
    s3 = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=AWS_S3_REGION_NAME
    )

    global_url = s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': AWS_S3_BUCKET_NAME, 'Key': file_name},
        ExpiresIn=3600  # URL valid for 1 hour
    )
    return global_url

def add_anomalies(request):
    data = request.data
    unit = data.get('unit')
    equipment_code = data.get('equipment_code')
    equipment_description = data.get('equipment_description')
    work_order_reference = data.get('work_order_reference')
    anomaly_description = data.get('anomaly_description')
    system_status = data.get('system_status')
    technical_owner = data.get('technical_owner')
    severity_level = data.get('severity_level', 'Default Severity')
    impactCategory = data.get('impactCategory', 'Default Category')
    maintenanceDate = data.get('maintenanceDate', None)

    # Save the file in static files
    if not request.FILES.get('filex'):
        return Response({"file received": False, "error": "No file provided"}, status=400)
    
    filex = request.FILES['filex']
    if not os.path.exists(settings.MEDIA_ROOT):
        os.makedirs(settings.MEDIA_ROOT)
    
    file_path = os.path.join(settings.MEDIA_ROOT, filex.name)
    with open(file_path, 'wb+') as destination:
        for chunk in filex.chunks():
            destination.write(chunk)

    if not all([unit, equipment_code, equipment_description, work_order_reference, anomaly_description, system_status, technical_owner]):
        return Response({
            'success': False,
            'statusCode': 400,
            'message': "Invalid input, all fields are required",
        }, status=400)

    anomaliex = anomalies.objects.create(
        unit=unit,
        equipment_code=equipment_code,
        equipment_description=equipment_description,
        work_order_reference=work_order_reference,
        anomaly_description=anomaly_description,
        system_status=system_status,
        technical_owner=technical_owner
    )
    
    s3_object_name = f"{anomaliex.id}_{filex.name}"
    anomaliex.attachments = s3_object_name
    upload_file(file_path, s3_object_name)
    anomaliex.save()

    file_url = get_file(s3_object_name)

    return Response({
        'success': True,
        'statusCode': 201,
        'message': "Anomaly created successfully",
        'data': model_to_dict(anomaliex),
        'file_url': file_url
    }, status=201)

def get_anomalies(request):
    anomalies_list = anomalies.objects.all()
    anomalies_data = [model_to_dict(anomaly) for anomaly in anomalies_list]
    
    return Response(anomalies_data, status=200)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def anomalies_view(request):
    if request.method == 'GET':
        return get_anomalies(request)
    elif request.method == 'POST':
        return add_anomalies(request)
    else:
        return Response({"error": "Method not allowed"}, status=405)




@api_view(['POST'])
@permission_classes([])
def export_anomalies(request):
    if 'filex' not in request.FILES:
        return Response({"file received": False, "error": "No file provided"}, status=400)
    
    filex = request.FILES['filex']
    if not filex.name.endswith('.xlsx'):
        return Response({"file received": False, "error": "File must be an xlsx file"}, status=400)
    
    try:
        api_url = AI_API_URL + "predict_all"
        
        filex.seek(0)
        
        files = {'filex': (filex.name, filex, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
        
        try:
            response = requests.post(api_url, files=files)
            response.raise_for_status() 
            
            predicted_file_content = response.content
            
            df = pd.read_excel(BytesIO(predicted_file_content))
            
        except requests.exceptions.RequestException as e:
            return Response({
                "file received": False,
                "error": f"Failed to call prediction API: {str(e)}"
            }, status=500)
        except Exception as e:
            return Response({
                "file received": False,
                "error": f"Failed to process API response: {str(e)}"
            }, status=500)

        # Step 4: Process the predicted data
        column_map = {
            'unit': 'unit',
            'Num_equipement': 'num_equipement',
            'Systeme': 'systeme',
            'Description': 'description',
            "Description de l'équipement": 'equipement_description',
            'Section propriétaire': 'section_proprietaire',
            'Fiabilité Intégrité': 'integrite',
            'Disponibilté': 'disponibilite',
            'Process Safety': 'process_safety',
            'Criticité': 'criticite',
            'niveau_de_priorite': 'niveau_de_priorite',
            "Date de détéction de l'anomalie": 'date_detection',
            "last_update_date": 'last_update_date',
            "maintenanceDate": 'maintenanceDate',
            "attachments": 'attachments'
        }

        available_cols = [excel_col for excel_col in column_map if excel_col in df.columns]
        df = df[available_cols]
        df = df.rename(columns={k: column_map[k] for k in available_cols})

        if 'unit' not in df.columns:
            df['unit'] = "UNDEFINED"
        df['unit'] = df['unit'].fillna("UNDEFINED")
        
        if 'description' not in df.columns:
            df['description'] = "NO DESCRIPTION"
        df['description'] = df['description'].fillna("NO DESCRIPTION")
        
        if 'equipement_description' not in df.columns:
            df['equipement_description'] = "NO EQUIPEMENT DESCRIPTION"
        df['equipement_description'] = df['equipement_description'].fillna("NO EQUIPEMENT DESCRIPTION")

        records = df.to_dict(orient='records')

        model_fields = [f.name for f in anomalies._meta.get_fields() if f.name != 'id']

        objs = []
        for rec in records:
            filtered = {k: v for k, v in rec.items() if k in model_fields}
            objs.append(anomalies(**filtered))
        
        created_objs = anomalies.objects.bulk_create(objs, batch_size=500)
        
        created_anomalies = [model_to_dict(obj) for obj in created_objs]

        return Response({
            "file received": True,
            "message": "File processed successfully with predictions",
            "exported_anomalies": created_anomalies,
            "count": len(created_anomalies),
            "prediction_api_status": "success"
        }, status=200)

    except FileNotFoundError:
        return Response({
            "file received": False,
            "error": "File not found"
        }, status=400)
    except Exception as e:
        return Response({
            "file received": False,
            "error": f"An error occurred: {str(e)}",
            "traceback": traceback.format_exc() if settings.DEBUG else None
        }, status=500)



@api_view(['GET', 'DELETE', 'PUT'])
@permission_classes([IsAuthenticated])
def single_anomaly(request, anomaly_id):
    if request.method == 'DELETE':
        try:
            anomaly = anomalies.objects.get(id=anomaly_id)
            anomaly.delete()
            return Response({"message": "Anomaly deleted successfully"}, status=204)
        except anomalies.DoesNotExist:
            return Response({"error": "Anomaly not found"}, status=404)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=500)
    if request.method == 'GET':
        try:
            anomaly = anomalies.objects.get(id=anomaly_id)
            anomaly_data = model_to_dict(anomaly)
            return Response(anomaly_data, status=200)
        except anomalies.DoesNotExist:
            return Response({"error": "Anomaly not found"}, status=404)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=500)
    if request.method == 'PUT':
        try:
            anomaly = anomalies.objects.get(id=anomaly_id)
            data = request.data
            
            # Update only the fields that are provided in the request
            for field, value in data.items():
                if hasattr(anomaly, field):
                    setattr(anomaly, field, value)
            
            anomaly.save()
            return Response(model_to_dict(anomaly), status=200)
        except anomalies.DoesNotExist:
            return Response({"error": "Anomaly not found"}, status=404)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=500)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_anomalies_by_page(request, page_number):
    if page_number < 1:
        return Response({"error": "Page number must be greater than 0"}, status=400)
    # send total number of page evry page has 20 anomalies the page start from 1
    total_anomalies = anomalies.objects.count()
    total_pages = (total_anomalies + 19) // 20 
    page_size = 20
    start = (page_number - 1) * page_size
    end = start + page_size
    
    anomalies_list = anomalies.objects.all()[start:end]
    anomalies_data = [model_to_dict(anomaly) for anomaly in anomalies_list]
    
    return Response({
        "anomalies": anomalies_data,
        "total_pages": total_pages,
        "total_anomalies": total_anomalies
    }, status=200) 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def total_anomalies(request):
    total_anomalies = anomalies.objects.count()
    return Response({"total_anomalies": total_anomalies}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def anomalies_kpis(request, kpis):
    if not kpis:
        return Response({"error": "No KPIs provided"}, status=400)
    
    if kpis == "open":
        anomalies_list = anomalies.objects.filter(status="open")
        return Response({"anomalies": [model_to_dict(anomaly) for anomaly in anomalies_list]}, status=200)
    
    elif kpis == "High_Criticality":
        anomalies_list = anomalies.objects.filter(criticite__gte=10)  # This gets criticite >= 10
        return Response({"anomalies": [model_to_dict(anomaly) for anomaly in anomalies_list]}, status=200)
    
    else:
        return Response({"error": "Invalid KPI type"}, status=400)
