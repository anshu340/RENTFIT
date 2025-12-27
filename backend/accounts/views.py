from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import User
from .serializers import (
    CustomerRegisterSerializer, 
    StoreRegisterSerializer, 
    LoginSerializer, 
    UserSerializer,
    StoreDashboardSerializer
)
from .otp import verify_otp


# Customer Register 
class CustomerRegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = CustomerRegisterSerializer


# Store Register 
class StoreRegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = StoreRegisterSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]


# VERIFY OTP
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
            "user": UserSerializer(user, context={'request': request}).data,
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh)
        })


# PROFILE JWT REQUIRED
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)


# STORE DASHBOARD - Get and Update Store Details
class StoreDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        """Get all store details"""
        if not request.user.is_store:
            return Response(
                {"error": "Only store owners can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = StoreDashboardSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        """Update store details (partial update)"""
        if not request.user.is_store:
            return Response(
                {"error": "Only store owners can update store details"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = StoreDashboardSerializer(
            request.user, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Store details updated successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)