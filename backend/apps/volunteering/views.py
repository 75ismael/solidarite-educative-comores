from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import VolunteerProfile, PublicMission, MissionApplication
from .serializers import (
    VolunteerProfileSerializer,
    PublicMissionSerializer,
    MissionApplicationSerializer,
)

class VolunteerProfileMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = VolunteerProfile.objects.get_or_create(user=request.user)
        serializer = VolunteerProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = VolunteerProfile.objects.get_or_create(user=request.user)
        serializer = VolunteerProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VolunteerProfileListView(generics.ListAPIView):
    queryset = VolunteerProfile.objects.all()
    serializer_class = VolunteerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COORDINATOR'] or user.is_staff:
            status_param = self.request.query_params.get('status')
            if status_param:
                return VolunteerProfile.objects.filter(verification_status=status_param)
            return VolunteerProfile.objects.all()
        return VolunteerProfile.objects.none()

from apps.core.emails import send_volunteer_verified_notification

class VolunteerProfileDetailView(generics.RetrieveUpdateAPIView):
    queryset = VolunteerProfile.objects.all()
    serializer_class = VolunteerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        old_status = self.get_object().verification_status
        profile = serializer.save()
        if old_status != VolunteerProfile.VerificationStatus.VERIFIED and profile.verification_status == VolunteerProfile.VerificationStatus.VERIFIED:
            send_volunteer_verified_notification(profile)

class PublicMissionListView(generics.ListCreateAPIView):
    serializer_class = PublicMissionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Pour le public, uniquement les missions ouvertes
        if not self.request.user.is_authenticated or getattr(self.request.user, 'role', None) not in ['ADMIN', 'COORDINATOR']:
            return PublicMission.objects.filter(status=PublicMission.Status.OPEN)
        return PublicMission.objects.all()

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(creator=self.request.user)
        else:
            serializer.save()

class PublicMissionDetailView(generics.RetrieveUpdateAPIView):
    queryset = PublicMission.objects.all()
    serializer_class = PublicMissionSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class MissionApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = MissionApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COORDINATOR'] or user.is_staff:
            mission_id = self.request.query_params.get('mission_id')
            if mission_id:
                return MissionApplication.objects.filter(mission_id=mission_id)
            return MissionApplication.objects.all()
        return MissionApplication.objects.filter(volunteer=user)

    def perform_create(self, serializer):
        serializer.save(volunteer=self.request.user)
