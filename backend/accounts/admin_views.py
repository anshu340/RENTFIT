from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count
from django.apps import apps
from .models import User
from .serializers import UserSerializer, StoreReadSerializer, CustomerReadSerializer
from .permissions import IsAdmin

class AdminStatsView(APIView):
    """
    GET /api/accounts/admin/stats/
    Provides global platform statistics for the Admin.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        # User counts
        total_users = User.objects.count()
        total_customers = User.objects.filter(role='Customer').count()
        total_stores = User.objects.filter(role='Store').count()
        
        # Financial stats
        Rental = apps.get_model('rent', 'Rental')
        total_revenue = Rental.objects.filter(
            status__in=['approved', 'rented', 'returned_confirmed']
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        # Donation stats
        Donation = apps.get_model('donations', 'Donation')
        total_donations = Donation.objects.count()
        collected_donations = Donation.objects.filter(donation_status='collected').count()

        return Response({
            "total_users": total_users,
            "total_customers": total_customers,
            "total_stores": total_stores,
            "total_revenue": float(total_revenue),
            "total_donations": total_donations,
            "collected_donations": collected_donations
        }, status=status.HTTP_200_OK)

class AdminUserListView(generics.ListAPIView):
    """
    GET /api/accounts/admin/users/
    Lists all users for admin management.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    serializer_class = UserSerializer
    queryset = User.objects.all().order_by('-date_joined')

class AdminUserDeactivateView(APIView):
    """
    PATCH /api/accounts/admin/users/<id>/deactivate/
    Deactivates or reactivates a user account.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            # Toggle is_active
            user.is_active = not user.is_active
            user.save()
            action = "deactivated" if not user.is_active else "reactivated"
            return Response({"message": f"User {user.email} has been {action}."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class AdminGlobalActivityView(APIView):
    """
    GET /api/accounts/admin/activity/
    Overview of recent rentals and donations across the platform.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        Rental = apps.get_model('rent', 'Rental')
        Donation = apps.get_model('donations', 'Donation')
        
        recent_rentals = Rental.objects.all().order_by('-created_at')[:10]
        recent_donations = Donation.objects.all().order_by('-created_at')[:10]
        
        # We can reuse serializers if available, or build simple ones here
        from rent.serializers import RentalSerializer
        from donations.serializers import DonationListSerializer
        
        return Response({
            "recent_rentals": RentalSerializer(recent_rentals, many=True, context={'request': request}).data,
            "recent_donations": DonationListSerializer(recent_donations, many=True, context={'request': request}).data
        }, status=status.HTTP_200_OK)
