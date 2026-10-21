from django.urls import path
from .views import (
    AlertListCreateView,
    AlertDetailView,
    PublicConfidentialReportCreateView,
    ConfidentialReportListView,
    ConfidentialReportDetailView,
)

urlpatterns = [
    path('alerts/', AlertListCreateView.as_view(), name='alert_list_create'),
    path('alerts/<int:pk>/', AlertDetailView.as_view(), name='alert_detail'),
    path('reports/submit/', PublicConfidentialReportCreateView.as_view(), name='confidential_report_submit'),
    path('reports/', ConfidentialReportListView.as_view(), name='confidential_report_list'),
    path('reports/<int:pk>/', ConfidentialReportDetailView.as_view(), name='confidential_report_detail'),
]
