import uuid
from django.db import models
from django.conf import settings
from apps.matching.models import Pairing
from apps.pedagogy.models import Student

class Alert(models.Model):
    class AlertType(models.TextChoices):
        ABSENCE_REPEATED = 'ABSENCE_REPEATED', 'Absence répétée de l\'élève'
        REPORT_OVERDUE = 'REPORT_OVERDUE', 'Compte rendu non remis'
        INACTIVITY = 'INACTIVITY', 'Inactivité prolongée du binôme'
        PAIRING_INTERRUPTED = 'PAIRING_INTERRUPTED', 'Interruption de communication'
        PEDAGOGICAL_STAGNATION = 'PEDAGOGICAL_STAGNATION', 'Difficultés persistantes signalées'
        OTHER = 'OTHER', 'Autre vigilance'

    class Severity(models.TextChoices):
        INFO = 'INFO', 'Information / Suivi léger'
        WARNING = 'WARNING', 'Avertissement / Action requise'
        CRITICAL = 'CRITICAL', 'Urgent / Risque'

    alert_type = models.CharField('Type d\'alerte', max_length=30, choices=AlertType.choices)
    severity = models.CharField('Niveau de sévérité', max_length=20, choices=Severity.choices, default=Severity.INFO)
    pairing = models.ForeignKey(Pairing, on_delete=models.CASCADE, null=True, blank=True, related_name='alerts')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True, related_name='alerts')
    title = models.CharField('Titre de l\'alerte', max_length=255)
    description = models.TextField('Description de la situation')
    is_resolved = models.BooleanField('Résolu', default=False)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_alerts',
        verbose_name='Responsable désigné'
    )
    resolution_notes = models.TextField('Mesures prises et résolution', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Alerte opérationnelle'
        verbose_name_plural = 'Alertes opérationnelles'
        ordering = ['is_resolved', '-created_at']

    def __str__(self):
        return f"[{self.get_severity_display()}] {self.title}"

class ConfidentialReport(models.Model):
    """
    Canal confidentiel de protection des mineurs (F15).
    Accès STRICTEMENT limité au Responsable de protection des mineurs.
    """
    class Category(models.TextChoices):
        SAFETY_CONCERN = 'SAFETY_CONCERN', 'Inquiétude relative à la sécurité d\'un mineur'
        BEHAVIOR = 'BEHAVIOR', 'Comportement suspect ou inapproprié'
        EMERGENCY = 'EMERGENCY', 'Urgence familiale ou scolaire grave'
        ETHICAL_BREACH = 'ETHICAL_BREACH', 'Manquement à la charte éthique'

    class Status(models.TextChoices):
        NEW = 'NEW', 'Nouveau signalement'
        UNDER_INVESTIGATION = 'UNDER_INVESTIGATION', 'En cours de traitement confidentiel'
        ACTION_TAKEN = 'ACTION_TAKEN', 'Mesures de protection déployées'
        CLOSED = 'CLOSED', 'Dossier clos'

    report_number = models.CharField('Numéro de dossier', max_length=30, unique=True, editable=False)
    reporter_name = models.CharField('Nom du déclarant (facultatif / anonyme)', max_length=150, blank=True)
    reporter_contact = models.CharField('Contact du déclarant (téléphone ou e-mail)', max_length=150, blank=True)
    reporter_role = models.CharField('Rôle du déclarant (Parent, Bénévole, Enseignant, Autre)', max_length=100)
    category = models.CharField('Type d\'incident / Risque', max_length=30, choices=Category.choices)
    details = models.TextField('Description détaillée des faits constatés')
    status = models.CharField('Statut de traitement', max_length=30, choices=Status.choices, default=Status.NEW)
    investigation_log = models.TextField('Journal des décisions et mesures prises (Confidentiel)', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Signalement Confidentiel (Protection Mineurs)'
        verbose_name_plural = 'Signalements Confidentiels (Protection Mineurs)'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.report_number:
            short_id = uuid.uuid4().hex[:6].upper()
            self.report_number = f"SIG-{short_id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.report_number} - {self.get_category_display()} ({self.get_status_display()})"
