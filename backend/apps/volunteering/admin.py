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
    list_display = ('title', 'subject', 'school_level', 'island', 'format', 'status', 'created_at')
    list_filter = ('status', 'island', 'format', 'subject')
    search_fields = ('title', 'description', 'city')

@admin.register(MissionApplication)
class MissionApplicationAdmin(admin.ModelAdmin):
    list_display = ('mission', 'volunteer', 'status', 'created_at')
    list_filter = ('status',)
