from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.cms.models import PageContent, Article, KeyMetric, Testimonial, FAQItem
from apps.pedagogy.models import Subject, Student, SupportRequest, LearningObjective
from apps.volunteering.models import VolunteerProfile, PublicMission, MissionApplication
from apps.matching.models import Pairing, PairingHistory, LiaisonNote
from apps.sessions_track.models import TutoringSession, SessionReport
from apps.safeguarding.models import Alert, ConfidentialReport
from apps.finance.models import Donation, Expense, FinancialCampaign

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed initial demonstration data for the Comoros Educational Solidarity Platform'

    def handle(self, *args, **options):
        self.stdout.write("Initialisation des données de démonstration...")

        # 1. Utilisateurs
        admin, _ = User.objects.get_or_create(
            email='admin@benevolat.km',
            defaults={
                'username': 'admin',
                'first_name': 'Admin',
                'last_name': 'Système',
                'role': User.Role.ADMIN,
                'island': User.Island.FRANCE,
                'city': 'Paris',
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
                'safeguarding_signed': True
            }
        )
        admin.set_password('admin1234')
        admin.save()

        coordinator, _ = User.objects.get_or_create(
            email='coordinateur@benevolat.km',
            defaults={
                'username': 'coordinateur',
                'first_name': 'Nassur',
                'last_name': 'Ali',
                'role': User.Role.COORDINATOR,
                'island': User.Island.NGAZIDJA,
                'city': 'Moroni',
                'is_staff': True,
                'is_verified': True,
                'safeguarding_signed': True,
                'bio': 'Coordinateur pédagogique du programme pilote à Moroni.'
            }
        )
        coordinator.set_password('pass1234')
        coordinator.save()

        safeguarding_officer, _ = User.objects.get_or_create(
            email='protection@benevolat.km',
            defaults={
                'username': 'protection',
                'first_name': 'Dr. Mariama',
                'last_name': 'Mbae',
                'role': User.Role.SAFEGUARDING_OFFICER,
                'island': User.Island.NGAZIDJA,
                'city': 'Moroni',
                'is_staff': True,
                'is_verified': True,
                'safeguarding_signed': True,
                'bio': 'Référente protection de l\'enfance et éthique des accompagnements.'
            }
        )
        safeguarding_officer.set_password('pass1234')
        safeguarding_officer.save()

        financial_officer, _ = User.objects.get_or_create(
            email='finances@benevolat.km',
            defaults={
                'username': 'finances',
                'first_name': 'Karim',
                'last_name': 'Soilihi',
                'role': User.Role.FINANCIAL_OFFICER,
                'island': User.Island.FRANCE,
                'city': 'Marseille',
                'is_staff': True,
                'is_verified': True,
                'safeguarding_signed': True
            }
        )
        financial_officer.set_password('pass1234')
        financial_officer.save()

        # Bénévoles
        vol1, _ = User.objects.get_or_create(
            email='aminata.benevole@benevolat.km',
            defaults={
                'username': 'aminata_b',
                'first_name': 'Aminata',
                'last_name': 'Mohamed',
                'role': User.Role.VOLUNTEER,
                'island': User.Island.NGAZIDJA,
                'city': 'Moroni',
                'is_verified': True,
                'safeguarding_signed': True,
                'bio': 'Étudiante en Master de Sciences Physiques et Mathématiques, passionnée par la transmission du savoir.'
            }
        )
        vol1.set_password('pass1234')
        vol1.save()

        vol2, _ = User.objects.get_or_create(
            email='said.benevole@benevolat.km',
            defaults={
                'username': 'said_b',
                'first_name': 'Saïd',
                'last_name': 'Ahmed',
                'role': User.Role.VOLUNTEER,
                'island': User.Island.NDZUWANI,
                'city': 'Mutsamudu',
                'is_verified': True,
                'safeguarding_signed': True,
                'bio': 'Enseignant retraité de Lettres modernes et Français.'
            }
        )
        vol2.set_password('pass1234')
        vol2.save()

        # Parents
        parent1, _ = User.objects.get_or_create(
            email='fatima.parent@benevolat.km',
            defaults={
                'username': 'fatima_p',
                'first_name': 'Fatima',
                'last_name': 'Ibrahim',
                'role': User.Role.PARENT,
                'island': User.Island.NGAZIDJA,
                'city': 'Moroni - Coulée',
                'phone': '+269 332 11 22',
                'is_verified': True,
                'safeguarding_signed': True
            }
        )
        parent1.set_password('pass1234')
        parent1.save()

        # 2. Matières
        matieres = [
            'Mathématiques', 'Français', 'Sciences & SVT',
            'Physique-Chimie', 'Histoire-Géographie', 'Anglais', 'Arabe'
        ]
        subject_objs = {}
        for m_name in matieres:
            s_obj, _ = Subject.objects.get_or_create(name=m_name)
            subject_objs[m_name] = s_obj

        # 3. Profils Bénévoles
        prof1, _ = VolunteerProfile.objects.get_or_create(
            user=vol1,
            defaults={
                'levels_can_teach': VolunteerProfile.LevelChoice.TOUS,
                'languages': 'Français, Shicomori',
                'profession_or_studies': 'Master Sciences Physiques',
                'experience': '2 ans de cours de soutien bénévole pour les élèves de 3ème.',
                'availabilities': 'Mercredi après-midi et Samedi matin',
                'hours_per_week': 3,
                'verification_status': VolunteerProfile.VerificationStatus.VERIFIED,
                'is_available_for_new_student': True
            }
        )
        prof1.subjects.set([subject_objs['Mathématiques'], subject_objs['Physique-Chimie']])

        prof2, _ = VolunteerProfile.objects.get_or_create(
            user=vol2,
            defaults={
                'levels_can_teach': VolunteerProfile.LevelChoice.COLLEGE,
                'languages': 'Français, Shicomori, Arabe',
                'profession_or_studies': 'Professeur de Français',
                'experience': 'Plus de 20 ans d\'enseignement en collège et lycée à Anjouan.',
                'availabilities': 'Mardi et Jeudi soir',
                'hours_per_week': 2,
                'verification_status': VolunteerProfile.VerificationStatus.VERIFIED,
                'is_available_for_new_student': True
            }
        )
        prof2.subjects.set([subject_objs['Français'], subject_objs['Histoire-Géographie']])

        # 4. Élèves
        student1, _ = Student.objects.get_or_create(
            first_name='Salim',
            last_name_initial='I.',
            parent=parent1,
            defaults={
                'school_level': Student.SchoolLevel.COLLEGE,
                'grade': 'Classe de 3ème',
                'island': Student.Island.NGAZIDJA,
                'city': 'Moroni',
                'school_name': 'Collège de Moroni',
                'birth_year': 2011,
                'parental_consent_granted': True
            }
        )

        student2, _ = Student.objects.get_or_create(
            first_name='Amina',
            last_name_initial='M.',
            parent=parent1,
            defaults={
                'school_level': Student.SchoolLevel.PRIMAIRE,
                'grade': 'CM2',
                'island': Student.Island.NGAZIDJA,
                'city': 'Moroni',
                'school_name': 'École Primaire de Mtsangani',
                'birth_year': 2015,
                'parental_consent_granted': True
            }
        )

        # 5. Demandes de soutien
        req1, _ = SupportRequest.objects.get_or_create(
            student=student1,
            defaults={
                'requested_by': parent1,
                'difficulties_description': 'Difficultés de méthode et de calcul en algèbre et géométrie. Brevet en fin d\'année scolaire.',
                'pedagogical_goals': 'Consolider les bases de factorisation et réussir les épreuves de contrôle continu.',
                'format_preference': SupportRequest.Format.EITHER,
                'availabilities': 'Mercredi après-midi ou Samedi matin',
                'urgency': SupportRequest.Urgency.EXAM,
                'status': SupportRequest.Status.MATCHED,
                'coordinator_notes': 'Demande urgente validée. Échéance Brevet.'
            }
        )
        req1.subjects.set([subject_objs['Mathématiques']])

        req2, _ = SupportRequest.objects.get_or_create(
            student=student2,
            defaults={
                'requested_by': parent1,
                'difficulties_description': 'Lecture fluide et conjugaison des temps du passé en français.',
                'pedagogical_goals': 'Améliorer l\'expression écrite et la confiance en soi avant l\'entrée en 6ème.',
                'format_preference': SupportRequest.Format.REMOTE,
                'availabilities': 'Samedi après-midi ou Dimanche',
                'urgency': SupportRequest.Urgency.MEDIUM,
                'status': SupportRequest.Status.IN_MATCHING,
                'coordinator_notes': 'En attente d\'attribution de bénévole disponible pour le primaire.'
            }
        )
        req2.subjects.set([subject_objs['Français']])

        # 6. Missions publiques (F04 anonymisées style JeVeuxAider)
        mission1, _ = PublicMission.objects.get_or_create(
            title="Je suis étudiant et je réalise du tutorat en collège 2h/semaine",
            defaults={
                'published_by': "Ebru B., Ayoub B.",
                'organization_name': "Solidarité Éducative Comores",
                'organization_description': "Créée pour lutter contre les fractures scolaires, Solidarité Éducative agit à travers des programmes d'accompagnement bénévole en ligne et en présentiel dans les établissements partenaires aux Comores. Notre méthode simple et éprouvée : un bénévole accompagne 1h30 à 2h par semaine un élève pour consolider ses bases, développer sa méthode et lui redonner confiance.",
                'activity_type': "Soutien scolaire & Tutorat",
                'target_public': "Collégiens (6e à 3e - Préparation Brevet)",
                'subject': subject_objs['Français'],
                'school_level': 'Collège (3ème)',
                'island': 'Grande Comore (Ngazidja)',
                'city': 'Moroni, Iconi, Mitsamiouli',
                'intervention_zone_details': "Moroni : Collège de Moroni Sud • Iconi : Collège Communal • Mitsamiouli : Collège Rural • Antenne en ligne",
                'format': PublicMission.Format.EITHER,
                'prerequisites': "Mission ouverte aux étudiants, enseignants et professionnels bienveillants. Maîtrise des fondamentaux du français et pédagogie patiente.",
                'description': "Accompagnement méthodique d'un petit groupe d'élèves de collège pour préparer leur brevet et surmonter leurs difficultés en lecture et expression écrite.",
                'presentation_full': """Bonjour,
Tout d'abord nous vous remercions de prendre ce temps pour nous lire :)

L'association recherche des bénévoles engagés pour intégrer notre programme de tutorat dans les collèges partenaires. Nous proposons d'intervenir, selon vos disponibilités, à travers un rendez-vous hebdomadaire de 1h30 à 2h pour accompagner un élève ou un petit groupe de la 6e à la 3e dans leur réussite scolaire.

Qu'est-ce que cette réussite ?
Pour notre équipe, c'est réduire les inégalités scolaires en agissant sur la motivation, la méthode de travail développée par vos élèves et la régularité de vos rendez-vous ! Les bénéfices sont multiples : des progrès académiques concrets, un éveil culturel et un repère bienveillant.

Pour nos bénévoles, les compétences développées sont valorisables dans le monde professionnel et l'expérience humaine restera gravée comme un formidable marqueur d'impact social.""",
                'steps_to_join': """Rassurez-vous, notre équipe locale organise une réunion d'information préalable pour répondre à toutes vos questions avant tout engagement.
Une rapide formation aux outils méthodologiques et à la charte éthique sera dispensée.
Enfin, notre coordinateur vous accompagne tout au long de l'année scolaire.""",
                'practical_details': """Vous n'êtes pas seuls ! Notre équipe vous accueille dans l'établissement ou vous guide pour les séances en visiophonie/téléphone. Nous partageons des ressources adaptées et assurons des points d'étape réguliers.
Il n'y a pas d'accompagnement les dimanches et jours fériés.""",
                'benefits': "Attestation officielle d'engagement bénévole et de compétences transversales développées délivrée en fin d'année.",
                'expected_commitment': '2h par semaine',
                'status': PublicMission.Status.OPEN,
                'related_request': req2,
                'deadline': date.today() + timedelta(days=21)
            }
        )

        mission2, _ = PublicMission.objects.get_or_create(
            title="Accompagnement en Sciences Physiques - Lycée (Terminale C/D)",
            defaults={
                'published_by': "Dr. Nassim M., Coordination Bac",
                'organization_name': "Lycée Saïd Mohamed Cheikh",
                'organization_description': "Établissement d'enseignement secondaire de référence aux Comores, partenaire du réseau Solidarité Éducative pour le mentorat des séries scientifiques.",
                'activity_type': "Mentorat scientifique intensif",
                'target_public': "Lycéens en Terminale Scientifique (C & D)",
                'subject': subject_objs['Physique-Chimie'],
                'school_level': 'Lycée (Terminale)',
                'island': 'Anjouan (Ndzuwani)',
                'city': 'Mutsamudu',
                'intervention_zone_details': "Mutsamudu : Lycée Technique et Général • Domoni : Salle d'étude communale • Formule distancielle pour la diaspora",
                'format': PublicMission.Format.EITHER,
                'prerequisites': "Étudiants en sciences, élèves-ingénieurs ou professeurs de physique-chimie. Rigueur scientifique et capacité de vulgarisation.",
                'description': "Préparation intensive au Baccalauréat comorien : révision des notions d'optique, de mécanique newtonienne, d'électricité et cinétique chimique.",
                'presentation_full': "Offrez à un futur bachelier l'accompagnement nécessaire pour décrocher sa mention au Bac et réussir son orientation vers l'enseignement supérieur.",
                'steps_to_join': "Entretien pédagogique préalable avec le coordinateur scientifique et transmission des sujets d'annales corrigés.",
                'practical_details': "Séances de 2h le samedi matin ou créneaux flexibles en semaine en distanciel.",
                'benefits': "Reconnaissance académique et mise en réseau avec les équipes éducatives comoriennes.",
                'expected_commitment': '2h par semaine',
                'status': PublicMission.Status.OPEN,
                'deadline': date.today() + timedelta(days=14)
            }
        )

        # 7. Binôme (Matching validé F06)
        pairing1, _ = Pairing.objects.get_or_create(
            student=student1,
            volunteer=vol1,
            subject=subject_objs['Mathématiques'],
            defaults={
                'coordinator': coordinator,
                'support_request': req1,
                'status': Pairing.Status.ACTIVE,
                'weekly_frequency': '1 séance de 1h30 chaque samedi',
                'general_goals': 'Révision du programme de 3ème et méthodologie de résolution d\'exercices brevet.'
            }
        )

        # 8. Objectifs pédagogiques F09
        LearningObjective.objects.get_or_create(
            student=student1,
            subject=subject_objs['Mathématiques'],
            description="Maîtriser le théorème de Pythagore et sa réciproque dans les configurations complexes.",
            defaults={
                'status': LearningObjective.Status.ACHIEVED,
                'target_date': date.today() - timedelta(days=7),
                'evaluation_notes': 'Objectif validé lors de la séance 2. L\'élève applique la méthode sans hésitation.'
            }
        )

        LearningObjective.objects.get_or_create(
            student=student1,
            subject=subject_objs['Mathématiques'],
            description="Résoudre des équations du premier degré à une inconnue avec fractions.",
            defaults={
                'status': LearningObjective.Status.IN_PROGRESS,
                'target_date': date.today() + timedelta(days=14),
                'evaluation_notes': 'En bonne voie. Reste à automatiser les réductions au même dénominateur.'
            }
        )

        # 9. Séances et Comptes Rendus (F07, F08)
        past_session, _ = TutoringSession.objects.get_or_create(
            pairing=pairing1,
            title="Séance 1 : Théorème de Pythagore & Calcul littéral",
            defaults={
                'scheduled_at': timezone.now() - timedelta(days=7),
                'duration_minutes': 90,
                'mode': TutoringSession.Mode.REMOTE,
                'location_or_link': 'Appel WhatsApp / Partage photo exercices',
                'status': TutoringSession.Status.COMPLETED
            }
        )

        SessionReport.objects.get_or_create(
            session=past_session,
            defaults={
                'attendance': SessionReport.Attendance.PRESENT,
                'duration_actual_minutes': 90,
                'topics_covered': 'Rappels sur le triangle rectangle, calcul de l\'hypoténuse et rédaction rigoureuse.',
                'exercises_done': 'Exercices 12 à 15 du manuel Comores 3ème.',
                'understanding_level': SessionReport.UnderstandingLevel.GOOD,
                'remaining_difficulties': 'Quelques confusions lors du passage sous la racine carrée, bien rectifiées.',
                'next_steps': 'Passer aux équations simples la semaine prochaine.'
            }
        )

        next_session, _ = TutoringSession.objects.get_or_create(
            pairing=pairing1,
            title="Séance 2 : Équations et inéquations du premier degré",
            defaults={
                'scheduled_at': timezone.now() + timedelta(days=3),
                'duration_minutes': 90,
                'mode': TutoringSession.Mode.REMOTE,
                'location_or_link': 'Appel WhatsApp',
                'status': TutoringSession.Status.SCHEDULED
            }
        )

        # 10. Carnet de liaison (F11)
        LiaisonNote.objects.get_or_create(
            pairing=pairing1,
            author=vol1,
            message="Bonjour Mme Ibrahim, votre fils a fait d'excellents progrès sur Pythagore aujourd'hui. Pour la prochaine séance de samedi, je lui ai demandé de relire les définitions de la page 42."
        )
        LiaisonNote.objects.get_or_create(
            pairing=pairing1,
            author=parent1,
            message="Merci beaucoup Aminata, il a retrouvé confiance en lui et a refait ses exercices avec entrain hier soir !"
        )

        # 11. CMS Contenus (Pages, Articles, Indicateurs, FAQ, Témoignages)
        KeyMetric.objects.get_or_create(
            label="Élèves accompagnés",
            defaults={'value': '142', 'icon': 'Users', 'order': 1}
        )
        KeyMetric.objects.get_or_create(
            label="Bénévoles mobilisés",
            defaults={'value': '48', 'icon': 'Heart', 'order': 2}
        )
        KeyMetric.objects.get_or_create(
            label="Séances de soutien réalisées",
            defaults={'value': '890', 'icon': 'BookOpen', 'order': 3}
        )
        KeyMetric.objects.get_or_create(
            label="Taux d'assiduité",
            defaults={'value': '95%', 'icon': 'Award', 'order': 4}
        )

        Article.objects.get_or_create(
            title="Lancement du programme pilote de solidarité scolaire aux Comores",
            defaults={
                'category': Article.Category.NEWS,
                'excerpt': 'Coordonné entre la France et les Comores, le projet pilote démarre en Grande Comore pour offrir un soutien scolaire bénévole gratuit aux élèves.',
                'content': "Le projet solidaire éducatif déploie ses premières actions pilotes à Moroni. En associant familles, enseignants et bénévoles dévoués, nous voulons donner à chaque enfant comorien toutes les chances de réussir, quel que soit son milieu familial ou ses moyens financiers.\n\nChaque accompagnement fait l'objet d'un suivi documenté, régulier et sécurisé avec l'adhésion à notre charte de protection des mineurs.",
                'author_name': 'Nassur Ali'
            }
        )

        Article.objects.get_or_create(
            title="Comment fonctionne l'accompagnement à distance avec nos bénévoles ?",
            defaults={
                'category': Article.Category.PEDAGOGY,
                'excerpt': 'Grâce à des outils légers et adaptés aux connexions mobiles (WhatsApp, fiches pédagogiques hors-ligne), nos binômes progressent semaine après semaine.',
                'content': "Face aux défis de connectivité parfois présents dans les îles, notre plateforme privilégie la simplicité : pas de logiciels lourds, des séances cadrées et des comptes rendus concis pour assurer une progression continue.",
                'author_name': 'Dr. Mariama Mbae'
            }
        )

        Testimonial.objects.get_or_create(
            name="Mme Fatima I.",
            role="Parent d'élève à Moroni",
            defaults={
                'quote': "Grâce au bénévole qui aide mon fils chaque samedi, ses notes en mathématiques ont augmenté et il a repris confiance avant son examen du brevet. Un immense merci !",
                'location': 'Grande Comore',
                'is_featured': True
            }
        )

        Testimonial.objects.get_or_create(
            name="Aminata M.",
            role="Bénévole étudiante",
            defaults={
                'quote': "Être bénévole pour les élèves aux Comores depuis la France me permet de garder un lien fort avec mon pays d'origine et d'avoir un impact direct et concret.",
                'location': 'France (Diaspora)',
                'is_featured': True
            }
        )

        FAQItem.objects.get_or_create(
            question="Le soutien scolaire est-il totalement gratuit pour les familles ?",
            defaults={
                'answer': "Oui, l'accompagnement est 100% gratuit. Les bénévoles interviennent avec générosité et dévouement dans le cadre de notre association.",
                'order': 1
            }
        )

        FAQItem.objects.get_or_create(
            question="Comment garantissez-vous la sécurité et la protection des enfants ?",
            defaults={
                'answer': "Tous nos bénévoles signent obligatoirement une Charte de protection des mineurs, leurs profils sont validés manuellement par nos coordinateurs, et les parents sont systématiquement informés des dates et bilans des séances.",
                'order': 2
            }
        )

        # 11. Finances & Transparence (F13, F20)
        FinancialCampaign.objects.get_or_create(
            title="Campagne Pilote 2026 : Matériel scolaire et connectivité",
            defaults={
                'description': "Financement de forfaits internet mobiles pour les élèves défavorisés, impression de manuels de révision et logistique des binômes.",
                'target_amount_eur': 5000.00,
                'start_date': date(2026, 1, 1),
                'end_date': date(2026, 12, 31),
                'is_active': True
            }
        )

        Donation.objects.get_or_create(
            donor_name="Fondation Solidarité Océan Indien",
            amount=1500.00,
            currency='EUR',
            defaults={
                'is_anonymous': False,
                'status': Donation.Status.RECEIVED,
                'allocation': 'Supports pédagogiques & impressions',
                'payment_method': 'Virement bancaire',
                'received_at': date(2026, 2, 10)
            }
        )

        Donation.objects.get_or_create(
            donor_name="Association des Ressortissants Comoriens",
            amount=800.00,
            currency='EUR',
            defaults={
                'is_anonymous': False,
                'status': Donation.Status.RECEIVED,
                'allocation': 'Connectivité et forfaits 4G pour les élèves',
                'payment_method': 'Virement bancaire',
                'received_at': date(2026, 3, 1)
            }
        )

        Donation.objects.get_or_create(
            donor_name="Donateur anonyme solidaire",
            amount=250.00,
            currency='EUR',
            defaults={
                'is_anonymous': True,
                'status': Donation.Status.RECEIVED,
                'allocation': 'Frais généraux',
                'payment_method': 'Carte bancaire',
                'received_at': date(2026, 3, 15)
            }
        )

        Expense.objects.get_or_create(
            title="Abonnements 4G & Recharges Téléphoniques pour 25 élèves",
            defaults={
                'category': Expense.Category.CONNECTIVITY,
                'amount': 450.00,
                'currency': 'EUR',
                'spent_at': date(2026, 2, 20),
                'receipt_reference': 'FACT-TEL-2026-01',
                'is_publicly_auditable': True
            }
        )

        Expense.objects.get_or_create(
            title="Impression livrets d'annales de mathématiques et français (Moroni)",
            defaults={
                'category': Expense.Category.PEDAGOGY,
                'amount': 320.00,
                'currency': 'EUR',
                'spent_at': date(2026, 3, 5),
                'receipt_reference': 'FACT-IMP-2026-04',
                'is_publicly_auditable': True
            }
        )

        self.stdout.write(self.style.SUCCESS("Données de démonstration créées avec succès !"))
