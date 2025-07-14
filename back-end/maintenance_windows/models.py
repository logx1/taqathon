from django.db import models


class MaintenanceWindow(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    status = models.CharField(max_length=200, default='Planned')
    duration = models.IntegerField(default=0, null=True, blank=True)
    date_range = models.IntegerField(default=0, null=True, blank=True)
    description = models.TextField(null=True, blank=True, help_text="Description of the maintenance window")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    
    def __str__(self):
        return f"{self.name} - {self.type} - {self.status}"
    
    class Meta:
        db_table = 'maintenance_windows'

