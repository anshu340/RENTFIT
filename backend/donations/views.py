from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404

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
        serializer.save()


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
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Return updated donation details
        detail_serializer = DonationDetailSerializer(instance, context={'request': request})
        return Response({
            "message": f"Donation status updated to {instance.donation_status}",
            "data": detail_serializer.data
        }, status=status.HTTP_200_OK)


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