from django.contrib import admin
from .models import Pairing, PairingHistory, LiaisonNote

class PairingHistoryInline(admin.TabularInline):
    model = PairingHistory
    extra = 0
    readonly_fields = ('action', 'performed_by', 'comment', 'timestamp')

class LiaisonNoteInline(admin.TabularInline):
    model = LiaisonNote
    extra = 0
    readonly_fields = ('author', 'created_at')

@admin.register(Pairing)
class PairingAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'volunteer', 'subject', 'status', 'start_date', 'coordinator')
    list_filter = ('status', 'subject', 'start_date')
    search_fields = ('student__anonymous_code', 'volunteer__email', 'volunteer__last_name')
    inlines = [PairingHistoryInline, LiaisonNoteInline]

@admin.register(LiaisonNote)
class LiaisonNoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'pairing', 'author', 'created_at')
    search_fields = ('pairing__student__anonymous_code', 'author__email', 'message')

