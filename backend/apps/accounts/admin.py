from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'island', 'is_verified', 'safeguarding_signed', 'is_staff')
    list_filter = ('role', 'island', 'is_verified', 'safeguarding_signed', 'is_staff', 'is_active')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'city')
    ordering = ('-date_joined',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profil & Rôle Solidaire', {
            'fields': ('role', 'phone', 'island', 'city', 'is_verified', 'safeguarding_signed', 'bio')
        }),
    )
