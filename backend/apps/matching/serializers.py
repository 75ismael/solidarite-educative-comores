from rest_framework import serializers
from .models import Pairing, PairingHistory, LiaisonNote
from apps.pedagogy.serializers import StudentSerializer, SubjectSerializer
from apps.accounts.serializers import UserSerializer

class LiaisonNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_role = serializers.CharField(source='author.get_role_display', read_only=True)

    class Meta:
        model = LiaisonNote
        fields = ['id', 'pairing', 'author', 'author_name', 'author_role', 'message', 'created_at']
        read_only_fields = ['id', 'pairing', 'author', 'created_at']

class PairingSerializer(serializers.ModelSerializer):
    student_details = StudentSerializer(source='student', read_only=True)
    volunteer_details = UserSerializer(source='volunteer', read_only=True)
    coordinator_details = UserSerializer(source='coordinator', read_only=True)
    subject_details = SubjectSerializer(source='subject', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    notes = LiaisonNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Pairing
        fields = [
            'id', 'student', 'student_details', 'volunteer', 'volunteer_details',
            'coordinator', 'coordinator_details', 'subject', 'subject_details',
            'support_request', 'status', 'status_display', 'change_reason', 'start_date', 'end_date',
            'weekly_frequency', 'general_goals', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class PairingHistorySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)

    class Meta:
        model = PairingHistory
        fields = '__all__'
