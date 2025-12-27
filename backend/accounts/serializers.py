from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from .otp import create_and_send_otp


# Store registration serializer
class StoreRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    store_logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'name', 'phone',
            'store_name', 'store_address', 'city', 
            'store_description', 'store_logo'
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_phone(self, value):
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Phone number already exists")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            phone=validated_data.get('phone'),
            store_name=validated_data.get('store_name'),
            store_address=validated_data.get('store_address'),
            city=validated_data.get('city'),
            store_description=validated_data.get('store_description'),
            store_logo=validated_data.get('store_logo'),
            is_store=True
        )
        create_and_send_otp(user.email)
        return user


# Customer registration serializer
class CustomerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'phone']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_phone(self, value):
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Phone number already exists")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            phone=validated_data.get('phone'),
            is_store=False
        )
        create_and_send_otp(user.email)
        return user


# Store Dashboard Serializer
class StoreDashboardSerializer(serializers.ModelSerializer):
    store_logo_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'name',
            'phone',
            'store_name',
            'store_address',
            'city',
            'store_description',
            'store_logo',
            'store_logo_url',
            'role',
            'is_verified',
            'date_joined'
        ]
        read_only_fields = ['id', 'email', 'role', 'is_verified', 'date_joined']

    def get_store_logo_url(self, obj):
        if obj.store_logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.store_logo.url)
            return obj.store_logo.url
        return None


# Login serializer
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


# User serializer
class UserSerializer(serializers.ModelSerializer):
    store_logo_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'phone', 'role', 
            'store_name', 'store_address', 'city', 'store_description', 
            'store_logo', 'store_logo_url',
            'is_verified', 'date_joined'
        ]

    def get_store_logo_url(self, obj):
        if obj.store_logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.store_logo.url)
            return obj.store_logo.url
        return None