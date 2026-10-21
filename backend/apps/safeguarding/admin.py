from django.contrib import admin
from .models import Alert, ConfidentialReport

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'alert_type', 'severity', 'student', 'is_resolved', 'created_at')
    list_filter = ('severity', 'alert_type', 'is_resolved')
    search_fields = ('title', 'description', 'student__anonymous_code')

@admin.register(ConfidentialReport)
class ConfidentialReportAdmin(admin.ModelAdmin):
    list_display = ('report_number', 'category', 'reporter_role', 'status', 'created_at')
    list_filter = ('category', 'status', 'created_at')
    search_fields = ('report_number', 'details')
    readonly_fields = ('report_number', 'created_at', 'updated_at')
