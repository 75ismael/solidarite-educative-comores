from rest_framework import serializers
from .models import Donation, Expense, FinancialCampaign

class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = [
            'id', 'donor_name', 'is_anonymous', 'amount', 'currency',
            'amount_eur', 'status', 'allocation', 'payment_method',
            'received_at'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Anonymiser pour l'affichage si nécessaire
        if instance.is_anonymous:
            data['donor_name'] = 'Donateur solidaire anonyme'
        return data

class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'category', 'category_display', 'amount',
            'currency', 'amount_eur', 'spent_at', 'receipt_reference',
            'is_publicly_auditable'
        ]

class FinancialCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialCampaign
        fields = '__all__'
