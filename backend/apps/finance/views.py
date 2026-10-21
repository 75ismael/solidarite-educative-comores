from decimal import Decimal
from django.db.models import Sum
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Donation, Expense, FinancialCampaign
from .serializers import DonationSerializer, ExpenseSerializer, FinancialCampaignSerializer

class TransparencyOverviewView(APIView):
    """
    Page de Transparence Publique (F20) :
    Expose les chiffres clés, dons collectés, dépenses engagées et ventilation
    sans révéler de données personnelles.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # 1. Total dons reçus
        donations_total = Donation.objects.filter(
            status=Donation.Status.RECEIVED
        ).aggregate(total=Sum('amount_eur'))['total'] or Decimal('0.00')

        # 2. Total dépenses engagées
        expenses_total = Expense.objects.filter(
            is_publicly_auditable=True
        ).aggregate(total=Sum('amount_eur'))['total'] or Decimal('0.00')

        # 3. Solde
        balance = donations_total - expenses_total

        # 4. Ventilation des dépenses par catégorie
        categories_data = []
        for cat_key, cat_label in Expense.Category.choices:
            cat_sum = Expense.objects.filter(
                category=cat_key,
                is_publicly_auditable=True
            ).aggregate(total=Sum('amount_eur'))['total'] or Decimal('0.00')

            percentage = round((cat_sum / expenses_total * 100), 1) if expenses_total > 0 else 0
            if cat_sum > 0:
                categories_data.append({
                    'category': cat_key,
                    'label': cat_label,
                    'amount_eur': float(cat_sum),
                    'percentage': percentage
                })

        # 5. Campagne active
        active_campaign = FinancialCampaign.objects.filter(is_active=True).first()
        campaign_data = None
        if active_campaign:
            campaign_data = {
                'title': active_campaign.title,
                'description': active_campaign.description,
                'target_amount_eur': float(active_campaign.target_amount_eur),
                'current_amount_eur': float(donations_total),
                'progress_percentage': min(100, round((donations_total / active_campaign.target_amount_eur) * 100, 1)) if active_campaign.target_amount_eur > 0 else 0,
            }

        # 6. Derniers dons publics
        recent_donations = Donation.objects.filter(
            status=Donation.Status.RECEIVED
        ).order_by('-received_at')[:10]

        # 7. Dernières dépenses justifiées
        recent_expenses = Expense.objects.filter(
            is_publicly_auditable=True
        ).order_by('-spent_at')[:10]

        return Response({
            'total_donations_received_eur': float(donations_total),
            'total_expenses_eur': float(expenses_total),
            'balance_eur': float(balance),
            'categories_breakdown': categories_data,
            'active_campaign': campaign_data,
            'recent_donations': DonationSerializer(recent_donations, many=True).data,
            'recent_expenses': ExpenseSerializer(recent_expenses, many=True).data,
        })

class DonationListCreateView(generics.ListCreateAPIView):
    serializer_class = DonationSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            # Permettre de soumettre une promesse de don
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'FINANCIAL_OFFICER'] or user.is_staff:
            return Donation.objects.all()
        return Donation.objects.filter(status=Donation.Status.RECEIVED)

class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.all()

    def perform_create(self, serializer):
        serializer.save(verified_by=self.request.user)

class FinancialCampaignListView(generics.ListAPIView):
    queryset = FinancialCampaign.objects.filter(is_active=True)
    serializer_class = FinancialCampaignSerializer
    permission_classes = [permissions.AllowAny]
