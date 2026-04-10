from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
import pytest
from accounts.models import User, Clothing
from rent.models import Rental
from .models import Payment
from datetime import date, timedelta

pytestmark = pytest.mark.django_db

class PaymentTests(APITestCase):
    def setUp(self):
        # Create Customer
        self.customer = User.objects.create_user(
            email='customer@test.com',
            password='password123',
            role='Customer',
            name='Test Customer'
        )
        # Create Store
        self.store = User.objects.create_user(
            email='store@test.com',
            password='password123',
            role='Store',
            is_store=True,
            name='Test Store'
        )
        # Create Clothing
        self.clothing = Clothing.objects.create(
            store=self.store,
            item_name='Test Suit',
            category='Formal Wear',
            gender='Male',
            size='L',
            condition='New',
            rental_price=1000.00,
            stock_quantity=5
        )
        # Create Rental
        self.rental = Rental.objects.create(
            customer=self.customer,
            store=self.store,
            clothing=self.clothing,
            rent_start_date=date.today(),
            rent_end_date=date.today() + timedelta(days=2),
            total_price=2000.00,
            status='approved'
        )

    def test_initiate_payment(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('payment-initiate')
        data = {'rental_id': self.rental.id}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('payment_url', response.data)
        self.assertIn('signature', response.data)
        self.assertEqual(Payment.objects.count(), 1)
        
        payment = Payment.objects.first()
        self.assertEqual(payment.rental, self.rental)
        self.assertEqual(payment.amount, 2000.00)
        self.assertEqual(payment.status, 'pending')

    def test_payment_failure_redirect(self):
        url = reverse('payment-failure')
        response = self.client.get(url)
        # should redirect to frontend failure page
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(response.url, "http://localhost:5173/payment-failure")

    # Verification test would require mocking base64 data from eSewa,
    # which is complex for a basic test, but we can test the structure.
    def test_verify_payment_missing_data(self):
        url = reverse('payment-verify')
        response = self.client.get(url)
        # missing 'data' param should redirect to failure
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(response.url, "http://localhost:5173/payment-failure")

# --- PyTest style tests ---

# UT14 - Payment initiation success test
def test_payment_initiation_success(db):
    from accounts.models import User, Clothing
    from rent.models import Rental
    from payments.models import Payment
    client = APIClient()
    customer = User.objects.create_user(email='pc@t.com', password='p', role='Customer')
    store = User.objects.create_user(email='ps@t.com', password='p', role='Store', is_store=True, store_name='PS1')
    clothing = Clothing.objects.create(
        store=store, item_name='Suit', category='Formal Wear', gender='Male', size='L', condition='New', rental_price=1000, stock_quantity=1
    )
    rental = Rental.objects.create(
        customer=customer, store=store, clothing=clothing, rent_start_date=date.today(), rent_end_date=date.today(), total_price=1000, status='approved'
    )
    client.force_authenticate(user=customer)
    url = reverse('payment-initiate')
    data = {'rental_id': rental.id}
    response = client.post(url, data)
    assert response.status_code == status.HTTP_200_OK
    assert 'payment_url' in response.data
    assert Payment.objects.filter(rental=rental).exists()
