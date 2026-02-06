import uuid
import requests
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Payment
from .utils import generate_signature
from rent.models import Rental

class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        rental_id = request.data.get("rental_id")
        try:
            rental = Rental.objects.get(id=rental_id)
        except Rental.DoesNotExist:
            return Response({"error": "Rental not found"}, status=404)

        transaction_uuid = str(uuid.uuid4())
        
        # Ensure amount is a string with no trailing zeros if it's a whole number, 
        # but matching what eSewa expects. Using format to ensure consistency.
        # eSewa v2 often expects no more than 2 decimal places.
        amount_str = str(rental.total_price)
        if amount_str.endswith(".00"):
            amount_str = amount_str[:-3]
        elif amount_str.endswith(".0"):
            amount_str = amount_str[:-2]

        # Create payment record
        Payment.objects.create(
            rental=rental,
            amount=rental.total_price,
            transaction_id=transaction_uuid
        )

        signature = generate_signature(amount_str, transaction_uuid, settings.ESEWA_PRODUCT_CODE)

        return Response({
            "payment_url": settings.ESEWA_PAYMENT_URL,
            "amount": amount_str,
            "tax_amount": "0",
            "total_amount": amount_str,
            "transaction_uuid": transaction_uuid,
            "product_code": settings.ESEWA_PRODUCT_CODE,
            "product_service_charge": "0",
            "product_delivery_charge": "0",
            "success_url": "http://127.0.0.1:8000/api/payments/verify/",
            "failure_url": "http://127.0.0.1:8000/api/payments/failure/",
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": signature
        })

class EsewaVerifyView(APIView):
    def get(self, request):
        import base64
        import json
        from notifications.models import Notification  # Import here to avoid circular imports if any

        data = request.GET.get("data")
        if not data:
            return redirect("http://localhost:5173/payment-failure")

        try:
            # Decode the base64 encoded data from eSewa
            decoded_bytes = base64.b64decode(data)
            decoded_str = decoded_bytes.decode("utf-8")
            decoded_data = json.loads(decoded_str)
            
            transaction_uuid = decoded_data.get("transaction_uuid")
            if not transaction_uuid:
                print("Error: No transaction_uuid in decoded data")
                return redirect("http://localhost:5173/payment-failure")
                
            payment = Payment.objects.get(transaction_id=transaction_uuid)
            
            # Verify status from decoded data
            if decoded_data.get("status") != "COMPLETE":
                print(f"Payment status is {decoded_data.get('status')}")
                payment.status = "failed"
                payment.save()
                return redirect("http://localhost:5173/payment-failure")

            # Update status
            payment.status = "completed"
            payment.save()
            
            rental = payment.rental
            rental.status = "approved"
            rental.save()

            # Create Notification for Store Owner
            Notification.objects.create(
                user=rental.store,
                message=f"Payment received for rental of '{rental.clothing.item_name}'.",
                notification_type='rental'
            )
            
            return redirect("http://localhost:5173/payment-success")
            
        except Exception as e:
            print(f"Verification Error: {str(e)}")
            return redirect("http://localhost:5173/payment-failure")

class EsewaFailureView(APIView):
    def get(self, request):
        return redirect("http://localhost:5173/payment-failure")
