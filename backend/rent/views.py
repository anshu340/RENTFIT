from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import Rental, DamageReport
from .serializers import RentalSerializer, RentalCreateSerializer, DamageReportSerializer
from notifications.models import Notification

class RentalCreateView(generics.CreateAPIView):
    """
    POST /api/rentals/create/
    Allows Customers to create a rental request.
    Status starts as 'pending'.
    """
    serializer_class = RentalCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        rental = serializer.save(customer=self.request.user)
        Notification.objects.create(
            user=rental.store,
            message=f"{self.request.user.email} requested to rent {rental.clothing.item_name}.",
            notification_type='rental',
            image_url=self.request.build_absolute_uri(rental.clothing.images.url) if rental.clothing.images else None
        )

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
        qs = Rental.objects.filter(store=self.request.user)
        print(f"DEBUG: Rental list for store {self.request.user}: {qs}")
        return qs

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
        
        if clothing.stock_quantity > 0:
            rental.status = 'approved'
            rental.save()
            clothing.stock_quantity -= 1
            clothing.save()

            Notification.objects.create(
                user=rental.customer,
                message=f"Your rental request for {clothing.item_name} has been approved by {request.user.store_name}.",
                notification_type='rental',
                image_url=request.build_absolute_uri(clothing.images.url) if clothing.images else None
            )
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

        Notification.objects.create(
            user=rental.customer,
            message=f"Your rental request for {rental.clothing.item_name} has been rejected by {request.user.store_name}.",
            notification_type='rental',
            image_url=request.build_absolute_uri(rental.clothing.images.url) if rental.clothing.images else None
        )
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

        Notification.objects.create(
            user=rental.store,
            message=f"Customer {request.user.email} has marked {rental.clothing.item_name} as returned. Please confirm.",
            notification_type='rental',
            image_url=request.build_absolute_uri(rental.clothing.images.url) if rental.clothing.images else None
        )
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
        clothing.stock_quantity += 1
        clothing.save()
        
        Notification.objects.create(
            user=rental.customer,
            message=f"Store {request.user.store_name} has confirmed the return of {rental.clothing.item_name}.",
            notification_type='rental',
            image_url=request.build_absolute_uri(clothing.images.url) if clothing.images else None
        )
        
        return Response({"message": "Return confirmed and stock updated."}, status=status.HTTP_200_OK)

class DamageReportSubmitView(generics.CreateAPIView):
    """
    POST /api/rentals/damage-report/submit/
    Customer only: submit damage report for their rental.
    """
    serializer_class = DamageReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        rental = serializer.validated_data['rental']
        serializer.save(
            user=self.request.user,
            clothing=rental.clothing
        )
        # Notify store
        Notification.objects.create(
            user=rental.store,
            message=f"New damage report submitted for {rental.clothing.item_name} by {self.request.user.email}.",
            notification_type='rental',
            image_url=self.request.build_absolute_uri(rental.clothing.images.url) if rental.clothing.images else None
        )

class DamageReportStoreView(generics.ListAPIView):
    """
    GET /api/rentals/damage-report/store/
    Store only: list damage reports for their items.
    """
    serializer_class = DamageReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'Store':
            return DamageReport.objects.none()
        return DamageReport.objects.filter(clothing__store=self.request.user)

class DamageReportActionView(generics.UpdateAPIView):
    """
    PATCH /api/rentals/damage-report/{id}/action/
    Store only: accept/reject report and add extra charge.
    """
    serializer_class = DamageReportSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'Store':
            return Response({"error": "Only stores can manage damage reports."}, status=status.HTTP_403_FORBIDDEN)
        
        report = get_object_or_404(DamageReport, pk=pk, clothing__store=request.user)
        
        # Simple update for status and extra_charge
        status_val = request.data.get('status')
        extra_charge = request.data.get('extra_charge')
        
        if status_val:
            if status_val not in DamageReport.Status.values:
                return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
            report.status = status_val
        
        if extra_charge:
            report.extra_charge = extra_charge
            
        report.save()

        Notification.objects.create(
            user=report.user,
            message=f"Your damage report for {report.clothing.item_name} has been {report.status}.",
            notification_type='rental',
            image_url=request.build_absolute_uri(report.clothing.images.url) if report.clothing.images else None
        )
        
        return Response(DamageReportSerializer(report).data, status=status.HTTP_200_OK)

class RentalDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/rentals/<id>/delete/
    Allows Customers to cancel pending or delete rejected rentals.
    """
    serializer_class = RentalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Customers can only delete their own rentals
        return Rental.objects.filter(customer=self.request.user)

    def perform_destroy(self, instance):
        if instance.status not in ["pending", "rejected"]:
            raise PermissionDenied("You can only cancel pending or delete rejected rentals.")
        instance.delete()

class RentalUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/rentals/<id>/update/
    Allows Customers to update the end date for pending or rejected rentals.
    Recalculates total_price based on new duration.
    """
    serializer_class = RentalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Rental.objects.filter(customer=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()

        if instance.status not in ["pending", "rejected", "approved"]:
            raise PermissionDenied("Only pending, rejected or approved rentals can be modified.")

        new_end_date = serializer.validated_data.get("rent_end_date")

        if new_end_date <= instance.rent_start_date:
            raise PermissionDenied("End date must be after start date.")

        # Recalculate price using clothing's rental_price
        days = (new_end_date - instance.rent_start_date).days + 1
        instance.total_price = days * instance.clothing.rental_price

        serializer.save(total_price=instance.total_price)
