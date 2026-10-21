from django.urls import path
from .views import (
    TransparencyOverviewView,
    DonationListCreateView,
    ExpenseListCreateView,
    FinancialCampaignListView,
)

urlpatterns = [
    path('transparency/', TransparencyOverviewView.as_view(), name='transparency_overview'),
    path('donations/', DonationListCreateView.as_view(), name='donation_list_create'),
    path('expenses/', ExpenseListCreateView.as_view(), name='expense_list_create'),
    path('campaigns/', FinancialCampaignListView.as_view(), name='campaign_list'),
]
