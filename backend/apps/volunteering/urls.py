from django.urls import path
from .views import (
    VolunteerProfileMeView,
    VolunteerProfileListView,
    VolunteerProfileDetailView,
    PublicMissionListView,
    PublicMissionDetailView,
    MissionApplicationListCreateView,
)

urlpatterns = [
    path('profile/me/', VolunteerProfileMeView.as_view(), name='volunteer_profile_me'),
    path('profiles/', VolunteerProfileListView.as_view(), name='volunteer_profiles_list'),
    path('profiles/<int:pk>/', VolunteerProfileDetailView.as_view(), name='volunteer_profile_detail'),
    path('missions/', PublicMissionListView.as_view(), name='public_missions_list'),
    path('missions/<int:pk>/', PublicMissionDetailView.as_view(), name='public_missions_detail'),
    path('applications/', MissionApplicationListCreateView.as_view(), name='mission_applications'),
]
