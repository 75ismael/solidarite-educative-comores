from rest_framework import serializers
from .models import VolunteerProfile, PublicMission, MissionApplication
from apps.pedagogy.serializers import SubjectSerializer
from apps.accounts.serializers import UserSerializer
from apps.pedagogy.models import Subject

class VolunteerProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    subjects_details = SubjectSerializer(source='subjects', many=True, read_only=True)
    subjects_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Subject.objects.all(), write_only=True, source='subjects'
    )
    verification_status_display = serializers.CharField(source='get_verification_status_display', read_only=True)
    levels_can_teach_display = serializers.CharField(source='get_levels_can_teach_display', read_only=True)

    class Meta:
        model = VolunteerProfile
        fields = [
            'id', 'user', 'user_details', 'subjects', 'subjects_details',
            'subjects_ids', 'levels_can_teach', 'levels_can_teach_display',
            'languages', 'profession_or_studies', 'experience', 'availabilities',
            'hours_per_week', 'verification_status', 'verification_status_display',
            'verification_notes', 'is_available_for_new_student', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'verification_status', 'verification_notes', 'created_at']

class PublicMissionSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    format_display = serializers.CharField(source='get_format_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    applications_count = serializers.IntegerField(source='applications.count', read_only=True)

    class Meta:
        model = PublicMission
        fields = [
            'id', 'title', 'published_by', 'organization_name', 'organization_description',
            'activity_type', 'target_public', 'subject', 'subject_name', 'school_level',
            'island', 'city', 'intervention_zone_details', 'format', 'format_display',
            'prerequisites', 'description', 'presentation_full', 'steps_to_join',
            'practical_details', 'benefits', 'expected_commitment', 'status', 'status_display',
            'deadline', 'created_at', 'applications_count'
        ]

class MissionApplicationSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.CharField(source='volunteer.get_full_name', read_only=True)
    volunteer_email = serializers.EmailField(source='volunteer.email', read_only=True)
    mission_title = serializers.CharField(source='mission.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = MissionApplication
        fields = [
            'id', 'mission', 'mission_title', 'volunteer', 'volunteer_name',
            'volunteer_email', 'motivation', 'status', 'status_display', 'created_at'
        ]
        read_only_fields = ['id', 'volunteer', 'status', 'created_at']
