from django.db import models
from django.conf import settings
from apps.pedagogy.models import Student, Subject, SupportRequest

class Pairing(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Binôme actif'
        PAUSED = 'PAUSED', 'En pause / Suspendu'
        REASSIGNMENT_REQUESTED = 'REASSIGNMENT_REQUESTED', 'Changement de tuteur demandé'
        COMPLETED = 'COMPLETED', 'Mission terminée'
        CANCELLED = 'CANCELLED', 'Interrompu'

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='pairings', verbose_name='Élève')
    volunteer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='volunteer_pairings',
        verbose_name='Bénévole'
    )
    coordinator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='coordinated_pairings',
        verbose_name='Coordinateur référent'
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, verbose_name='Matière principale')
    support_request = models.ForeignKey(
        SupportRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resulting_pairings'
    )
    status = models.CharField('Statut du binôme', max_length=30, choices=Status.choices, default=Status.ACTIVE)
    change_reason = models.TextField('Motif de demande de changement', blank=True)
    start_date = models.DateField('Date de début de l\'accompagnement', auto_now_add=True)
    end_date = models.DateField('Date de fin', null=True, blank=True)
    weekly_frequency = models.CharField('Rythme convenu', max_length=150, default='1 séance de 1h30 par semaine')
    general_goals = models.TextField('Objectifs pédagogiques prioritaires', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Binôme (Élève - Bénévole)'
        verbose_name_plural = 'Binômes'
        ordering = ['-created_at']

    def __str__(self):
        return f"Binôme: {self.student.anonymous_code} & {self.volunteer.get_full_name() or self.volunteer.username} ({self.subject.name})"

class PairingHistory(models.Model):
    pairing = models.ForeignKey(Pairing, on_delete=models.CASCADE, related_name='history')
    action = models.CharField('Action', max_length=100)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    comment = models.TextField('Motif / Détails')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Historique du binôme'
        verbose_name_plural = 'Historiques des binômes'
        ordering = ['-timestamp']

class LiaisonNote(models.Model):
    """
    Carnet de liaison et échanges encadrés (F11) :
    Permet au tuteur bénévole, à la famille et au coordinateur
    d'échanger des consignes et encouragements sans divulguer de données privées.
    """
    pairing = models.ForeignKey(Pairing, on_delete=models.CASCADE, related_name='notes', verbose_name='Binôme')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='liaison_notes', verbose_name='Auteur')
    message = models.TextField('Message / Consigne')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Note de liaison'
        verbose_name_plural = 'Carnet de liaison (Messages)'
        ordering = ['created_at']

    def __str__(self):
        return f"Note de {self.author} pour {self.pairing} ({self.created_at.strftime('%d/%m/%Y')})"
