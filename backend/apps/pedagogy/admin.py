from django.contrib import admin
from .models import Subject, Student, SupportRequest, LearningObjective

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name',)

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('anonymous_code', 'first_name', 'last_name_initial', 'school_level', 'grade', 'island', 'city', 'parental_consent_granted', 'created_at')
    list_filter = ('school_level', 'island', 'parental_consent_granted')
    search_fields = ('anonymous_code', 'first_name', 'city', 'school_name')
    readonly_fields = ('anonymous_code', 'consent_date', 'created_at')

@admin.register(SupportRequest)
class SupportRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'urgency', 'format_preference', 'status', 'created_at')
    list_filter = ('status', 'urgency', 'format_preference')
    search_fields = ('student__anonymous_code', 'difficulties_description')
    filter_horizontal = ('subjects',)

@admin.register(LearningObjective)
class LearningObjectiveAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'description', 'status', 'target_date')
    list_filter = ('status', 'subject')
