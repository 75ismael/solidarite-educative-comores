from rest_framework import serializers
from .models import TutoringSession, SessionReport
from apps.matching.serializers import PairingSerializer

class SessionReportSerializer(serializers.ModelSerializer):
    attendance_display = serializers.CharField(source='get_attendance_display', read_only=True)
    understanding_level_display = serializers.CharField(source='get_understanding_level_display', read_only=True)

    class Meta:
        model = SessionReport
        fields = '__all__'
        read_only_fields = ['id', 'submitted_at']

class TutoringSessionSerializer(serializers.ModelSerializer):
    report = SessionReportSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    mode_display = serializers.CharField(source='get_mode_display', read_only=True)
    pairing_details = PairingSerializer(source='pairing', read_only=True)

    class Meta:
        model = TutoringSession
        fields = [
            'id', 'pairing', 'pairing_details', 'title', 'scheduled_at',
            'duration_minutes', 'mode', 'mode_display', 'location_or_link',
            'status', 'status_display', 'cancellation_reason', 'report', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
