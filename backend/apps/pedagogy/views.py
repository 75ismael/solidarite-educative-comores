from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Subject, Student, SupportRequest, LearningObjective
from .serializers import (
    SubjectSerializer,
    StudentSerializer,
    SupportRequestSerializer,
    LearningObjectiveSerializer,
)

class SubjectListView(generics.ListCreateAPIView):
    queryset = Subject.objects.filter(is_active=True)
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]

class StudentListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COORDINATOR'] or user.is_staff:
            return Student.objects.all()
        # Un parent ne voit que ses propres enfants inscrits
        return Student.objects.filter(parent=user)

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)

class StudentDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COORDINATOR'] or user.is_staff:
            return Student.objects.all()
        return Student.objects.filter(parent=user)

class SupportRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = SupportRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COORDINATOR'] or user.is_staff:
            status_param = self.request.query_params.get('status')
            if status_param:
                return SupportRequest.objects.filter(status=status_param)
            return SupportRequest.objects.all()
        return SupportRequest.objects.filter(requested_by=user)

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

class SupportRequestDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = SupportRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'COORDINATOR'] or user.is_staff:
            return SupportRequest.objects.all()
        return SupportRequest.objects.filter(requested_by=user)

class LearningObjectiveListCreateView(generics.ListCreateAPIView):
    serializer_class = LearningObjectiveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        student_id = self.request.query_params.get('student_id')
        if student_id:
            return LearningObjective.objects.filter(student_id=student_id)
        return LearningObjective.objects.all()

class LearningObjectiveDetailView(generics.RetrieveUpdateAPIView):
    queryset = LearningObjective.objects.all()
    serializer_class = LearningObjectiveSerializer
    permission_classes = [permissions.IsAuthenticated]
