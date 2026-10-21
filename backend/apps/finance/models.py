from django.db import models
from django.conf import settings

class Donation(models.Model):
    class Currency(models.TextChoices):
        EUR = 'EUR', 'Euro (€)'
        KMF = 'KMF', 'Franc comorien (KMF)'

    class Status(models.TextChoices):
        PLEDGED = 'PLEDGED', 'Promesse de don'
        RECEIVED = 'RECEIVED', 'Don encaissé et vérifié'

    donor_name = models.CharField('Nom du donateur ou entreprise', max_length=150, default='Donateur anonyme')
    donor_email = models.EmailField('Email du donateur (confidentiel)', blank=True)
    is_anonymous = models.BooleanField('Donateur anonyme sur la page publique', default=False)
    amount = models.DecimalField('Montant', max_digits=12, decimal_places=2)
    currency = models.CharField('Devise', max_length=10, choices=Currency.choices, default=Currency.EUR)
    amount_eur = models.DecimalField('Équivalent en Euros', max_digits=12, decimal_places=2, default=0.0)
    status = models.CharField('Statut', max_length=20, choices=Status.choices, default=Status.RECEIVED)
    allocation = models.CharField('Affectation / Projet soutenu', max_length=150, default='Soutien scolaire général')
    payment_method = models.CharField('Moyen de versement (Virement, Carte, Espèces)', max_length=100, default='Virement bancaire')
    received_at = models.DateField('Date d\'encaissement')
    notes = models.TextField('Notes internes / Référence comptable', blank=True)

    class Meta:
        verbose_name = 'Don reçu'
        verbose_name_plural = 'Dons reçus'
        ordering = ['-received_at']

    def save(self, *args, **kwargs):
        # Conversion indicative KMF -> EUR (1 EUR ~ 492 KMF)
        if self.currency == 'EUR':
            self.amount_eur = self.amount
        elif self.currency == 'KMF':
            self.amount_eur = round(self.amount / 491.96, 2)
        super().save(*args, **kwargs)

    def __str__(self):
        display_name = "Donateur anonyme" if self.is_anonymous else self.donor_name
        return f"{display_name} - {self.amount} {self.currency} ({self.get_status_display()})"

class Expense(models.Model):
    class Category(models.TextChoices):
        CONNECTIVITY = 'CONNECTIVITY', 'Connectivité Internet & Forfaits téléphones'
        PEDAGOGY = 'PEDAGOGY', 'Manuels scolaires, fournitures et copies'
        DIGITAL_TOOLS = 'DIGITAL_TOOLS', 'Hébergement web & outils numériques'
        LOCAL_LOGISTICS = 'LOCAL_LOGISTICS', 'Déplacements & logistique locale'
        TRAINING = 'TRAINING', 'Formation et encadrement des bénévoles'
        OTHER = 'OTHER', 'Frais administratifs et bancaires'

    title = models.CharField('Objet de la dépense', max_length=200)
    category = models.CharField('Catégorie de dépense', max_length=30, choices=Category.choices)
    amount = models.DecimalField('Montant', max_digits=12, decimal_places=2)
    currency = models.CharField('Devise', max_length=10, default='EUR')
    amount_eur = models.DecimalField('Montant en Euros', max_digits=12, decimal_places=2, default=0.0)
    spent_at = models.DateField('Date de la dépense')
    receipt_reference = models.CharField('N° de facture ou justificatif', max_length=100, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Vérifié par (Responsable financier)'
    )
    is_publicly_auditable = models.BooleanField('Afficher dans le registre public de transparence', default=True)

    class Meta:
        verbose_name = 'Dépense engagée'
        verbose_name_plural = 'Dépenses engagées'
        ordering = ['-spent_at']

    def save(self, *args, **kwargs):
        if self.currency == 'EUR':
            self.amount_eur = self.amount
        elif self.currency == 'KMF':
            self.amount_eur = round(self.amount / 491.96, 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} : {self.amount} {self.currency} ({self.get_category_display()})"

class FinancialCampaign(models.Model):
    title = models.CharField('Titre de la campagne', max_length=200)
    description = models.TextField('Description et objectifs concrets')
    target_amount_eur = models.DecimalField('Objectif de collecte (€)', max_digits=12, decimal_places=2)
    start_date = models.DateField('Date de début')
    end_date = models.DateField('Date de fin visée')
    is_active = models.BooleanField('Campagne en cours', default=True)

    class Meta:
        verbose_name = 'Campagne de collecte'
        verbose_name_plural = 'Campagnes de collecte'

    def __str__(self):
        return f"{self.title} (Objectif: {self.target_amount_eur} €)"
