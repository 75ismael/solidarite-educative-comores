from rest_framework import serializers
from .models import Subject, Student, SupportRequest, LearningObjective

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    school_level_display = serializers.CharField(source='get_school_level_display', read_only=True)
    island_display = serializers.CharField(source='get_island_display', read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'anonymous_code', 'first_name', 'last_name_initial',
            'birth_year', 'school_level', 'school_level_display',
            'grade', 'island', 'island_display', 'city', 'school_name',
            'parent', 'parental_consent_granted', 'consent_date', 'created_at'
        ]
        read_only_fields = ['id', 'anonymous_code', 'consent_date', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        # Respect de la vie privée : Si l'utilisateur n'est pas le parent ni un admin/coordinateur, masquer le prénom
        if request and request.user.is_authenticated:
            is_parent = (instance.parent_id == request.user.id)
            is_staff = request.user.role in ['ADMIN', 'COORDINATOR'] or request.user.is_staff
            if not (is_parent or is_staff):
                data['first_name'] = f"Élève {instance.anonymous_code}"
        return data

class SupportRequestSerializer(serializers.ModelSerializer):
    student_details = StudentSerializer(source='student', read_only=True)
    subjects_details = SubjectSerializer(source='subjects', many=True, read_only=True)
    subjects_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Subject.objects.all(), write_only=True, source='subjects'
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    format_preference_display = serializers.CharField(source='get_format_preference_display', read_only=True)

    class Meta:
        model = SupportRequest
        fields = [
            'id', 'student', 'student_details', 'requested_by',
            'subjects', 'subjects_details', 'subjects_ids',
            'difficulties_description', 'pedagogical_goals',
            'format_preference', 'format_preference_display',
            'availabilities', 'urgency', 'urgency_display',
            'status', 'status_display', 'coordinator_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'requested_by', 'created_at', 'updated_at']

class LearningObjectiveSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = LearningObjective
        fields = '__all__'
