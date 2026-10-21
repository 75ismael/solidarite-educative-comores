from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        VISITOR = 'VISITOR', 'Visiteur'
        PARENT = 'PARENT', 'Parent / Représentant légal'
        TEACHER = 'TEACHER', 'Enseignant / Référent scolaire'
        VOLUNTEER = 'VOLUNTEER', 'Bénévole'
        COORDINATOR = 'COORDINATOR', 'Coordinateur'
        SAFEGUARDING_OFFICER = 'SAFEGUARDING_OFFICER', 'Responsable protection des mineurs'
        FINANCIAL_OFFICER = 'FINANCIAL_OFFICER', 'Responsable financier'
        ADMIN = 'ADMIN', 'Administrateur'

    class Island(models.TextChoices):
        NGAZIDJA = 'NGAZIDJA', 'Grande Comore (Ngazidja)'
        NDZUWANI = 'NDZUWANI', 'Anjouan (Ndzuwani)'
        MWALI = 'MWALI', 'Mohéli (Mwali)'
        FRANCE = 'FRANCE', 'France (Coordination/Diaspora)'
        AUTRE = 'AUTRE', 'Autre'

    email = models.EmailField('Adresse e-mail', unique=True)
    role = models.CharField(
        'Rôle',
        max_length=30,
        choices=Role.choices,
        default=Role.PARENT
    )
    phone = models.CharField('Téléphone', max_length=30, blank=True)
    island = models.CharField(
        'Île / Localisation',
        max_length=20,
        choices=Island.choices,
        default=Island.NGAZIDJA
    )
    city = models.CharField('Ville / Village', max_length=100, blank=True)
    is_verified = models.BooleanField('Profil vérifié', default=False)
    safeguarding_signed = models.BooleanField(
        'Charte de protection des mineurs signée',
        default=False
    )
    bio = models.TextField('Biographie / Présentation', blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-date_joined']

    def __str__(self):
        full_name = self.get_full_name()
        return f"{full_name or self.username} ({self.get_role_display()})"
