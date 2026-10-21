from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class SignSafeguardingCharterView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        user.safeguarding_signed = True
        user.save(update_fields=['safeguarding_signed'])
        return Response({
            'detail': 'Charte de protection des mineurs signée avec succès.',
            'user': UserSerializer(user).data
        })

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Seuls les coordinateurs et admins voient la liste des utilisateurs
        if self.request.user.role in ['ADMIN', 'COORDINATOR'] or self.request.user.is_staff:
            role_filter = self.request.query_params.get('role')
            if role_filter:
                return User.objects.filter(role=role_filter)
            return User.objects.all()
        return User.objects.none()
