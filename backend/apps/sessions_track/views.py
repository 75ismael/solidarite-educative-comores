from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import TutoringSession, SessionReport
from .serializers import TutoringSessionSerializer, SessionReportSerializer
from apps.core.emails import send_session_scheduled_notification

class TutoringSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = TutoringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        session = serializer.save()
        send_session_scheduled_notification(session)

    def get_queryset(self):
        user = self.request.user
        pairing_id = self.request.query_params.get('pairing_id')
        qs = TutoringSession.objects.all()
        if pairing_id:
            qs = qs.filter(pairing_id=pairing_id)

        if user.role in ['ADMIN', 'COORDINATOR'] or user.is_staff:
            return qs
        elif user.role == 'VOLUNTEER':
            return qs.filter(pairing__volunteer=user)
        elif user.role in ['PARENT', 'TEACHER']:
            return qs.filter(pairing__student__parent=user)
        return TutoringSession.objects.none()

class TutoringSessionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = TutoringSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COORDINATOR'] or user.is_staff:
            return TutoringSession.objects.all()
        elif user.role == 'VOLUNTEER':
            return TutoringSession.objects.filter(pairing__volunteer=user)
        elif user.role in ['PARENT', 'TEACHER']:
            return TutoringSession.objects.filter(pairing__student__parent=user)
        return TutoringSession.objects.none()

class SessionReportCreateView(generics.CreateAPIView):
    serializer_class = SessionReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        report = serializer.save()
        # Mettre à jour automatiquement le statut de la séance à COMPLETED
        session = report.session
        session.status = TutoringSession.Status.COMPLETED
        session.save(update_fields=['status'])
