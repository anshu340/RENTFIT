from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from .otp import create_and_send_otp

# Base registration serializer
class BaseRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'phone']

    def create(self, validated_data):
        is_store = getattr(self, 'is_store', False)
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            phone=validated_data.get('phone'),
            is_store=is_store
        )
        create_and_send_otp(user.email)
        return user


# Customer registration serializer
class CustomerRegisterSerializer(BaseRegisterSerializer):
    is_store = False


# Store registration serializer
class StoreRegisterSerializer(BaseRegisterSerializer):
    is_store = True


# Login serializer
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


# User serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'role']
