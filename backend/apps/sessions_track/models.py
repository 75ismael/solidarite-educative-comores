from django.db import models
from apps.matching.models import Pairing

class TutoringSession(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Planifiée'
        COMPLETED = 'COMPLETED', 'Réalisée'
        CANCELLED = 'CANCELLED', 'Annulée'
        MISSED = 'MISSED', 'Non réalisée / Absence'

    class Mode(models.TextChoices):
        REMOTE = 'REMOTE', 'À distance (téléphone / visio)'
        IN_PERSON = 'IN_PERSON', 'En présentiel'

    pairing = models.ForeignKey(Pairing, on_delete=models.CASCADE, related_name='sessions', verbose_name='Binôme')
    title = models.CharField('Sujet prévu / Titre de la séance', max_length=200)
    scheduled_at = models.DateTimeField('Date et heure prévues')
    duration_minutes = models.PositiveIntegerField('Durée estimée (minutes)', default=90)
    mode = models.CharField('Format', max_length=20, choices=Mode.choices, default=Mode.REMOTE)
    location_or_link = models.CharField('Lien ou lieu de la séance', max_length=255, default='WhatsApp / Téléphone')
    status = models.CharField('Statut', max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    cancellation_reason = models.CharField('Motif d\'annulation éventuel', max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Séance de tutorat'
        verbose_name_plural = 'Séances de tutorat'
        ordering = ['-scheduled_at']

    def __str__(self):
        return f"{self.title} - {self.pairing.student.anonymous_code} ({self.scheduled_at.strftime('%d/%m/%Y %H:%M')})"

class SessionReport(models.Model):
    class Attendance(models.TextChoices):
        PRESENT = 'PRESENT', 'Élève présent(e)'
        ABSENT_JUSTIFIED = 'ABSENT_JUSTIFIED', 'Absent(e) excusé(e)'
        ABSENT_UNJUSTIFIED = 'ABSENT_UNJUSTIFIED', 'Absence non justifiée'

    class UnderstandingLevel(models.IntegerChoices):
        MAJOR_STRUGGLE = 1, '1 - Difficultés majeures persistantes'
        PARTIAL = 2, '2 - Assimilation partielle'
        GOOD = 3, '3 - Bon niveau de compréhension'
        EXCELLENT = 4, '4 - Très bonne maîtrise des notions'

    session = models.OneToOneField(TutoringSession, on_delete=models.CASCADE, related_name='report', verbose_name='Séance')
    attendance = models.CharField('Présence de l\'élève', max_length=30, choices=Attendance.choices, default=Attendance.PRESENT)
    duration_actual_minutes = models.PositiveIntegerField('Durée effective (minutes)', default=90)
    topics_covered = models.TextField('Notions et chapitres travaillés')
    exercises_done = models.TextField('Exercices et méthodes abordés', blank=True)
    understanding_level = models.IntegerField('Niveau de compréhension observé', choices=UnderstandingLevel.choices, default=UnderstandingLevel.GOOD)
    remaining_difficulties = models.TextField('Difficultés restantes / Points de blocage', blank=True)
    next_steps = models.TextField('Recommandations / Programme de la prochaine séance', blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Compte rendu de séance'
        verbose_name_plural = 'Comptes rendus de séances'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"CR {self.session.title} - {self.get_attendance_display()}"
