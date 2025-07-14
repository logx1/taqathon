from django.core.management.base import BaseCommand
from authentication.models import User

class Command(BaseCommand):
    help = 'Create a new user'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email of the user')
        parser.add_argument('full_name', type=str, help='Full name of the user')
        parser.add_argument('role', type=str, help='Role for the user')
        parser.add_argument('department', type=str, help='Department for the user')
        parser.add_argument('password', type=str, help='Password for the user')

    def handle(self, *args, **kwargs):
        email = kwargs['email']
        full_name = kwargs['full_name']
        role = kwargs['role']
        department = kwargs['department']
        password = kwargs['password']

        user = User(email=email, full_name=full_name, role=role, department=department)
        user.set_password(password)
        user.save()

        self.stdout.write(self.style.SUCCESS(f'User {full_name} created successfully!'))