from django.db import models
from django.utils.text import slugify

class PageContent(models.Model):
    slug = models.SlugField('Identifiant unique (slug)', unique=True, max_length=100)
    title = models.CharField('Titre de la page', max_length=200)
    subtitle = models.CharField('Sous-titre / Accroche', max_length=300, blank=True)
    content = models.TextField('Contenu principal (Markdown ou HTML)', blank=True)
    meta_description = models.CharField('Description SEO', max_length=255, blank=True)
    is_published = models.BooleanField('Publié', default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Page CMS'
        verbose_name_plural = 'Pages CMS'
        ordering = ['slug']

    def __str__(self):
        return f"{self.title} ({self.slug})"

class Article(models.Model):
    class Category(models.TextChoices):
        NEWS = 'NEWS', 'Actualité du projet'
        PEDAGOGY = 'PEDAGOGY', 'Pédagogie & Méthodes'
        COMMUNITY = 'COMMUNITY', 'Vie associative & Témoignages'

    title = models.CharField('Titre', max_length=255)
    slug = models.SlugField('Slug', unique=True, max_length=255, blank=True)
    category = models.CharField('Catégorie', max_length=20, choices=Category.choices, default=Category.NEWS)
    excerpt = models.TextField('Extrait / Résumé', max_length=400)
    content = models.TextField('Contenu complet')
    image_url = models.URLField('Image d\'illustration (URL)', blank=True)
    author_name = models.CharField('Nom de l\'auteur', max_length=100, default='Équipe Solidarité')
    is_published = models.BooleanField('Publié', default=True)
    published_at = models.DateTimeField('Date de publication', auto_now_add=True)

    class Meta:
        verbose_name = 'Article / Actualité'
        verbose_name_plural = 'Articles & Actualités'
        ordering = ['-published_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class KeyMetric(models.Model):
    label = models.CharField('Intitulé', max_length=100)
    value = models.CharField('Valeur (ex: 120+, 95%)', max_length=50)
    icon = models.CharField('Nom d\'icône (ex: Users, BookOpen, Heart, Award)', max_length=50, default='BookOpen')
    description = models.CharField('Explication complémentaire', max_length=200, blank=True)
    order = models.PositiveIntegerField('Ordre d\'affichage', default=0)
    is_active = models.BooleanField('Actif', default=True)

    class Meta:
        verbose_name = 'Indicateur clé d\'impact'
        verbose_name_plural = 'Indicateurs clés d\'impact'
        ordering = ['order']

    def __str__(self):
        return f"{self.label} : {self.value}"

class Testimonial(models.Model):
    class RoleType(models.TextChoices):
        VOLUNTEER = 'VOLUNTEER', 'Bénévole / Tuteur'
        STUDENT = 'STUDENT', 'Élève / Étudiant accompagné'
        PARENT = 'PARENT', 'Parent d\'élève'
        COORDINATOR = 'COORDINATOR', 'Équipe encadrante / Partenaire'

    name = models.CharField('Nom / Prénom', max_length=100)
    role = models.CharField('Statut (ex: Parent à Moroni, Bénévole en Mathématiques)', max_length=150)
    role_type = models.CharField(
        'Type d\'intervenant',
        max_length=20,
        choices=RoleType.choices,
        default=RoleType.VOLUNTEER
    )
    quote = models.TextField('Témoignage')
    photo = models.ImageField('Photo de profil (upload)', upload_to='testimonials/', blank=True, null=True)
    avatar_url = models.URLField('URL externe photo / avatar', blank=True, help_text="Lien image ou photo hébergée")
    location = models.CharField('Localité (ex: Moroni, Anjouan, Paris)', max_length=100, blank=True)
    mission = models.ForeignKey(
        'volunteering.PublicMission',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='testimonials',
        verbose_name='Mission associée'
    )
    rating = models.PositiveSmallIntegerField('Note / Satisfaction (1 à 5)', default=5)
    is_featured = models.BooleanField('Mettre en avant sur l\'accueil', default=True)
    is_published = models.BooleanField('Publié sur le site', default=True)
    order = models.PositiveIntegerField('Ordre d\'affichage', default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Témoignage'
        verbose_name_plural = 'Témoignages'
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"{self.name} ({self.role})"

class FAQItem(models.Model):
    question = models.CharField('Question', max_length=300)
    answer = models.TextField('Réponse')
    category = models.CharField('Catégorie', max_length=100, default='Général')
    order = models.PositiveIntegerField('Ordre', default=0)
    is_published = models.BooleanField('Publié', default=True)

    class Meta:
        verbose_name = 'Question FAQ'
        verbose_name_plural = 'FAQ'
        ordering = ['order']

    def __str__(self):
        return self.question

class ContactMessage(models.Model):
    name = models.CharField('Nom complet', max_length=150)
    email = models.EmailField('Adresse e-mail')
    phone = models.CharField('Téléphone / WhatsApp', max_length=50, blank=True)
    subject = models.CharField('Objet du message', max_length=200)
    message = models.TextField('Message')
    is_addressed = models.BooleanField('Traité', default=False)
    created_at = models.DateTimeField('Date de réception', auto_now_add=True)

    class Meta:
        verbose_name = 'Message de contact'
        verbose_name_plural = 'Messages de contact'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} - {self.name} ({self.created_at.strftime('%d/%m/%Y')})"

class Partner(models.Model):
    class Category(models.TextChoices):
        INSTITUTIONAL = 'INSTITUTIONAL', 'Partenaire Institutionnel'
        EDUCATION = 'EDUCATION', 'Éducation & Université'
        ASSOCIATION = 'ASSOCIATION', 'Association & Collectif'
        CORPORATE = 'CORPORATE', 'Mécénat & Entreprise'
        TECH = 'TECH', 'Connectivité & Numérique'

    name = models.CharField('Nom du partenaire / Entreprise', max_length=150)
    category = models.CharField(
        'Catégorie',
        max_length=30,
        choices=Category.choices,
        default=Category.CORPORATE
    )
    logo_url = models.URLField('URL du logo ou visuel', blank=True)
    website_url = models.URLField('Lien officiel du site web', blank=True)
    description = models.CharField(
        'Rôle ou apport dans le partenariat',
        max_length=255,
        blank=True,
        help_text="Ex: Mise à disposition de locaux, dotation de matériel, connectivité 4G"
    )
    contact_name = models.CharField('Nom du contact entreprise', max_length=120, blank=True)
    contact_email = models.EmailField('Email du contact pour validation', blank=True)
    contact_phone = models.CharField('Téléphone du contact', max_length=30, blank=True)
    order = models.PositiveIntegerField('Ordre d\'affichage', default=0)
    is_active = models.BooleanField(
        'Validé & affiché sur le site par l\'admin',
        default=False,
        help_text="Cochez cette case pour afficher publiquement le logo après validation par l'administrateur."
    )
    created_at = models.DateTimeField('Date de création / inscription', auto_now_add=True)

    class Meta:
        verbose_name = 'Partenaire / Entreprise'
        verbose_name_plural = 'Partenaires & Entreprises mécènes'
        ordering = ['order', 'name']

    def __str__(self):
        status = "En ligne" if self.is_active else "En attente admin"
        return f"{self.name} ({self.get_category_display()}) - [{status}]"

class Milestone(models.Model):
    year = models.CharField('Année ou période (ex: 2024, 2026, 2027+)', max_length=50)
    title = models.CharField('Titre du jalon historique', max_length=200)
    tag = models.CharField('Badge d\'étape (ex: Genèse, Pilote, Plateforme, Vision)', max_length=50, blank=True)
    description = models.TextField('Récit de cette étape historique')
    order = models.PositiveIntegerField('Ordre chronologique', default=0)
    is_active = models.BooleanField('Visible sur la frise', default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Jalon historique (Notre Histoire)'
        verbose_name_plural = 'Frise chronologique (Notre Histoire)'
        ordering = ['order', 'year']

    def __str__(self):
        return f"{self.year} - {self.title}"
