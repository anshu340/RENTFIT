from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Rental
from .serializers import RentalSerializer, RentalCreateSerializer
from django.shortcuts import get_object_or_404

class RentalCreateView(generics.CreateAPIView):
    """
    POST /api/rentals/create/
    Allows Customers to create a rental request.
    Status starts as 'pending'.
    """
    serializer_class = RentalCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if request.user.role != 'Customer':
            return Response({"error": "Only customers can create rentals."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

class CustomerRentalListView(generics.ListAPIView):
    """
    GET /api/rentals/my/
    Returns rentals of the logged-in customer.
    """
    serializer_class = RentalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Rental.objects.filter(customer=self.request.user)

class StoreRentalListView(generics.ListAPIView):
    """
    GET /api/rentals/store/
    Returns rentals where store = logged-in store.
    """
    serializer_class = RentalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Rental.objects.filter(store=self.request.user)

class RentalApproveView(generics.UpdateAPIView):
    """
    PATCH /api/rentals/{id}/approve/
    Store only: pending -> approved.
    Decreases clothing.available_quantity by 1.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = RentalSerializer

    def patch(self, request, pk):
        if request.user.role != 'Store':
            return Response({"error": "Only stores can approve rentals."}, status=status.HTTP_403_FORBIDDEN)
        
        rental = get_object_or_404(Rental, pk=pk, store=request.user, status='pending')
        clothing = rental.clothing
        
        if clothing.available_quantity > 0:
            rental.status = 'approved'
            rental.save()
            clothing.available_quantity -= 1
            clothing.save()
            return Response({"message": "Rental approved and stock updated."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "No stock available to approve this rental."}, status=status.HTTP_400_BAD_REQUEST)

class RentalRejectView(generics.UpdateAPIView):
    """
    PATCH /api/rentals/{id}/reject/
    Store only: pending -> rejected.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = RentalSerializer

    def patch(self, request, pk):
        if request.user.role != 'Store':
            return Response({"error": "Only stores can reject rentals."}, status=status.HTTP_403_FORBIDDEN)
        
        rental = get_object_or_404(Rental, pk=pk, store=request.user, status='pending')
        rental.status = 'rejected'
        rental.save()
        return Response({"message": "Rental rejected."}, status=status.HTTP_200_OK)

class RentalMarkReturnedView(generics.UpdateAPIView):
    """
    PATCH /api/rentals/{id}/mark-return/
    Customer only: approved -> returned_pending.
    Note: Also allowing 'rented' as source status for flexibility if needed by FE.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = RentalSerializer

    def patch(self, request, pk):
        if request.user.role != 'Customer':
            return Response({"error": "Only customers can mark items as returned."}, status=status.HTTP_403_FORBIDDEN)
        
        # We allow marking as returned from either 'approved' or 'rented'
        rental = get_object_or_404(Rental, pk=pk, customer=request.user)
        if rental.status not in ['approved', 'rented']:
            return Response({"error": "Only approved or rented items can be marked as returned."}, status=status.HTTP_400_BAD_REQUEST)
            
        rental.status = 'returned_pending'
        rental.save()
        return Response({"message": "Item marked as returned. Waiting for store confirmation."}, status=status.HTTP_200_OK)

class RentalConfirmReturnView(generics.UpdateAPIView):
    """
    PATCH /api/rentals/{id}/confirm-return/
    Store only: returned_pending -> returned_confirmed.
    Increases available_quantity by 1.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = RentalSerializer

    def patch(self, request, pk):
        if request.user.role != 'Store':
            return Response({"error": "Only stores can confirm returns."}, status=status.HTTP_403_FORBIDDEN)
        
        rental = get_object_or_404(Rental, pk=pk, store=request.user, status='returned_pending')
        rental.status = 'returned_confirmed'
        rental.save()
        
        clothing = rental.clothing
        clothing.available_quantity += 1
        clothing.save()
        
        return Response({"message": "Return confirmed and stock updated."}, status=status.HTTP_200_OK)
