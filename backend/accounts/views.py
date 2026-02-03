from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Sum
from django.apps import apps

from .models import User, Clothing, Wishlist
from .serializers import (
    CustomerRegisterSerializer, 
    CustomerReadSerializer,
    CustomerUpdateSerializer,
    StoreRegisterSerializer,
    StoreReadSerializer,
    StoreUpdateSerializer,
    LoginSerializer, 
    UserSerializer,
    StoreDashboardSerializer,
    ClothingCreateSerializer,
    ClothingListSerializer,
    ClothingDetailSerializer,
    ClothingUpdateSerializer,
    ClothingStatusUpdateSerializer,
    WishlistSerializer,
    WishlistDetailSerializer,
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


class CustomerDashboardStatsView(APIView):
    """
    Get summary statistics for the authenticated customer dashboard
    - Active Rentals count
    - Wishlist Items count
    - Total Spent
    - Items Donated count
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'Customer':
            return Response(
                {"error": "Only customers can access these statistics"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = request.user
        
        # We'll use apps.get_model to avoid potential circular imports
        Rental = apps.get_model('rent', 'Rental')
        Donation = apps.get_model('donations', 'Donation')
        
        # Statistics logic
        active_status = ['pending', 'approved', 'rented', 'Pending', 'Approved', 'Rented']
        spent_status = ['approved', 'rented', 'returned_confirmed', 'Approved', 'Rented', 'Returned Confirmed']
        
        active_rentals = Rental.objects.filter(
            customer=user,
            status__in=active_status
        ).count()
        
        total_spent = Rental.objects.filter(
            customer=user,
            status__in=spent_status
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        wishlist_items = Wishlist.objects.filter(customer=user).count()
        
        items_donated = Donation.objects.filter(customer=user).count()
        
        return Response({
            "message": "Success",
            "data": {
                "active_rentals": active_rentals,
                "total_spent": float(total_spent),
                "wishlist_items": wishlist_items,
                "items_donated": items_donated
            }
        }, status=status.HTTP_200_OK)

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

# STORE CLOTHING VIEWS


class ClothingCreateView(generics.CreateAPIView):
    """
    Create Clothing Item
    POST /api/accounts/clothing/create/
    Auth: Store (JWT)
    """
    permission_classes = [IsAuthenticated, IsStore]
    serializer_class = ClothingCreateSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        """Create clothing item with store from request user"""
        serializer.save()


class StoreClothingListView(generics.ListAPIView):
    """
    My Clothing Items (Store)
    GET /api/accounts/clothing/my/
    Auth: Store
    """
    permission_classes = [IsAuthenticated, IsStore]
    serializer_class = ClothingListSerializer

    def get_queryset(self):
        """Return only clothing items belonging to the authenticated store"""
        return Clothing.objects.filter(store=self.request.user)

    def list(self, request, *args, **kwargs):
        """Return list of clothing items"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ClothingDetailView(generics.RetrieveAPIView):
    """
    View Clothing Item
    GET /api/accounts/clothing/<id>/
    Auth: Any authenticated user
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = ClothingDetailSerializer
    queryset = Clothing.objects.all()

    def retrieve(self, request, *args, **kwargs):
        """Return clothing item details"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ClothingUpdateView(generics.UpdateAPIView):
    """
    Update Clothing Item
    PUT/PATCH /api/accounts/clothing/<id>/update/
    Auth: Store (owner only)
    """
    permission_classes = [IsAuthenticated, IsStore]
    serializer_class = ClothingUpdateSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        """Return only clothing items belonging to the authenticated store"""
        return Clothing.objects.filter(store=self.request.user)


class ClothingDeleteView(generics.DestroyAPIView):
    """
    Delete Clothing Item
    DELETE /api/accounts/clothing/<id>/delete/
    Auth: Store (owner only)
    """
    permission_classes = [IsAuthenticated, IsStore]

    def get_queryset(self):
        """Return only clothing items belonging to the authenticated store"""
        return Clothing.objects.filter(store=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Delete clothing item and return success message"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Clothing item deleted successfully"},
            status=status.HTTP_200_OK
        )


class ClothingStatusUpdateView(generics.UpdateAPIView):
    """
    Update Clothing Status
    PATCH /api/accounts/clothing/<id>/status/
    Auth: Store (owner only)
    """
    permission_classes = [IsAuthenticated, IsStore]
    serializer_class = ClothingStatusUpdateSerializer

    def get_queryset(self):
        """Return only clothing items belonging to the authenticated store"""
        return Clothing.objects.filter(store=self.request.user)

    def update(self, request, *args, **kwargs):
        """Update clothing status"""
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Return updated clothing details
        detail_serializer = ClothingDetailSerializer(instance, context={'request': request})
        return Response({
            "message": f"Clothing status updated to {instance.clothing_status}",
            "data": detail_serializer.data
        }, status=status.HTTP_200_OK)

# CUSTOMER CLOTHING VIEWS

class AllClothingListView(generics.ListAPIView):
    """
    Browse All Available Clothing
    GET /api/accounts/clothing/all/
    Auth: Customer
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = ClothingListSerializer

    def get_queryset(self):
        """Return all available clothing items"""
        # queryset = Clothing.objects.filter(clothing_status=Clothing.Status.AVAILABLE)
        queryset = Clothing.objects.all() # Temporarily broaden to see all
        
        # Optional filters
        category = self.request.query_params.get('category', None)
        gender = self.request.query_params.get('gender', None)
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        city = self.request.query_params.get('city', None)
        
        if category:
            queryset = queryset.filter(category=category)
        if gender:
            queryset = queryset.filter(gender=gender)
        if min_price:
            queryset = queryset.filter(rental_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(rental_price__lte=max_price)
        if city:
            queryset = queryset.filter(store__city=city)
        
        return queryset

    def list(self, request, *args, **kwargs):
        """Return list of available clothing items"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)   


class WishlistListView(generics.ListAPIView):
    """
    Get Customer's Wishlist
    GET /api/accounts/wishlist/
    Auth: Customer
    Returns: List of all wishlist items for the authenticated customer
    """
    permission_classes = [IsAuthenticated, IsCustomer]
    serializer_class = WishlistDetailSerializer

    def get_queryset(self):
        """Return wishlist items for authenticated customer"""
        return Wishlist.objects.filter(customer=self.request.user).select_related('clothing', 'clothing__store')

    def list(self, request, *args, **kwargs):
        """Return list of wishlist items"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response({
            "message": "Wishlist retrieved successfully",
            "count": queryset.count(),
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class WishlistAddView(generics.CreateAPIView):
    """
    Add Item to Wishlist
    POST /api/accounts/wishlist/add/
    Auth: Customer
    Body: { "clothing_id": 1 }
    """
    permission_classes = [IsAuthenticated, IsCustomer]
    serializer_class = WishlistSerializer

    def create(self, request, *args, **kwargs):
        """Add item to wishlist"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            # Return detailed response
            wishlist_item = Wishlist.objects.get(id=serializer.data['id'])
            detail_serializer = WishlistDetailSerializer(wishlist_item, context={'request': request})
            
            return Response({
                "message": "Item added to wishlist successfully",
                "data": detail_serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except serializers.ValidationError as e:
            return Response({
                "error": "Failed to add item to wishlist",
                "details": e.detail
            }, status=status.HTTP_400_BAD_REQUEST)


class WishlistRemoveView(generics.DestroyAPIView):
    """
    Remove Item from Wishlist
    DELETE /api/accounts/wishlist/<id>/remove/
    Auth: Customer (owner only)
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        """Return wishlist items for authenticated customer"""
        return Wishlist.objects.filter(customer=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Remove item from wishlist"""
        try:
            instance = self.get_object()
            clothing_name = instance.clothing.item_name
            self.perform_destroy(instance)
            
            return Response({
                "message": f"{clothing_name} removed from wishlist successfully"
            }, status=status.HTTP_200_OK)
            
        except Wishlist.DoesNotExist:
            return Response({
                "error": "Wishlist item not found"
            }, status=status.HTTP_404_NOT_FOUND)


class WishlistRemoveByClothingView(APIView):
    """
    Remove Item from Wishlist by Clothing ID
    DELETE /api/accounts/wishlist/remove-by-clothing/<clothing_id>/
    Auth: Customer
    Alternative endpoint to remove by clothing ID instead of wishlist ID
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def delete(self, request, clothing_id):
        """Remove item from wishlist by clothing ID"""
        try:
            wishlist_item = Wishlist.objects.get(
                customer=request.user,
                clothing_id=clothing_id
            )
            clothing_name = wishlist_item.clothing.item_name
            wishlist_item.delete()
            
            return Response({
                "message": f"{clothing_name} removed from wishlist successfully"
            }, status=status.HTTP_200_OK)
            
        except Wishlist.DoesNotExist:
            return Response({
                "error": "Item not found in wishlist"
            }, status=status.HTTP_404_NOT_FOUND)


class WishlistCheckView(APIView):
    """
    Check if Item is in Wishlist
    GET /api/accounts/wishlist/check/<clothing_id>/
    Auth: Customer
    Returns: { "in_wishlist": true/false, "wishlist_id": 1 or null }
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def get(self, request, clothing_id):
        """Check if clothing item is in wishlist"""
        try:
            wishlist_item = Wishlist.objects.get(
                customer=request.user,
                clothing_id=clothing_id
            )
            return Response({
                "in_wishlist": True,
                "wishlist_id": wishlist_item.id
            }, status=status.HTTP_200_OK)
            
        except Wishlist.DoesNotExist:
            return Response({
                "in_wishlist": False,
                "wishlist_id": None
            }, status=status.HTTP_200_OK)


class WishlistClearView(APIView):
    """
    Clear All Wishlist Items
    DELETE /api/accounts/wishlist/clear/
    Auth: Customer
    Removes all items from customer's wishlist
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def delete(self, request):
        """Clear all wishlist items"""
        count = Wishlist.objects.filter(customer=request.user).count()
        Wishlist.objects.filter(customer=request.user).delete()
        
        return Response({
            "message": f"Wishlist cleared successfully. {count} items removed."
        }, status=status.HTTP_200_OK)