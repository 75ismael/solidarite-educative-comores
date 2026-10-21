from django.contrib import admin
from .models import Donation, Expense, FinancialCampaign

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('donor_name', 'amount', 'currency', 'amount_eur', 'status', 'allocation', 'received_at')
    list_filter = ('status', 'currency', 'received_at')
    search_fields = ('donor_name', 'donor_email', 'allocation')

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'amount', 'currency', 'amount_eur', 'spent_at', 'is_publicly_auditable')
    list_filter = ('category', 'is_publicly_auditable', 'spent_at')
    search_fields = ('title', 'receipt_reference')

@admin.register(FinancialCampaign)
class FinancialCampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'target_amount_eur', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active',)
