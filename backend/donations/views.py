from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from notifications.models import Notification

from .models import Donation
from .serializers import (
    DonationCreateSerializer,
    DonationListSerializer,
    DonationDetailSerializer,
    DonationStatusUpdateSerializer,
    DonationUpdateSerializer
)
from accounts.permissions import IsCustomer, IsStore
from accounts.models import User


# CUSTOMER DONATION VIEWS

class DonationCreateView(generics.CreateAPIView):
    """
    Create Donation
    POST /api/donations/create/
    Auth: Customer (JWT)
    """
    permission_classes = [IsAuthenticated, IsCustomer]
    serializer_class = DonationCreateSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        """Create donation with customer from request user"""
        donation = serializer.save()
        Notification.objects.create(
            user=donation.store,
            message=f"New donation pledge from {self.request.user.email}: {donation.item_name}.",
            notification_type='donation',
            image_url=self.request.build_absolute_uri(donation.images.url) if donation.images else None
        )


class CustomerDonationListView(generics.ListAPIView):
    """
    My Donations (Customer)
    GET /api/donations/my/
    Auth: Customer
    """
    permission_classes = [IsAuthenticated, IsCustomer]
    serializer_class = DonationListSerializer

    def get_queryset(self):
        """Return only donations belonging to the authenticated customer"""
        return Donation.objects.filter(customer=self.request.user)

    def list(self, request, *args, **kwargs):
        """Return list of donations"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class DonationDetailView(generics.RetrieveAPIView):
    """
    View Donation
    GET /api/donations/<id>/
    Auth: Customer (owner only) or Store (assigned store only)
    """
    permission_classes = [IsAuthenticated]
    serializer_class = DonationDetailSerializer

    def get_queryset(self):
        """Filter based on user role"""
        user = self.request.user
        if user.role == 'Customer':
            return Donation.objects.filter(customer=user)
        elif user.role == 'Store':
            return Donation.objects.filter(store=user)
        return Donation.objects.none()

    def get_object(self):
        """Get donation and check permissions"""
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['pk'])
        return obj

    def retrieve(self, request, *args, **kwargs):
        """Return donation details"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class DonationUpdateView(generics.UpdateAPIView):
    """
    Update Donation (Only if Pending)
    PUT /api/donations/<id>/update/
    Auth: Customer (owner only)
    """
    permission_classes = [IsAuthenticated, IsCustomer]
    serializer_class = DonationUpdateSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        """Return only pending donations belonging to the authenticated customer"""
        return Donation.objects.filter(
            customer=self.request.user,
            donation_status=Donation.DonationStatus.PENDING
        )


class DonationDeleteView(generics.DestroyAPIView):
    """
    Delete Donation (Only if Pending)
    DELETE /api/donations/<id>/delete/
    Auth: Customer (owner only)
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        """Return only pending donations belonging to the authenticated customer"""
        return Donation.objects.filter(
            customer=self.request.user,
            donation_status=Donation.DonationStatus.PENDING
        )

    def destroy(self, request, *args, **kwargs):
        """Delete donation and return success message"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Donation deleted successfully"},
            status=status.HTTP_200_OK
        )

# STORE DONATION VIEWS

class StoreDonationListView(generics.ListAPIView):
    """
    Store Donations List
    GET /api/store/donations/
    Auth: Store
    """
    permission_classes = [IsAuthenticated, IsStore]
    serializer_class = DonationListSerializer

    def get_queryset(self):
        """Return only donations assigned to the authenticated store"""
        return Donation.objects.filter(store=self.request.user)

    def list(self, request, *args, **kwargs):
        """Return list of donations"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class DonationStatusUpdateView(generics.UpdateAPIView):
    """
    Approve / Reject Donation
    PATCH /api/store/donations/<id>/status/
    Auth: Store
    """
    permission_classes = [IsAuthenticated, IsStore]
    serializer_class = DonationStatusUpdateSerializer

    def get_queryset(self):
        """Return only donations assigned to the authenticated store"""
        return Donation.objects.filter(store=self.request.user)

    def update(self, request, *args, **kwargs):
        """Update donation status"""
        instance = self.get_object()
        new_status = request.data.get('donation_status')
        
        if not new_status:
            return Response(
                {"error": "donation_status is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate status transitions manually
        current_status = instance.donation_status
        valid_transitions = {
            'Pending': ['Approved', 'Rejected'],
            'Approved': ['Collected'],
            'Rejected': [],
            'Collected': []
        }
        
        if new_status not in valid_transitions.get(current_status, []):
             return Response(
                {"error": f"Cannot change status from {current_status} to {new_status}."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Apply update
        instance.donation_status = new_status
        instance.save()

        Notification.objects.create(
            user=instance.customer,
            message=f"The status of your donation {instance.item_name} has been updated to {instance.donation_status}.",
            notification_type='donation',
            image_url=request.build_absolute_uri(instance.images.url) if instance.images else None
        )

        # Return updated donation details
        detail_serializer = DonationDetailSerializer(instance, context={'request': request})
        return Response({
            "message": f"Donation status updated to {instance.donation_status}",
            "data": detail_serializer.data
        }, status=status.HTTP_200_OK)


class StoreDonationDeleteView(generics.DestroyAPIView):
    """
    Delete Donation (Store)
    DELETE /api/donations/store/<id>/delete/
    Auth: Store
    """
    permission_classes = [IsAuthenticated, IsStore]

    def get_queryset(self):
        """Return only donations belonging to the authenticated store"""
        return Donation.objects.filter(store=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Delete donation and return success message"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Donation record removed successfully"},
            status=status.HTTP_200_OK
        )


class DonationCollectView(APIView):
    """
    Mark Donation as Collected
    PATCH /api/store/donations/<id>/collect/
    Auth: Store
    """
    permission_classes = [IsAuthenticated, IsStore]

    def patch(self, request, pk):
        """Mark donation as collected"""
        donation = get_object_or_404(
            Donation,
            pk=pk,
            store=request.user
        )

        if donation.donation_status != Donation.DonationStatus.APPROVED:
            return Response(
                {"error": "Only approved donations can be marked as collected"},
                status=status.HTTP_400_BAD_REQUEST
            )

        donation.donation_status = Donation.DonationStatus.COLLECTED
        donation.save()

        Notification.objects.create(
            user=donation.customer,
            message=f"Store {request.user.store_name} has marked your donation {donation.item_name} as collected. Thank you!",
            notification_type='donation',
            image_url=request.build_absolute_uri(donation.images.url) if donation.images else None
        )

        serializer = DonationDetailSerializer(donation, context={'request': request})
        return Response({
            "message": "Donation marked as collected",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


# UTILITY VIEWS

class StoreListForDonationView(APIView):
    """
    Get list of stores for donation form
    GET /api/donations/stores/
    Auth: Customer
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def get(self, request):
        """Return list of all active stores"""
        stores = User.objects.filter(role='Store', is_active=True)
        store_list = [
            {
                'id': store.id,
                'store_name': store.store_name,
                'city': store.city,
                'store_address': store.store_address,
            }
            for store in stores
        ]
        return Response({
            "stores": store_list
        }, status=status.HTTP_200_OK)


# ADMIN DONATION VIEWS

from accounts.permissions import IsAdmin

class AdminDonationListView(generics.ListAPIView):
    """
    List all pending donations for admin moderation
    GET /api/donations/admin/
    Auth: Admin
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = DonationListSerializer

    def get_queryset(self):
        return Donation.objects.filter(donation_status=Donation.DonationStatus.PENDING).order_by('-created_at')

class AdminDonationAcceptView(APIView):
    """
    Approve/Accept donation by Admin
    PATCH /api/donations/admin/<id>/accept/
    Auth: Admin
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        donation = get_object_or_404(Donation, pk=pk)
        donation.donation_status = Donation.DonationStatus.APPROVED
        donation.save()
        
        Notification.objects.create(
            user=donation.customer,
            message=f"Admin has approved your donation pledge: {donation.item_name}.",
            notification_type='donation',
            image_url=request.build_absolute_uri(donation.images.url) if donation.images else None
        )
        
        return Response({
            "message": "Donation approved by admin",
            "status": donation.donation_status,
            "data": DonationDetailSerializer(donation, context={'request': request}).data
        }, status=status.HTTP_200_OK)

class AdminDonationRejectView(APIView):
    """
    Reject donation by Admin
    PATCH /api/donations/admin/<id>/reject/
    Auth: Admin
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        donation = get_object_or_404(Donation, pk=pk)
        donation.donation_status = Donation.DonationStatus.REJECTED
        donation.save()

        Notification.objects.create(
            user=donation.customer,
            message=f"Admin has rejected your donation pledge: {donation.item_name}.",
            notification_type='donation',
            image_url=request.build_absolute_uri(donation.images.url) if donation.images else None
        )
        
        return Response({
            "message": "Donation rejected by admin",
            "status": donation.donation_status
        }, status=status.HTTP_200_OK)