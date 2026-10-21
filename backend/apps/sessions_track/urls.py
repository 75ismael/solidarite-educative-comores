from django.urls import path
from .views import (
    TutoringSessionListCreateView,
    TutoringSessionDetailView,
    SessionReportCreateView,
)

urlpatterns = [
    path('', TutoringSessionListCreateView.as_view(), name='session_list_create'),
    path('<int:pk>/', TutoringSessionDetailView.as_view(), name='session_detail'),
    path('reports/', SessionReportCreateView.as_view(), name='session_report_create'),
]
