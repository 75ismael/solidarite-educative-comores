from django.db import models
from django.conf import settings
from apps.pedagogy.models import Subject, SupportRequest

class VolunteerProfile(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'En attente de vérification'
        VERIFIED = 'VERIFIED', 'Vérifié et validé'
        REJECTED = 'REJECTED', 'Candidature refusée'

    class LevelChoice(models.TextChoices):
        PRIMAIRE = 'PRIMAIRE', 'Primaire'
        COLLEGE = 'COLLEGE', 'Collège'
        LYCEE = 'LYCEE', 'Lycée'
        TOUS = 'TOUS', 'Tous niveaux'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='volunteer_profile',
        verbose_name='Utilisateur'
    )
    subjects = models.ManyToManyField(Subject, verbose_name='Matières maîtrisées')
    levels_can_teach = models.CharField(
        'Niveaux enseignés',
        max_length=20,
        choices=LevelChoice.choices,
        default=LevelChoice.TOUS
    )
    languages = models.CharField('Langues maîtrisées', max_length=150, default='Français, Shicomori')
    profession_or_studies = models.CharField('Profession / Domaine d\'études', max_length=150, blank=True)
    experience = models.TextField('Expérience pédagogique ou associative', blank=True)
    availabilities = models.CharField('Disponibilités (créneaux)', max_length=255)
    hours_per_week = models.PositiveIntegerField('Heures par semaine engagées', default=2)
    verification_status = models.CharField(
        'Statut de vérification',
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    verification_notes = models.TextField('Notes du coordinateur (vérification)', blank=True)
    is_available_for_new_student = models.BooleanField('Disponible pour un nouvel élève', default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Profil Bénévole'
        verbose_name_plural = 'Profils Bénévoles'
        ordering = ['-created_at']

    def __str__(self):
        return f"Bénévole {self.user.get_full_name() or self.user.username} ({self.get_verification_status_display()})"

class PublicMission(models.Model):
    class Format(models.TextChoices):
        REMOTE = 'REMOTE', 'À distance (visio/téléphone)'
        IN_PERSON = 'IN_PERSON', 'En présentiel'
        EITHER = 'EITHER', 'Au choix'

    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Appel ouvert aux candidatures'
        FILLED = 'FILLED', 'Pourvue'
        CLOSED = 'CLOSED', 'Clôturée'

    title = models.CharField('Intitulé de la mission', max_length=255)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, verbose_name='Matière')
    school_level = models.CharField('Niveau scolaire', max_length=50)
    island = models.CharField('Zone / Île', max_length=50, default='Grande Comore (Ngazidja)')
    city = models.CharField('Localité (générale)', max_length=100, blank=True)
    format = models.CharField('Format', max_length=20, choices=Format.choices, default=Format.EITHER)
    description = models.TextField('Description anonymisée des besoins')
    expected_commitment = models.CharField('Engagement attendu', max_length=100, default='1h30 à 2h par semaine')
    status = models.CharField('Statut', max_length=20, choices=Status.choices, default=Status.OPEN)
    related_request = models.ForeignKey(
        SupportRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='public_missions'
    )
    deadline = models.DateField('Date limite de candidature', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Mission / Appel à bénévoles'
        verbose_name_plural = 'Missions / Appels à bénévoles'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.island})"

class MissionApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En cours d\'examen'
        ACCEPTED = 'ACCEPTED', 'Candidature retenue'
        DECLINED = 'DECLINED', 'Non retenue'

    mission = models.ForeignKey(PublicMission, on_delete=models.CASCADE, related_name='applications')
    volunteer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    motivation = models.TextField('Message de motivation / Disponibilités')
    status = models.CharField('Statut', max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Candidature à une mission'
        verbose_name_plural = 'Candidatures aux missions'
        unique_together = ('mission', 'volunteer')
        ordering = ['-created_at']

    def __str__(self):
        return f"Candidature de {self.volunteer} pour {self.mission.title}"
