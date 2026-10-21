from django.urls import path
from .views import (
    SubjectListView,
    StudentListCreateView,
    StudentDetailView,
    SupportRequestListCreateView,
    SupportRequestDetailView,
    LearningObjectiveListCreateView,
    LearningObjectiveDetailView,
)

urlpatterns = [
    path('subjects/', SubjectListView.as_view(), name='subject_list'),
    path('students/', StudentListCreateView.as_view(), name='student_list_create'),
    path('students/<int:pk>/', StudentDetailView.as_view(), name='student_detail'),
    path('requests/', SupportRequestListCreateView.as_view(), name='support_request_list_create'),
    path('requests/<int:pk>/', SupportRequestDetailView.as_view(), name='support_request_detail'),
    path('objectives/', LearningObjectiveListCreateView.as_view(), name='learning_objective_list_create'),
    path('objectives/<int:pk>/', LearningObjectiveDetailView.as_view(), name='learning_objective_detail'),
]
