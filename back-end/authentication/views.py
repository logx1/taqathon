from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from .models import User
from django.utils.timezone import now, localtime
import smtplib
from email.message import EmailMessage
import random
import string
import os


def generate_password(length=6):
    """Generate a random password containing digits and letters."""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))


def send_mail(receiver_email, password):
    # Google SMTP details
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = 587
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASS")

    # Email details
    subject = f"Welcome to Our Platform - Account Details ({localtime(now()).strftime('%Y-%m-%d %H:%M:%S')})"
    html_body = f"""
    <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    background-color: #f9f9f9;
                }}
                .header {{
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    color: #4CAF50;
                }}
                .content {{
                    margin-top: 20px;
                }}
                .footer {{
                    margin-top: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #777;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">Welcome to Our Platform!</div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Welcome to our platform! Below are your login credentials:</p>
                    <p><strong>Email:</strong> {receiver_email}</p>
                    <p><strong>Password:</strong> {password}</p>
                    <p>Please keep this information secure and do not share it with anyone.</p>
                </div>
                <div class="footer">
                    <p>Best regards,</p>
                    <p>Your Team</p>
                </div>
            </div>
        </body>
    </html>
    """

    # Create the email
    msg = EmailMessage()
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.add_alternative(html_body, subtype='html')  # Add HTML content

    # Send the email
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
            print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {e}")

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    # send_mail(email, password)
    user = authenticate(email=email, password=password)

    if user is not None:
        user.last_login = now()
        user.save()
        refresh = RefreshToken.for_user(user)
        response =  Response({
            # 'refresh': str(refresh),
            'access': str(refresh.access_token),
            'full_name': user.full_name,
            'email': user.email,
            'role': user.role,
            'department': user.department,
            'id': user.id,
            'isActive': user.isActive,
            'createdAt': localtime(user.created_at),
            'lastLogin': localtime(user.last_login),
 
        })
        response.set_cookie('refresh_token', str(refresh), httponly=True, secure=False, samesite='Lax')
        return response
    else:
        return Response({
        'success': False,
        'statusCode': 401,
        'message': "Invalid email or password",
    }, status=401)

@api_view(['POST'])
@permission_classes([])
def signup(request):    
    email = request.data.get('email')
    password = generate_password()
    full_name = request.data.get('full_name')
    role = request.data.get('role')
    department = request.data.get('department')

    if not email or not password:
        return Response({
        'success': False,
        'statusCode': 401,
        'message': "Invalid email",
    }, status=401)

    try:
        user = User.objects.create_user(email=email, password=password, full_name=full_name, role=role, department=department)
        user.last_login = now()
        user.save()
        send_mail(email, password)
        return Response({
            'message': 'User created successfully',
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'role': user.role,
            'createdAt': localtime(user.created_at),
            'lastLogin': localtime(user.last_login),
            'isActive': user.isActive,
            'department': user.department,

                         }, status=201)
    except Exception as e:
        return Response({
        'success': False,
        'statusCode': 401,
        'message': "Invalid email ",
    }, status=401)
    
# this function get the new access token from the refresh token
@api_view(['GET'])
def new_access_token(request):
    refresh = request.COOKIES.get('refresh_token')

    if not refresh:
        return Response({'error': 'Refresh token is required'}, status=400)

    try:
        token = RefreshToken(refresh)
        return Response({
            'access': str(token.access_token),
        })
    except Exception as e:
        return Response({
            'success': False,
            'statusCode': 401,
            'message': "error in getting new access token",
        }, status=401) 
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh = request.COOKIES.get('refresh_token')

    if not refresh:
        return Response({'error': 'Refresh token is required'}, status=400)
    try:
        token = RefreshToken(refresh)
        token.blacklist()
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie('refresh_token')
        return response
    except Exception as e:
        return Response({
            'success': False,
            'statusCode': 401,
            'message': "Invalid email ",
        }, status=401)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_statistics(request):
    try:
        total_users = User.objects.count()
        total_active_users = User.objects.filter(isActive=True).count()

        return Response({
            'total_users': total_users,
            'total_active_users': total_active_users
        }, status=200)
    except Exception as e:
        return Response({
            'success': False,
            'statusCode': 401,
            'message': "error in getting user statistics",
        }, status=401)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_status(request):
    user_id = request.data.get('id')
    if not user_id:
        return Response({
            'success': False,
            'statusCode': 400,
            'message': "User ID is required",
        }, status=400)
    try:
        user = User.objects.get(id=user_id)
        user.isActive = not user.isActive 
        user.save()
        status = "activated" if user.isActive else "deactivated"
        return Response({
            'success': True,
            'statusCode': 200,
            'isActive': user.isActive,
            'message': f"User {status} successfully",
        }, status=200)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'statusCode': 404,
            'message': "User not found",
        }, status=404)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, id):
    try:
        user = User.objects.get(id=id)
        user.full_name = request.data.get('full_name', user.full_name)
        user.role = request.data.get('role', user.role)
        user.department = request.data.get('department', user.department)
        user.isActive = request.data.get('isActive', user.isActive)
        
        if 'email' in request.data:
            new_email = request.data['email']
            if User.objects.filter(email=new_email).exclude(id=id).exists():
                return Response({
                    'success': False,
                    'statusCode': 400,
                    'message': "Email already exists",
                }, status=400)
            user.email = new_email
        
        user.save()
        
        return Response({
            'success': True,
            'statusCode': 200,
            'message': "User updated successfully",
            'user': {
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email,
                'role': user.role,
                'department': user.department,
                'isActive': user.isActive,
                'created_at': localtime(user.created_at),
                'last_login': localtime(user.last_login),
            }
        }, status=200)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'statusCode': 404,
            'message': "User not found",
        }, status=404)
    except Exception as e:
        return Response({
            'success': False,
            'statusCode': 500,
            'message': "Error updating user",
        }, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, id):
    try:
        user = User.objects.get(id=id)
        user.delete()
        return Response({
            'success': True,
            'statusCode': 200,
            'message': "User deleted successfully",
        }, status=200)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'statusCode': 404,
            'message': "User not found",
        }, status=404)
    except Exception as e:
        return Response({
            'success': False,
            'statusCode': 500,
            'message': "Error deleting user",
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    try:
        users = User.objects.all().values('id', 'email', 'full_name', 'role', 'department', 'isActive', 'created_at', 'last_login')
        users_list = list(users)
        return Response(users_list, status=200)
    except Exception as e:
        return Response({
            'success': False,
            'statusCode': 401,
            'message': "error in getting all users",
        }, status=401)