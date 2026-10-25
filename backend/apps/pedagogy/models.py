import uuid
from django.db import models
from django.conf import settings

class Subject(models.Model):
    name = models.CharField('Matière', max_length=100, unique=True)
    category = models.CharField('Catégorie', max_length=100, default='Général')
    is_active = models.BooleanField('Actif', default=True)

    class Meta:
        verbose_name = 'Matière'
        verbose_name_plural = 'Matières'
        ordering = ['name']

    def __str__(self):
        return self.name

class Student(models.Model):
    class SchoolLevel(models.TextChoices):
        PRIMAIRE = 'PRIMAIRE', 'Primaire'
        COLLEGE = 'COLLEGE', 'Collège'
        LYCEE = 'LYCEE', 'Lycée'

    class Island(models.TextChoices):
        NGAZIDJA = 'NGAZIDJA', 'Grande Comore (Ngazidja)'
        NDZUWANI = 'NDZUWANI', 'Anjouan (Ndzuwani)'
        MWALI = 'MWALI', 'Mohéli (Mwali)'

    # Identifiant anonyme respectant la vie privée des mineurs
    anonymous_code = models.CharField('Code Anonymisé', max_length=30, unique=True, editable=False)
    first_name = models.CharField('Prénom de l\'élève', max_length=100)
    last_name_initial = models.CharField('Initiale du nom', max_length=10)
    birth_year = models.PositiveIntegerField('Année de naissance', null=True, blank=True)
    school_level = models.CharField('Niveau scolaire', max_length=20, choices=SchoolLevel.choices)
    grade = models.CharField('Classe (ex: CM2, 3ème, 1ère)', max_length=50)
    island = models.CharField('Île', max_length=20, choices=Island.choices, default=Island.NGAZIDJA)
    city = models.CharField('Ville / Village', max_length=100)
    school_name = models.CharField('Établissement scolaire', max_length=150, blank=True)
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='students',
        verbose_name='Parent ou Représentant légal'
    )
    parental_consent_granted = models.BooleanField('Autorisation parentale accordée', default=False)
    consent_date = models.DateTimeField('Date du consentement', auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Élève'
        verbose_name_plural = 'Élèves'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.anonymous_code:
            # Générer un code lisible type ELV-XXXX
            short_id = uuid.uuid4().hex[:6].upper()
            self.anonymous_code = f"ELV-{short_id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.anonymous_code} ({self.grade} - {self.get_island_display()})"

class SupportRequest(models.Model):
    class Urgency(models.TextChoices):
        LOW = 'LOW', 'Faible / Soutien continu'
        MEDIUM = 'MEDIUM', 'Moyenne / Lacunes constatées'
        HIGH = 'HIGH', 'Élevée / Difficultés majeures'
        EXAM = 'EXAM', 'Urgence Examen (Brevet, Baccalauréat)'

    class Format(models.TextChoices):
        REMOTE = 'REMOTE', 'À distance (en ligne)'
        IN_PERSON = 'IN_PERSON', 'En présentiel'
        EITHER = 'EITHER', 'Au choix (présentiel ou distance)'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En attente d\'évaluation'
        VALIDATED = 'VALIDATED', 'Validée par la coordination'
        IN_MATCHING = 'IN_MATCHING', 'Recherche de bénévole en cours'
        MATCHED = 'MATCHED', 'Bénévole attribué'
        REASSIGNMENT_REQUESTED = 'REASSIGNMENT_REQUESTED', 'Changement de tuteur demandé'
        CLOSED = 'CLOSED', 'Clôturée'
        REJECTED = 'REJECTED', 'Rejetée'

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='requests', verbose_name='Élève')
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submitted_requests',
        verbose_name='Demandeur'
    )
    subjects = models.ManyToManyField(Subject, verbose_name='Matières concernées')
    difficulties_description = models.TextField('Difficultés observées')
    pedagogical_goals = models.TextField('Objectifs d\'accompagnement visés', blank=True)
    format_preference = models.CharField('Format souhaité', max_length=20, choices=Format.choices, default=Format.EITHER)
    availabilities = models.CharField('Disponibilités hebdomadaires', max_length=255, blank=True)
    urgency = models.CharField('Niveau d\'urgence', max_length=20, choices=Urgency.choices, default=Urgency.MEDIUM)
    status = models.CharField('Statut de la demande', max_length=30, choices=Status.choices, default=Status.PENDING)
    coordinator_notes = models.TextField('Notes internes du coordinateur', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Demande de soutien'
        verbose_name_plural = 'Demandes de soutien'
        ordering = ['-created_at']

    def __str__(self):
        return f"Demande {self.student.anonymous_code} - {self.get_status_display()}"

class LearningObjective(models.Model):
    class Status(models.TextChoices):
        NOT_STARTED = 'NOT_STARTED', 'Non commencé'
        IN_PROGRESS = 'IN_PROGRESS', 'En cours'
        ACHIEVED = 'ACHIEVED', 'Atteint avec succès'

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='learning_objectives')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    description = models.CharField('Objectif pédagogique', max_length=255)
    status = models.CharField('Statut', max_length=20, choices=Status.choices, default=Status.NOT_STARTED)
    target_date = models.DateField('Échéance visée', null=True, blank=True)
    evaluation_notes = models.TextField('Bilan / Évaluation', blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Objectif pédagogique'
        verbose_name_plural = 'Objectifs pédagogiques'
        ordering = ['id']

    def __str__(self):
        return f"{self.student.anonymous_code} : {self.description} ({self.get_status_display()})"
