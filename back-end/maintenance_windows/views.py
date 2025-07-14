from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.forms.models import model_to_dict

from .models import MaintenanceWindow

@api_view(['POST', 'GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def maintenance_window_crud(request, id=None):
    if request.method == 'POST':
        try:
            data = request.data
            name = data.get('name')
            type = data.get('type')
            status = data.get('status', 'planned')
            duration = data.get('duration', 0)
            date_range = data.get('date_range', 0)
            description = data.get('description', '')
            start_date = data.get('start_date')
            end_date = data.get('end_date')

            if not name or not type or not description or not start_date or not end_date:
                return Response({"error": "Name, type, and start date are required."}, status=400)
            maintenance_window = MaintenanceWindow.objects.create(
                name=name,
                type=type,
                status=status,
                duration=duration,
                date_range=date_range,
                description=description,
                start_date=start_date,
                end_date=end_date
            )
            return Response(model_to_dict(maintenance_window), status=201)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=500)
    elif request.method == 'GET':
        if id:
            try:
                maintenance_window = MaintenanceWindow.objects.get(id=id)
                return Response(model_to_dict(maintenance_window), status=200)
            except MaintenanceWindow.DoesNotExist:
                return Response({"error": "Maintenance window not found."}, status=404)
            except Exception as e:
                return Response({"error": f"An error occurred: {str(e)}"}, status=500)
        try:
            maintenance_windows = MaintenanceWindow.objects.all()
            maintenance_windows_data = [model_to_dict(mw) for mw in maintenance_windows]
            return Response(maintenance_windows_data, status=200)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=500)
    
    elif request.method == 'PUT':
        try:
            if not id:
                return Response({"error": "ID is required for update."}, status=400)
            maintenance_window = MaintenanceWindow.objects.get(id=id)
            data = request.data
            maintenance_window.name = data.get('name', maintenance_window.name)
            maintenance_window.type = data.get('type', maintenance_window.type)
            maintenance_window.status = data.get('status', maintenance_window.status)
            maintenance_window.duration = data.get('duration', maintenance_window.duration)
            maintenance_window.date_range = data.get('date_range', maintenance_window.date_range)
            maintenance_window.description = data.get('description', maintenance_window.description)
            maintenance_window.start_date = data.get('start_date', maintenance_window.start_date)
            maintenance_window.end_date = data.get('end_date', maintenance_window.end_date)
            maintenance_window.save()
            return Response(model_to_dict(maintenance_window), status=200)
        except MaintenanceWindow.DoesNotExist:
            return Response({"error": "Maintenance window not found."}, status=404)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=500)
    elif request.method == 'DELETE':
        try:
            if not id:
                return Response({"error": "ID is required for deletion."}, status=400)
            maintenance_window = MaintenanceWindow.objects.get(id=id)
            maintenance_window.delete()
            return Response({"message": "Maintenance window deleted successfully."}, status=204)
        except MaintenanceWindow.DoesNotExist:
            return Response({"error": "Maintenance window not found."}, status=404)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def maintenance_window_kpas(request, kpis):
    try:
        if kpis == 'total':
            total_windows = MaintenanceWindow.objects.count()
            return Response({"total_maintenance_windows": total_windows}, status=200)
        elif kpis == 'planned':
            planned_windows = MaintenanceWindow.objects.filter(status='planned').count()
            return Response({"planned_maintenance_windows": planned_windows}, status=200)
        elif kpis == 'completed':
            completed_windows = MaintenanceWindow.objects.filter(status='completed').count()
            return Response({"completed_maintenance_windows": completed_windows}, status=200)
    except Exception as e:
        return Response({"error": f"An error occurred: {str(e)}"}, status=500)    