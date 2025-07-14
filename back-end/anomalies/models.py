from django.db import models
from maintenance_windows.models import MaintenanceWindow


class anomalies(models.Model):
    id = models.AutoField(primary_key=True)
    unit = models.CharField(max_length=255) 
    num_equipement = models.CharField(max_length=255) 
    systeme = models.CharField(max_length=255) 
    description = models.TextField()
    equipement_description = models.TextField()
    section_proprietaire = models.CharField(max_length=255) 
    integrite = models.IntegerField()
    disponibilite = models.IntegerField()
    process_safety =models.IntegerField()
    criticite = models.IntegerField()
    niveau_de_priorite = models.CharField(max_length=255, null=True)
    date_detection = models.DateField(auto_now_add=True, null=True)
    last_update_date = models.DateField(auto_now_add=True, null=True)
    maintenanceDate = models.DateField(null=True, blank=True)
    attachments = models.CharField(max_length=255, null=True, blank=True)
    maintenance = models.BooleanField(default=False)
    maintenanceDuration = models.IntegerField(default=0, null=True, blank=True)
    status = models.CharField(max_length=255, default='open', null=True, blank=True)

    maintenance_windows = models.IntegerField(null=True, blank=True)
    action_plan_description = models.TextField(null=True, blank=True)
    action_plan_steps = models.JSONField(null=True, blank=True)
    action_plan_duration = models.IntegerField(default=0, null=True, blank=True)
    action_plan_resources = models.JSONField(null=True, blank=True)
    action_plan_status = models.CharField(max_length=255, default='draft', null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    
    def __str__(self):
        return f"{self.unite} - {self.equipment_code}"
    
    class Meta:
        db_table = 'anomalies'