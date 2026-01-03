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
    CustomerReadSerializer,
    CustomerUpdateSerializer,
    StoreRegisterSerializer,
    StoreReadSerializer,
    StoreUpdateSerializer,
    LoginSerializer, 
    UserSerializer,
    StoreDashboardSerializer
)
from .permissions import IsCustomer, IsStore
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



# CUSTOMER CRUD VIEWS


class CustomerProfileView(APIView):
    """
    Customer Profile CRUD View
    - GET: Retrieve authenticated customer profile
    - PUT/PATCH: Update customer profile (email cannot be updated)
    - DELETE: Soft delete (deactivate) customer account
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def get(self, request):
        """
        Retrieve authenticated customer profile
        Returns customer data including rental history (when available)
        """
        if request.user.role != 'Customer':
            return Response(
                {"error": "Only customers can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CustomerReadSerializer(request.user, context={'request': request})
        # TODO: Add rental history when Rental model is created
        # rental_history = Rental.objects.filter(customer=request.user)
        # data = serializer.data
        # data['rental_history'] = RentalSerializer(rental_history, many=True).data
        
        return Response({
            "message": "Customer profile retrieved successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def put(self, request):
        """
        Full update of customer profile
        Email cannot be updated
        """
        if request.user.role != 'Customer':
            return Response(
                {"error": "Only customers can update their profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CustomerUpdateSerializer(
            request.user,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            # Return updated data with read serializer
            read_serializer = CustomerReadSerializer(request.user, context={'request': request})
            return Response({
                "message": "Customer profile updated successfully",
                "data": read_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            "error": "Validation failed",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        """
        Partial update of customer profile
        Email cannot be updated
        """
        if request.user.role != 'Customer':
            return Response(
                {"error": "Only customers can update their profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CustomerUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            # Return updated data with read serializer
            read_serializer = CustomerReadSerializer(request.user, context={'request': request})
            return Response({
                "message": "Customer profile updated successfully",
                "data": read_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            "error": "Validation failed",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """
        Soft delete customer account (deactivate)
        Sets is_active to False instead of deleting the record
        """
        if request.user.role != 'Customer':
            return Response(
                {"error": "Only customers can deactivate their account"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        request.user.is_active = False
        request.user.save()
        
        return Response({
            "message": "Customer account deactivated successfully"
        }, status=status.HTTP_200_OK)



# STORE CRUD VIEWS


class StoreProfileView(APIView):
    """
    Store Profile CRUD View
    - GET: Retrieve authenticated store profile with listed items and donation requests
    - PUT/PATCH: Update store profile (email cannot be updated)
    - DELETE: Soft delete (deactivate) store account
    """
    permission_classes = [IsAuthenticated, IsStore]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        """
        Retrieve authenticated store profile
        Returns store data including listed clothing items and donation requests (when available)
        """
        if request.user.role != 'Store':
            return Response(
                {"error": "Only store owners can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = StoreReadSerializer(request.user, context={'request': request})
        # TODO: Add clothing items and donation requests when models are created
        # clothing_items = ClothingItem.objects.filter(store=request.user)
        # donation_requests = DonationRequest.objects.filter(store=request.user)
        # data = serializer.data
        # data['clothing_items'] = ClothingItemSerializer(clothing_items, many=True).data
        # data['donation_requests'] = DonationRequestSerializer(donation_requests, many=True).data
        
        return Response({
            "message": "Store profile retrieved successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def put(self, request):
        """
        Full update of store profile
        Email cannot be updated
        """
        if request.user.role != 'Store':
            return Response(
                {"error": "Only store owners can update their profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = StoreUpdateSerializer(
            request.user,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            # Return updated data with read serializer
            read_serializer = StoreReadSerializer(request.user, context={'request': request})
            return Response({
                "message": "Store profile updated successfully",
                "data": read_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            "error": "Validation failed",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        """
        Partial update of store profile
        Email cannot be updated
        """
        if request.user.role != 'Store':
            return Response(
                {"error": "Only store owners can update their profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = StoreUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            # Return updated data with read serializer
            read_serializer = StoreReadSerializer(request.user, context={'request': request})
            return Response({
                "message": "Store profile updated successfully",
                "data": read_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            "error": "Validation failed",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """
        Soft delete store account (deactivate)
        Sets is_active to False instead of deleting the record
        """
        if request.user.role != 'Store':
            return Response(
                {"error": "Only store owners can deactivate their account"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        request.user.is_active = False
        request.user.save()
        
        return Response({
            "message": "Store account deactivated successfully"
        }, status=status.HTTP_200_OK)