from django.contrib import admin
from .models import VolunteerProfile, PublicMission, MissionApplication

@admin.register(VolunteerProfile)
class VolunteerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'levels_can_teach', 'hours_per_week', 'verification_status', 'is_available_for_new_student', 'created_at')
    list_filter = ('verification_status', 'levels_can_teach', 'is_available_for_new_student')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'languages')
    filter_horizontal = ('subjects',)

@admin.register(PublicMission)
class PublicMissionAdmin(admin.ModelAdmin):
    list_display = ('title', 'publisher_type', 'organization_name', 'published_by', 'subject', 'school_level', 'island', 'mentors_needed', 'status', 'created_at')
    list_filter = ('publisher_type', 'organization_type', 'individual_role', 'status', 'island', 'format', 'subject')
    search_fields = ('title', 'description', 'city', 'organization_name', 'published_by', 'contact_email')
    raw_id_fields = ('creator', 'related_request')

    fieldsets = (
        ("Type de Publiant & Structure", {
            'fields': (
                'publisher_type', 'organization_type', 'individual_role',
                'published_by', 'organization_name', 'organization_description',
                'contact_email', 'contact_phone', 'creator', 'status'
            )
        }),
        ("Détails de la mission", {
            'fields': ('title', 'activity_type', 'target_public', 'subject', 'school_level', 'prerequisites')
        }),
        ("Localisation & Format", {
            'fields': ('format', 'island', 'city', 'intervention_zone_details')
        }),
        ("Contenu Rédactionnel & Présentation (JeVeuxAider / CMS)", {
            'fields': ('description', 'presentation_full', 'steps_to_join', 'practical_details', 'benefits')
        }),
        ("Objectifs, Rythme & Calendrier", {
            'fields': ('mentors_needed', 'expected_commitment', 'start_date', 'end_date', 'deadline', 'related_request')
        }),
    )

@admin.register(MissionApplication)
class MissionApplicationAdmin(admin.ModelAdmin):
    list_display = ('mission', 'volunteer', 'status', 'created_at')
    list_filter = ('status',)
