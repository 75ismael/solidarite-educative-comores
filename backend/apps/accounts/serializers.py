from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['name'] = user.get_full_name() or user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    island_display = serializers.CharField(source='get_island_display', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_display', 'phone', 'island', 'island_display',
            'city', 'is_verified', 'safeguarding_signed', 'bio', 'date_joined'
        ]
        read_only_fields = ['id', 'is_verified', 'date_joined']

import uuid
from rest_framework.validators import UniqueValidator

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Cette adresse e-mail est déjà associée à un compte existant. Veuillez vous connecter."
            )
        ]
    )
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={
            'min_length': 'Le mot de passe doit comporter au moins 6 caractères.'
        }
    )
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name',
            'role', 'phone', 'island', 'city', 'bio'
        ]
        extra_kwargs = {
            'email': {
                'error_messages': {
                    'unique': 'Cette adresse e-mail est déjà associée à un compte existant. Veuillez vous connecter.'
                }
            },
            'first_name': {
                'required': True,
                'error_messages': {'required': 'Le prénom est obligatoire.'}
            },
            'last_name': {
                'required': True,
                'error_messages': {'required': 'Le nom de famille est obligatoire.'}
            }
        }

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        attrs['email'] = email
        username = attrs.get('username', '').strip()
        if not username or User.objects.filter(username=username).exists():
            base = email.split('@')[0] if '@' in email else 'user'
            attrs['username'] = f"{base}_{uuid.uuid4().hex[:6]}"
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        # S'assurer que le rôle créé est autorisé publiquement (PARENT, TEACHER, VOLUNTEER)
        role = validated_data.get('role', User.Role.PARENT)
        if role not in [User.Role.PARENT, User.Role.TEACHER, User.Role.VOLUNTEER]:
            role = User.Role.PARENT
            validated_data['role'] = role

        user = User.objects.create_user(password=password, **validated_data)
        return user
