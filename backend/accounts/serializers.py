from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from .otp import create_and_send_otp


# Store registration serializer (Create)
class StoreRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for Store registration
    Fields: store_name, owner_name, email, password, phone_number, store_address, city, store_description
    """
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    owner_name = serializers.CharField(source='name', max_length=255)
    phone_number = serializers.CharField(source='phone', max_length=20, required=False, allow_blank=True)
    store_logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'store_name', 'owner_name', 'email', 'password', 'phone_number',
            'store_address', 'city', 'store_description', 'store_logo'
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_phone_number(self, value):
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Phone number already exists")
        return value

    def create(self, validated_data):
        # Extract nested data (source='name' maps owner_name to 'name' in validated_data)
        name = validated_data.pop('name')
        phone = validated_data.pop('phone', None)
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            email=validated_data.pop('email'),
            password=password,
            name=name,
            phone=phone,
            store_name=validated_data.get('store_name'),
            store_address=validated_data.get('store_address'),
            city=validated_data.get('city'),
            store_description=validated_data.get('store_description'),
            store_logo=validated_data.get('store_logo'),
            is_store=True
        )
        create_and_send_otp(user.email)
        return user


# Store Read Serializer
class StoreReadSerializer(serializers.ModelSerializer):
    """
    Serializer for reading Store profile
    Includes store details, listed clothing items, and donation requests
    """
    owner_name = serializers.CharField(source='name', read_only=True)
    phone_number = serializers.CharField(source='phone', read_only=True)
    store_logo_url = serializers.SerializerMethodField()
    # Note: clothing_items and donation_requests would be added when those models exist

    class Meta:
        model = User
        fields = [
            'id', 'store_name', 'owner_name', 'email', 'phone_number',
            'store_address', 'city', 'store_description', 'store_logo',
            'store_logo_url', 'is_verified', 'date_joined', 'role'
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'date_joined', 'role']

    def get_store_logo_url(self, obj):
        if obj.store_logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.store_logo.url)
            return obj.store_logo.url
        return None


# Store Update Serializer
class StoreUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating Store profile
    Email cannot be updated (excluded from fields)
    """
    owner_name = serializers.CharField(source='name', max_length=255, required=False)
    phone_number = serializers.CharField(source='phone', max_length=20, required=False, allow_blank=True)
    store_logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'store_name', 'owner_name', 'phone_number', 'store_address',
            'city', 'store_description', 'store_logo'
        ]

    def validate_phone_number(self, value):
        if value:
            # Check if phone number is already taken by another user
            user = self.instance
            if User.objects.filter(phone=value).exclude(id=user.id).exists():
                raise serializers.ValidationError("Phone number already exists")
        return value

    def update(self, instance, validated_data):
        # Handle nested name field
        if 'name' in validated_data:
            instance.name = validated_data.pop('name')
        if 'phone' in validated_data:
            instance.phone = validated_data.pop('phone')
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


# Customer registration serializer (Create)
class CustomerRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for Customer registration with OTP support
    Fields: full_name, email, password, phone_number, address, city, gender, preferred_clothing_size
    """
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    full_name = serializers.CharField(source='name', max_length=255)
    phone_number = serializers.CharField(source='phone', max_length=20, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'full_name', 'email', 'password', 'phone_number',
            'address', 'city', 'gender', 'preferred_clothing_size'
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_phone_number(self, value):
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Phone number already exists")
        return value

    def create(self, validated_data):
        # Extract nested data (source='name' maps full_name to 'name' in validated_data)
        name = validated_data.pop('name')
        phone = validated_data.pop('phone', None)
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            email=validated_data.pop('email'),
            password=password,
            name=name,
            phone=phone,
            address=validated_data.get('address'),
            city=validated_data.get('city'),
            gender=validated_data.get('gender'),
            preferred_clothing_size=validated_data.get('preferred_clothing_size'),
            is_store=False
        )
        create_and_send_otp(user.email)
        return user


# Customer Read Serializer
class CustomerReadSerializer(serializers.ModelSerializer):
    """
    Serializer for reading Customer profile
    Includes all customer fields except password
    """
    full_name = serializers.CharField(source='name', read_only=True)
    phone_number = serializers.CharField(source='phone', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'phone_number',
            'address', 'city', 'gender', 'preferred_clothing_size',
            'is_verified', 'date_joined', 'role'
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'date_joined', 'role']


# Customer Update Serializer
class CustomerUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating Customer profile
    Email cannot be updated (excluded from fields)
    """
    full_name = serializers.CharField(source='name', max_length=255, required=False)
    phone_number = serializers.CharField(source='phone', max_length=20, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'full_name', 'phone_number', 'address', 'city',
            'gender', 'preferred_clothing_size'
        ]

    def validate_phone_number(self, value):
        if value:
            # Check if phone number is already taken by another user
            user = self.instance
            if User.objects.filter(phone=value).exclude(id=user.id).exists():
                raise serializers.ValidationError("Phone number already exists")
        return value

    def update(self, instance, validated_data):
        # Handle nested name field
        if 'name' in validated_data:
            instance.name = validated_data.pop('name')
        if 'phone' in validated_data:
            instance.phone = validated_data.pop('phone')
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


# Store Dashboard Serializer (kept for backward compatibility)
class StoreDashboardSerializer(StoreReadSerializer):
    """
    Legacy serializer - kept for backward compatibility
    Use StoreReadSerializer instead
    """
    pass


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