from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    CurrentUserView,
    SignSafeguardingCharterView,
    UserListView,
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('sign-safeguarding/', SignSafeguardingCharterView.as_view(), name='sign_safeguarding'),
    path('users/', UserListView.as_view(), name='user_list'),
]
