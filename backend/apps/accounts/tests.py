from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.matching.services import calculate_match_suggestions
from apps.pedagogy.models import Subject, Student, SupportRequest
from apps.volunteering.models import VolunteerProfile

User = get_user_model()

class EducationalPlatformTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Utilisateurs
        self.admin = User.objects.create_superuser(
            email='admin@test.km', username='admin_test', password='password123',
            role=User.Role.ADMIN
        )
        self.coordinator = User.objects.create_user(
            email='coord@test.km', username='coord_test', password='password123',
            role=User.Role.COORDINATOR
        )
        self.volunteer = User.objects.create_user(
            email='vol@test.km', username='vol_test', password='password123',
            role=User.Role.VOLUNTEER, island=User.Island.NGAZIDJA
        )
        self.parent = User.objects.create_user(
            email='parent@test.km', username='parent_test', password='password123',
            role=User.Role.PARENT, island=User.Island.NGAZIDJA
        )

        # Matière
        self.maths = Subject.objects.create(name='Mathématiques')

        # Profil bénévole vérifié
        self.vol_profile = VolunteerProfile.objects.create(
            user=self.volunteer,
            levels_can_teach=VolunteerProfile.LevelChoice.TOUS,
            verification_status=VolunteerProfile.VerificationStatus.VERIFIED,
            is_available_for_new_student=True,
            hours_per_week=3
        )
        self.vol_profile.subjects.add(self.maths)

        # Élève et demande
        self.student = Student.objects.create(
            first_name='Ali',
            last_name_initial='M.',
            parent=self.parent,
            school_level=Student.SchoolLevel.COLLEGE,
            grade='3ème',
            island=Student.Island.NGAZIDJA,
            city='Moroni',
            parental_consent_granted=True
        )
        self.support_req = SupportRequest.objects.create(
            student=self.student,
            requested_by=self.parent,
            difficulties_description='Difficultés en algèbre',
            pedagogical_goals='Obtenir la moyenne au brevet',
            availabilities='Samedi matin'
        )
        self.support_req.subjects.add(self.maths)

    def test_jwt_login(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'coord@test.km',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['role'], 'COORDINATOR')

    def test_anonymous_code_generated_for_student(self):
        self.assertTrue(self.student.anonymous_code.startswith('ELV-'))

    def test_matching_suggestion_engine(self):
        suggestions = calculate_match_suggestions(self.support_req.id)
        self.assertTrue(len(suggestions) > 0)
        top = suggestions[0]
        self.assertEqual(top['volunteer_id'], self.volunteer.id)
        self.assertGreaterEqual(top['score'], 60)

    def test_transparency_api_public_access(self):
        response = self.client.get('/api/finance/transparency/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_donations_received_eur', response.data)
        self.assertIn('categories_breakdown', response.data)

    def test_cms_articles_public_access(self):
        response = self.client.get('/api/cms/articles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
