from django.urls import path
from .views import (
    PairingListCreateView,
    PairingDetailView,
    LiaisonNoteListCreateView,
    MatchingSuggestionsView,
    ReassignPairingView,
    RequestPairingChangeView,
)

urlpatterns = [
    path('pairings/', PairingListCreateView.as_view(), name='pairing_list_create'),
    path('pairings/<int:pk>/', PairingDetailView.as_view(), name='pairing_detail'),
    path('pairings/<int:pairing_id>/reassign/', ReassignPairingView.as_view(), name='pairing_reassign'),
    path('pairings/<int:pairing_id>/request-change/', RequestPairingChangeView.as_view(), name='pairing_request_change'),
    path('pairings/<int:pairing_id>/notes/', LiaisonNoteListCreateView.as_view(), name='pairing_notes'),
    path('suggestions/<int:request_id>/', MatchingSuggestionsView.as_view(), name='matching_suggestions'),
]
