from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import User
from .serializers import CustomerRegisterSerializer, StoreRegisterSerializer, LoginSerializer, UserSerializer
from .otp import verify_otp

#  Customer Register 
class CustomerRegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = CustomerRegisterSerializer


#  Store Register 
class StoreRegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = StoreRegisterSerializer


#  VERIFY OTP
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        success, message = verify_otp(email, otp)
        return Response({"message": message}, status=200 if success else 400)


# LOGIN JWT GENERATED 
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )

        if not user or not user.is_verified:
            return Response(
                {"error": "Invalid credentials or email not verified"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # JWT TOKENS CREATED HERE
        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user).data,
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh)
        })


# PROFILE JWT REQUIRED
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
