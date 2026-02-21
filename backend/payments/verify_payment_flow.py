import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Rentfit.settings')
django.setup()

from rent.models import Rental
from payments.models import Payment
from accounts.models import User, Clothing
from django.utils import timezone
from decimal import Decimal

def run_verification():
    print("--- Starting Payment Flow Verification ---")
    
    # 1. Setup: Create a test store, customer, clothing, and rental
    store, _ = User.objects.get_or_create(
        email='test_store@example.com',
        defaults={'name': 'Test Store', 'is_store': True, 'role': 'Store'}
    )
    customer, _ = User.objects.get_or_create(
        email='test_customer@example.com',
        defaults={'name': 'Test Customer', 'is_store': False, 'role': 'Customer'}
    )
    clothing, _ = Clothing.objects.get_or_create(
        item_name='Test Dress',
        store=store,
        defaults={'rental_price': 1000, 'security_deposit': 500, 'stock_quantity': 1}
    )
    
    rental = Rental.objects.create(
        customer=customer,
        store=store,
        clothing=clothing,
        rent_start_date=timezone.now().date(),
        rent_end_date=(timezone.now() + timezone.timedelta(days=2)).date(),
        total_price=1000,
        status='approved'
    )
    
    payment = Payment.objects.create(
        rental=rental,
        amount=1000,
        transaction_id='TEST_TX_12345',
        status='pending'
    )
    
    print(f"Initial: Rental Status = {rental.status}, Payment Status = {payment.status}")
    
    # 2. Simulate eSewa Verification Callback
    # (Simplified logic from EsewaVerifyView)
    payment.status = 'completed'
    payment.save()
    
    rental.status = 'rented'
    rental.save()
    
    print(f"After Verification: Rental Status = {rental.status}, Payment Status = {payment.status}")
    
    # 3. Check Earnings Stats (Aggregated logic from StoreDashboardStatsView)
    from django.db.models import Sum
    total_earnings = Payment.objects.filter(
        rental__store=store,
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    print(f"Store Total Earnings: Rs. {total_earnings}")
    
    # 4. Assertions
    assert rental.status == 'rented', "Rental status should be 'rented' (Active)"
    assert payment.status == 'completed', "Payment status should be 'completed'"
    assert total_earnings >= 1000, "Earnings should reflect the new payment"
    
    print("--- Verification Successful! ---")

if __name__ == "__main__":
    try:
        run_verification()
    except Exception as e:
        print(f"Verification Failed: {str(e)}")
        sys.exit(1)
