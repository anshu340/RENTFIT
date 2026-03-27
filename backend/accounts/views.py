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
from donations.models import Donation
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
    AdminClothingApprovalSerializer,
    WishlistSerializer,
    WishlistDetailSerializer,
    ChangePasswordSerializer,
    PrivacySettingsSerializer,
)
from .permissions import IsCustomer, IsStore, IsAdmin
from .otp import verify_otp, create_and_send_otp


# SECURITY & PRIVACY VIEWS

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.filter(email=email).first()
        if not user:
            # Return success even if not found to prevent email enumeration
            return Response({"message": "If the email is registered, an OTP will be sent."}, status=status.HTTP_200_OK)
            
        create_and_send_otp(email)
        return Response({"message": "If the email is registered, an OTP will be sent."}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")
        
        if not all([email, otp, new_password]):
            return Response({"error": "Email, OTP and new password are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        success, message = verify_otp(email, otp)
        
        if not success:
            return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
        user.set_password(new_password)
        user.save()
        
        return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data["old_password"]):
                return Response({"error": "Wrong current password"}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data["new_password"])
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdatePrivacyView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = PrivacySettingsSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"message": "Account deleted successfully"}, status=status.HTTP_200_OK)


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
            username=serializer.validated_data['email'],
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
        
        # Statistics logic: Only include items in possession as Active, and only paid items in Spent
        active_status = ['rented', 'returned_pending', 'Rented', 'Returned Pending']
        spent_status = ['rented', 'returned_confirmed', 'Rented', 'Returned Confirmed']
        
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


class StoreDashboardStatsView(APIView):
    """
    Get summary statistics for the authenticated store dashboard
    - Total Earnings
    - Recent Transactions
    - Earnings History (30 days)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'Store':
            return Response(
                {"error": "Only stores can access these statistics"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = request.user
        Rental = apps.get_model('rent', 'Rental')
        Payment = apps.get_model('payments', 'Payment')
        
        # 1. Total Earnings (Sum of completed payments for this store's rentals)
        total_earnings = Payment.objects.filter(
            rental__store=user,
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # 2. Recent Transactions (Last 10 completed payments)
        recent_transactions_qs = Payment.objects.filter(
            rental__store=user,
            status='completed'
        ).select_related('rental', 'rental__clothing', 'rental__customer').order_by('-created_at')[:10]
        
        recent_transactions = []
        for p in recent_transactions_qs:
            customer_image = None
            if p.rental.customer.profile_image:
                customer_image = request.build_absolute_uri(p.rental.customer.profile_image.url)
            
            clothing_image = None
            if p.rental.clothing.images:
                clothing_image = request.build_absolute_uri(p.rental.clothing.images.url)

            recent_transactions.append({
                "id": p.id,
                "transaction_id": p.transaction_id,
                "amount": float(p.amount),
                "item_name": p.rental.clothing.item_name,
                "item_image": clothing_image,
                "customer_name": p.rental.customer.name or p.rental.customer.email,
                "customer_image": customer_image,
                "date": p.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                "status": p.status
            })

        # 3. Earnings History (Last 30 days for charts)
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models.functions import TruncDate

        thirty_days_ago = timezone.now() - timedelta(days=30)
        history_qs = Payment.objects.filter(
            rental__store=user,
            status='completed',
            created_at__gte=thirty_days_ago
        ).annotate(date=TruncDate('created_at')).values('date').annotate(
            daily_total=Sum('amount')
        ).order_by('date')

        earnings_history = []
        current_date = thirty_days_ago.date()
        end_date = timezone.now().date()
        
        history_dict = {item['date']: float(item['daily_total']) for item in history_qs}
        
        while current_date <= end_date:
            earnings_history.append({
                "date": current_date.strftime('%Y-%m-%d'),
                "earnings": history_dict.get(current_date, 0.0)
            })
            current_date += timedelta(days=1)

        return Response({
            "message": "Success",
            "data": {
                "total_earnings": float(total_earnings),
                "recent_transactions": recent_transactions,
                "earnings_history": earnings_history
            }
        }, status=status.HTTP_200_OK)


class NearbyStoresView(APIView):
    """
    Get all stores that have set their location
    GET /api/accounts/stores/nearby/
    """
    permission_classes = [AllowAny]

    def get(self, request):
        stores = User.objects.filter(
            role='Store',
            latitude__isnull=False,
            longitude__isnull=False
        )
        serializer = StoreReadSerializer(stores, many=True, context={'request': request})
        return Response({
            "message": "Stores retrieved successfully",
            "count": stores.count(),
            "data": serializer.data
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

class PublicStoreView(generics.RetrieveAPIView):
    """
    Get Public Store Profile
    GET /api/accounts/stores/<int:pk>/
    Auth: None
    """
    queryset = User.objects.filter(role='Store', is_active=True)
    serializer_class = StoreReadSerializer
    permission_classes = [AllowAny]


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

    def post(self, request, *args, **kwargs):
        """Create clothing item with error logging"""
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"DEBUG: ClothingCreateView validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"DEBUG: ClothingCreateView server error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({"error": "Internal Server Error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

    def patch(self, request, *args, **kwargs):
        """Update clothing item with error logging"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if not serializer.is_valid():
            print(f"DEBUG: ClothingUpdateView validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            print(f"DEBUG: ClothingUpdateView server error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({"error": "Internal Server Error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_update(self, serializer):
        """Reset status to PENDING on update"""
        serializer.save(status=Clothing.ClothingApproval.PENDING)


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
            "message": f"Clothing status updated to {instance.availability}",
            "data": detail_serializer.data
        }, status=status.HTTP_200_OK)


class AdminPendingClothingListView(generics.ListAPIView):
    """
    List all pending clothing items for admin approval
    GET /api/accounts/clothing/pending/
    Auth: Admin
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = ClothingListSerializer

    def get_queryset(self):
        return Clothing.objects.filter(status=Clothing.ClothingApproval.PENDING).order_by('-created_at')


class AdminClothingApprovalView(APIView):
    """
    Approve or Reject clothing item
    POST /api/accounts/admin/clothing/<int:pk>/<str:action>/
    Auth: Admin
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk, action):
        try:
            clothing = Clothing.objects.get(pk=pk)
        except Clothing.DoesNotExist:
            return Response({"error": "Clothing item not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == "approve":
            clothing.status = Clothing.ClothingApproval.APPROVED
            message = f"Clothing item {clothing.item_name} approved successfully"
        elif action == "reject":
            clothing.status = Clothing.ClothingApproval.REJECTED
            message = f"Clothing item {clothing.item_name} rejected"
        else:
            return Response({"error": "Invalid action. Use 'approve' or 'reject'"}, status=status.HTTP_400_BAD_REQUEST)

        clothing.save()
        
        return Response({
            "message": message,
            "status": clothing.status,
            "data": ClothingDetailSerializer(clothing, context={'request': request}).data
        }, status=status.HTTP_200_OK)


class AddToBrowseView(APIView):
    """
    Convert Donation to Clothing Item
    POST /api/accounts/clothing/add-to-browse/<donation_id>/
    Auth: Store
    """
    permission_classes = [IsAuthenticated, IsStore]

    def post(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id)
        except Donation.DoesNotExist:
            return Response({"error": "Donation not found"}, status=status.HTTP_404_NOT_FOUND)

        # Ownership validation
        if donation.store != request.user:
            return Response({"error": "You are not authorized to convert this donation"}, status=status.HTTP_403_FORBIDDEN)

        # Status validation (only collected donations can be added to browse)
        if donation.donation_status != Donation.DonationStatus.COLLECTED:
            return Response({"error": "Only collected donations can be added to browse"}, status=status.HTTP_400_BAD_REQUEST)

        # Duplicate prevention
        if Clothing.objects.filter(donation=donation).exists():
            return Response({"error": "This donation has already been added to browse"}, status=status.HTTP_400_BAD_REQUEST)

        # Create Clothing item
        clothing = Clothing.objects.create(
            store=request.user,
            item_name=donation.item_name,
            category=donation.category,
            gender=donation.gender,
            size=donation.size,
            condition=donation.condition,
            description=donation.description,
            images=donation.images,
            status=Clothing.ClothingApproval.PENDING,
            donation=donation,
            rental_price=50.00,
            security_deposit=0.00
        )

        return Response({
            "message": "Item sent for admin approval",
            "clothing_id": clothing.id
        }, status=status.HTTP_201_CREATED)

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
        queryset = Clothing.objects.filter(status=Clothing.ClothingApproval.APPROVED)
        
        # Optional filters
        category = self.request.query_params.get('category', None)
        gender = self.request.query_params.get('gender', None)
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        city = self.request.query_params.get('city', None)
        store_id = self.request.query_params.get('store_id', None)
        
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
        if store_id:
            queryset = queryset.filter(store_id=store_id)
        
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

    def create(self, validated_data):
        """Create wishlist item"""
        # This approach replaces the default create behavior to handle exceptions manually
        # NOTE: This overridden create is NOT used when calling self.perform_create(serializer) 
        # unless manual save is done. 
        # Wait, views.py calls serializer.is_valid() then perform_create(). 
        # perform_create calls serializer.save() which calls serializer.create().
        pass 

    def post(self, request, *args, **kwargs):
        """Add item to wishlist with debug handling"""
        try:
            serializer = self.get_serializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            # Use serializer.instance.id to avoid unnecessary serialization overhead/errors
            wishlist_item = Wishlist.objects.get(id=serializer.instance.id)
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
        except Exception as e:
            import traceback
            print(f"Server Error in WishlistAddView: {str(e)}")
            traceback.print_exc()
            return Response({
                "error": "Internal Server Error",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    permission_classes = [AllowAny]
    from rest_framework_simplejwt.authentication import JWTAuthentication
    authentication_classes = [JWTAuthentication]

    def delete(self, request, clothing_id):
        """Remove item from wishlist by clothing ID"""
        print(f"DEBUG: DELETE Request for clothing_id {clothing_id}")
        print(f"DEBUG: Auth Header: {request.headers.get('Authorization')}")
        print(f"DEBUG: User: {request.user}")
        
        # Manually check authentication since we used AllowAny for debug
        if not request.user.is_authenticated:
            return Response({"error": "Unauthorized debug check"}, status=status.HTTP_401_UNAUTHORIZED)

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
        Wishlist.objects.filter(customer=request.user).delete()
        return Response({
            "message": "Wishlist cleared successfully"
        }, status=status.HTTP_200_OK)


class UniversalSearchView(APIView):
    """
    Universal Search for Clothes and Stores
    GET /api/accounts/search/?q={query}
    Auth: None (Public)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        print(f"DEBUG: Universal Search Query: {query}")
        
        if not query:
            return Response({
                "clothes": [],
                "stores": []
            }, status=status.HTTP_200_OK)

        # Search Clothes (Approved ones)
        # Search by item_name or category
        clothes = Clothing.objects.filter(
            status=Clothing.ClothingApproval.APPROVED,
            item_name__icontains=query
        ) | Clothing.objects.filter(
            status=Clothing.ClothingApproval.APPROVED,
            category__icontains=query
        )
        clothes = clothes.distinct().select_related('store')[:10]

        # Search Stores
        # Search by store_name or city
        stores = User.objects.filter(
            role='Store',
            store_name__icontains=query,
            is_active=True
        ) | User.objects.filter(
            role='Store',
            city__icontains=query,
            is_active=True
        )
        stores = stores.distinct()[:10]

        response_data = {
            "clothes": ClothingListSerializer(clothes, many=True, context={'request': request}).data,
            "stores": StoreReadSerializer(stores, many=True, context={'request': request}).data
        }
        
        print(f"DEBUG: Found {len(response_data['clothes'])} clothes and {len(response_data['stores'])} stores")
        
        return Response(response_data, status=status.HTTP_200_OK)