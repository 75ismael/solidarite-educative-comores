from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Pairing, PairingHistory, LiaisonNote
from .serializers import PairingSerializer, PairingHistorySerializer, LiaisonNoteSerializer
from .services import calculate_match_suggestions
from apps.pedagogy.models import SupportRequest
from apps.core.emails import send_pairing_welcome_notification, send_liaison_note_notification

class PairingListCreateView(generics.ListCreateAPIView):
    serializer_class = PairingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COORDINATOR'] or user.is_staff:
            return Pairing.objects.all()
        elif user.role == 'VOLUNTEER':
            return Pairing.objects.filter(volunteer=user)
        elif user.role in ['PARENT', 'TEACHER']:
            return Pairing.objects.filter(student__parent=user)
        return Pairing.objects.none()

    def perform_create(self, serializer):
        pairing = serializer.save(coordinator=self.request.user)
        # Si une demande était associée, marquer la demande comme MATCHED
        if pairing.support_request:
            req = pairing.support_request
            req.status = SupportRequest.Status.MATCHED
            req.save(update_fields=['status'])

        # Enregistrer l'historique
        PairingHistory.objects.create(
            pairing=pairing,
            action="Création du binôme",
            performed_by=self.request.user,
            comment=f"Binôme créé par {self.request.user.get_full_name() or self.request.user.username}"
        )

        # Notification e-mail au bénévole et à la famille
        send_pairing_welcome_notification(pairing)

class PairingDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = PairingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COORDINATOR'] or user.is_staff:
            return Pairing.objects.all()
        elif user.role == 'VOLUNTEER':
            return Pairing.objects.filter(volunteer=user)
        elif user.role in ['PARENT', 'TEACHER']:
            return Pairing.objects.filter(student__parent=user)
        return Pairing.objects.none()

class LiaisonNoteListCreateView(generics.ListCreateAPIView):
    serializer_class = LiaisonNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        pairing_id = self.kwargs.get('pairing_id')
        user = self.request.user
        qs = LiaisonNote.objects.filter(pairing_id=pairing_id)
        if user.role in ['ADMIN', 'COORDINATOR'] or user.is_staff:
            return qs
        elif user.role == 'VOLUNTEER':
            return qs.filter(pairing__volunteer=user)
        elif user.role in ['PARENT', 'TEACHER']:
            return qs.filter(pairing__student__parent=user)
        return LiaisonNote.objects.none()

    def perform_create(self, serializer):
        pairing_id = self.kwargs.get('pairing_id')
        note = serializer.save(pairing_id=pairing_id, author=self.request.user)
        send_liaison_note_notification(note)

class MatchingSuggestionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, request_id):
        # Accessible uniquement aux coordinateurs et administrateurs
        if request.user.role not in ['ADMIN', 'COORDINATOR'] and not request.user.is_staff:
            return Response(
                {'detail': 'Accès réservé à l\'équipe de coordination.'},
                status=status.HTTP_403_FORBIDDEN
            )
        suggestions = calculate_match_suggestions(request_id)
        return Response({'request_id': request_id, 'suggestions': suggestions})

from django.utils import timezone
from apps.accounts.models import User

class ReassignPairingView(APIView):
    """
    Réattribution d'un binôme à un nouveau bénévole :
    - Clôture de l'ancien binôme au statut COMPLETED avec date de fin et historique complet
    - Maintien des anciennes séances, bilans et messages sous le nom de l'ancien tuteur
    - Création d'un nouveau binôme actif pour le nouveau bénévole avec continuité du dossier
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pairing_id):
        if request.user.role not in ['ADMIN', 'COORDINATOR'] and not request.user.is_staff:
            return Response(
                {'detail': 'Action réservée à l\'équipe de coordination.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            old_pairing = Pairing.objects.get(pk=pairing_id)
        except Pairing.DoesNotExist:
            return Response({'detail': 'Binôme introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        new_volunteer_id = request.data.get('new_volunteer_id')
        reason = request.data.get('reason', '').strip()
        weekly_frequency = request.data.get('weekly_frequency', '').strip() or old_pairing.weekly_frequency

        if not new_volunteer_id:
            return Response(
                {'detail': 'Veuillez sélectionner le nouveau bénévole.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            new_volunteer = User.objects.get(pk=new_volunteer_id, role=User.Role.VOLUNTEER)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Bénévole sélectionné introuvable ou invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_volunteer.id == old_pairing.volunteer.id:
            return Response(
                {'detail': 'Le nouveau bénévole doit être différent du tuteur actuel.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_volunteer = old_pairing.volunteer

        # 1. Clôture de l'ancien binôme avec conservation de toutes les traces
        old_pairing.status = Pairing.Status.COMPLETED
        old_pairing.end_date = timezone.now().date()
        old_pairing.save(update_fields=['status', 'end_date', 'updated_at'])

        PairingHistory.objects.create(
            pairing=old_pairing,
            action="Clôture pour transfert de binôme",
            performed_by=request.user,
            comment=f"Accompagnement clôturé pour réattribution à {new_volunteer.get_full_name() or new_volunteer.username}. Motif : {reason or 'Passation de relais'}"
        )

        # 2. Création du nouveau binôme actif pour l'élève
        new_pairing = Pairing.objects.create(
            student=old_pairing.student,
            volunteer=new_volunteer,
            coordinator=request.user,
            subject=old_pairing.subject,
            support_request=old_pairing.support_request,
            status=Pairing.Status.ACTIVE,
            weekly_frequency=weekly_frequency,
            general_goals=old_pairing.general_goals,
        )

        PairingHistory.objects.create(
            pairing=new_pairing,
            action="Prise de relais (Transfert)",
            performed_by=request.user,
            comment=f"Reprise de l'accompagnement après passation de {old_volunteer.get_full_name() or old_volunteer.username}. Motif : {reason or 'Passation de relais'}"
        )

        # 3. Notification par e-mail
        send_pairing_welcome_notification(new_pairing)

        return Response(PairingSerializer(new_pairing).data, status=status.HTTP_201_CREATED)

from apps.safeguarding.models import Alert

class RequestPairingChangeView(APIView):
    """
    Permet à une famille, un bénévole ou un coordinateur de solliciter
    le changement de bénévole pour un élève avec motif explicite.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pairing_id):
        try:
            pairing = Pairing.objects.get(pk=pairing_id)
        except Pairing.DoesNotExist:
            return Response({'detail': 'Binôme introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        is_parent = pairing.student.parent_id == user.id
        is_volunteer = pairing.volunteer_id == user.id
        is_staff = user.role in ['ADMIN', 'COORDINATOR'] or user.is_staff

        if not (is_parent or is_volunteer or is_staff):
            return Response(
                {'detail': 'Vous n\'êtes pas autorisé à demander la réattribution de ce binôme.'},
                status=status.HTTP_403_FORBIDDEN
            )

        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response(
                {'detail': 'Veuillez préciser le motif de la demande de changement.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Mise à jour statut binôme
        pairing.status = Pairing.Status.REASSIGNMENT_REQUESTED
        pairing.change_reason = reason
        pairing.save(update_fields=['status', 'change_reason', 'updated_at'])

        # 2. Mise à jour de la demande associée si présente
        if pairing.support_request:
            pairing.support_request.status = SupportRequest.Status.REASSIGNMENT_REQUESTED
            pairing.support_request.save(update_fields=['status', 'updated_at'])

        # 3. Journal d'historique
        PairingHistory.objects.create(
            pairing=pairing,
            action="Demande de changement de bénévole",
            performed_by=user,
            comment=f"Demande formulée par {user.get_full_name() or user.username} ({user.get_role_display()}). Motif : {reason}"
        )

        # 4. Alerte pour le coordinateur
        Alert.objects.create(
            alert_type=Alert.AlertType.PAIRING_INTERRUPTED,
            severity=Alert.Severity.WARNING,
            pairing=pairing,
            student=pairing.student,
            title=f"Demande de changement de tuteur : {pairing.student.anonymous_code}",
            description=f"La famille ou le tuteur sollicite une réattribution. Motif : {reason}"
        )

        return Response(PairingSerializer(pairing).data, status=status.HTTP_200_OK)

