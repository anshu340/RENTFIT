from rest_framework import serializers
from .models import User

class LoginUserSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")

        # Check if user is verified (optional)
        if not user.is_verified:
            raise serializers.ValidationError("Email not verified. Please verify first.")

        attrs['user'] = user
        return attrs
