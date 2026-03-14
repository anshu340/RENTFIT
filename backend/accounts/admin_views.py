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

        # Revenue History (All Time)
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models.functions import TruncDate

        # Get all approved/rented/returned rentals
        revenue_history_qs = Rental.objects.filter(
            status__in=['approved', 'rented', 'returned_confirmed']
        ).annotate(date=TruncDate('created_at')).values('date').annotate(
            daily_total=Sum('total_price')
        ).order_by('date')

        revenue_history = []
        
        # If there are no rentals, just return empty list or a default flatline
        if revenue_history_qs.exists():
            first_rental_date = revenue_history_qs.first()['date']
            end_date = timezone.now().date()
            
            history_dict = {item['date']: float(item['daily_total']) for item in revenue_history_qs}
            
            current_date = first_rental_date
            while current_date <= end_date:
                revenue_history.append({
                    "date": current_date.strftime('%Y-%m-%d'),
                    "revenue": history_dict.get(current_date, 0.0)
                })
                current_date += timedelta(days=1)
        else:
            # Fallback if no data exists at all
            thirty_days_ago = timezone.now() - timedelta(days=30)
            current_date = thirty_days_ago.date()
            end_date = timezone.now().date()
            while current_date <= end_date:
                revenue_history.append({
                    "date": current_date.strftime('%Y-%m-%d'),
                    "revenue": 0.0
                })
                current_date += timedelta(days=1)

        # User distribution for Pie Chart
        user_distribution = [
            {"name": "Customers", "value": total_customers, "color": "#6366f1"},  # Indigo-500
            {"name": "Stores", "value": total_stores, "color": "#f59e0b"},     # Amber-500
            {"name": "Admins", "value": User.objects.filter(role='Admin').count(), "color": "#8b5cf6"} # Violet-500
        ]

        return Response({
            "total_users": total_users,
            "total_customers": total_customers,
            "total_stores": total_stores,
            "total_revenue": float(total_revenue),
            "total_donations": total_donations,
            "collected_donations": collected_donations,
            "revenue_history": revenue_history,
            "user_distribution": user_distribution
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
