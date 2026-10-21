from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Alert, ConfidentialReport
from .serializers import (
    AlertSerializer,
    ConfidentialReportSerializer,
    PublicConfidentialReportCreateSerializer,
)

class AlertListCreateView(generics.ListCreateAPIView):
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COORDINATOR', 'SAFEGUARDING_OFFICER'] or user.is_staff:
            status_param = self.request.query_params.get('resolved')
            if status_param is not None:
                is_resolved = status_param.lower() in ['true', '1']
                return Alert.objects.filter(is_resolved=is_resolved)
            return Alert.objects.all()
        return Alert.objects.none()

class AlertDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COORDINATOR', 'SAFEGUARDING_OFFICER'] or user.is_staff:
            return Alert.objects.all()
        return Alert.objects.none()

from apps.core.emails import send_safeguarding_alert_notification

class PublicConfidentialReportCreateView(generics.CreateAPIView):
    """
    Endpoint public permettant à quiconque (élève, parent, témoin)
    de déposer un signalement de manière sécurisée et confidentielle.
    """
    serializer_class = PublicConfidentialReportCreateSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        report = serializer.save()
        send_safeguarding_alert_notification(report)

class ConfidentialReportListView(generics.ListAPIView):
    serializer_class = ConfidentialReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Accès strictement limité au Responsable de protection des mineurs et superuser
        user = self.request.user
        if user.role == 'SAFEGUARDING_OFFICER' or user.is_superuser:
            return ConfidentialReport.objects.all()
        return ConfidentialReport.objects.none()

class ConfidentialReportDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ConfidentialReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SAFEGUARDING_OFFICER' or user.is_superuser:
            return ConfidentialReport.objects.all()
        return ConfidentialReport.objects.none()
