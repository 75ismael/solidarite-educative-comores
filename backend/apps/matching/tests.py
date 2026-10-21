from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.pedagogy.models import Student, Subject
from apps.matching.models import Pairing, LiaisonNote
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class MatchingAndLiaisonNoteTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.coordinator = User.objects.create_user(
            username='coord_test',
            email='coord@test.km',
            password='password123',
            role=User.Role.COORDINATOR
        )
        self.volunteer = User.objects.create_user(
            username='vol_test',
            email='vol@test.km',
            password='password123',
            role=User.Role.VOLUNTEER
        )
        self.parent = User.objects.create_user(
            username='parent_test',
            email='parent@test.km',
            password='password123',
            role=User.Role.PARENT
        )
        self.unrelated_user = User.objects.create_user(
            username='other_test',
            email='other@test.km',
            password='password123',
            role=User.Role.PARENT
        )
        self.subject = Subject.objects.create(name='Mathématiques')
        self.student = Student.objects.create(
            parent=self.parent,
            first_name='Ali',
            last_name_initial='M.',
            school_level=Student.SchoolLevel.COLLEGE,
            grade='3ème',
            island=Student.Island.NGAZIDJA,
            city='Moroni',
            parental_consent_granted=True
        )
        self.pairing = Pairing.objects.create(
            student=self.student,
            volunteer=self.volunteer,
            coordinator=self.coordinator,
            subject=self.subject,
            weekly_frequency='1x par semaine'
        )

    def test_liaison_note_creation_and_listing(self):
        # Le bénévole poste une note
        self.client.force_authenticate(user=self.volunteer)
        url = f'/api/matching/pairings/{self.pairing.id}/notes/'
        res = self.client.post(url, {'message': 'Bravo pour la séance'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['message'], 'Bravo pour la séance')

        # Le parent consulte la note
        self.client.force_authenticate(user=self.parent)
        res_get = self.client.get(url)
        self.assertEqual(res_get.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_get.data), 1)
        self.assertEqual(res_get.data[0]['message'], 'Bravo pour la séance')

        # Un utilisateur non concerné ne voit aucune note
        self.client.force_authenticate(user=self.unrelated_user)
        res_unrelated = self.client.get(url)
        self.assertEqual(res_unrelated.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_unrelated.data), 0)
