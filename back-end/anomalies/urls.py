from django.urls import path
from .views import anomalies_view, export_anomalies, single_anomaly, get_anomalies_by_page
from .views import total_anomalies
from .views import anomalies_kpis

urlpatterns = [
    path('kpis/<str:kpis>/', anomalies_kpis, name='anomalies_kpis'),
    path('', anomalies_view, name='anomalies'),
    path('single/<int:anomaly_id>/', single_anomaly, name='get_single_anomaly'),
    path('export_anomalies/', export_anomalies, name='export_anomalies'),
    path('total_anomalies/', total_anomalies, name='total_anomalies'),
    # path('delete_anomalies/<int:anomaly_id>/', single_anomaly, name='delete_anomalies'),
    
    path('<int:page_number>/', get_anomalies_by_page, name='anomalies_page'),
]