from rest_framework import serializers
from .models import Alert, ConfidentialReport

class AlertSerializer(serializers.ModelSerializer):
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)

    class Meta:
        model = Alert
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class ConfidentialReportSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ConfidentialReport
        fields = '__all__'
        read_only_fields = ['id', 'report_number', 'created_at', 'updated_at']

class PublicConfidentialReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfidentialReport
        fields = [
            'reporter_name', 'reporter_contact', 'reporter_role',
            'category', 'details'
        ]
