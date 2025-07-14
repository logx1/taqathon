from django.urls import path
from .views import maintenance_window_crud
from .views import maintenance_window_kpas


urlpatterns = [
    path('', maintenance_window_crud, name='maintenance_windows'),
    path('<int:id>/', maintenance_window_crud, name='maintenance_window_detail'),
    path('<str:kpis>/', maintenance_window_kpas, name='maintenance_window_export'),
]