from django.contrib import admin
from .models import TutoringSession, SessionReport

class SessionReportInline(admin.StackedInline):
    model = SessionReport
    extra = 0

@admin.register(TutoringSession)
class TutoringSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'pairing', 'scheduled_at', 'duration_minutes', 'mode', 'status')
    list_filter = ('status', 'mode', 'scheduled_at')
    search_fields = ('title', 'pairing__student__anonymous_code', 'pairing__volunteer__email')
    inlines = [SessionReportInline]

@admin.register(SessionReport)
class SessionReportAdmin(admin.ModelAdmin):
    list_display = ('session', 'attendance', 'understanding_level', 'submitted_at')
    list_filter = ('attendance', 'understanding_level', 'submitted_at')
