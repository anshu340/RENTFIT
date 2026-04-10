from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
import pytest
from accounts.models import User, Clothing
from .models import Rental, DamageReport
from notifications.models import Notification
from datetime import date, timedelta

pytestmark = pytest.mark.django_db

class RentalTests(APITestCase):
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
            name='Test Store',
            store_name='Fashion Hub'
        )
        # Create Clothing
        self.clothing = Clothing.objects.create(
            store=self.store,
            item_name='Red Wedding Dress',
            category='Traditional',
            gender='Female',
            size='S, M, L',
            condition='New',
            rental_price=5000.00,
            stock_quantity=3
        )

    def test_customer_request_rental(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('rental-create')
        data = {
            'clothing': self.clothing.id,
            'rent_start_date': date.today(),
            'rent_end_date': date.today() + timedelta(days=3),
            'selected_size': 'M'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rental.objects.count(), 1)
        rental = Rental.objects.first()
        self.assertEqual(rental.customer, self.customer)
        self.assertEqual(rental.status, 'pending')
        # Check store notification
        self.assertTrue(Notification.objects.filter(user=self.store, notification_type='rental').exists())

    def test_store_approve_rental_stock_decrease(self):
        rental = Rental.objects.create(
            customer=self.customer,
            store=self.store,
            clothing=self.clothing,
            rent_start_date=date.today(),
            rent_end_date=date.today() + timedelta(days=3),
            total_price=15000.00,
            status='pending'
        )
        
        initial_stock = self.clothing.stock_quantity
        self.client.force_authenticate(user=self.store)
        url = reverse('rental-approve', kwargs={'pk': rental.id})
        response = self.client.patch(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rental.refresh_from_db()
        self.assertEqual(rental.status, 'approved')
        self.clothing.refresh_from_db()
        self.assertEqual(self.clothing.stock_quantity, initial_stock - 1)

    def test_customer_return_flow(self):
        rental = Rental.objects.create(
            customer=self.customer,
            store=self.store,
            clothing=self.clothing,
            rent_start_date=date.today() - timedelta(days=2),
            rent_end_date=date.today(),
            total_price=10000.00,
            status='approved'
        )
        
        # Step 1: Customer marks as returned
        self.client.force_authenticate(user=self.customer)
        url_mark = reverse('rental-mark-return', kwargs={'pk': rental.id})
        response = self.client.patch(url_mark)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rental.refresh_from_db()
        self.assertEqual(rental.status, 'returned_pending')
        
        # Step 2: Store confirms return
        initial_stock = self.clothing.stock_quantity
        self.client.force_authenticate(user=self.store)
        url_confirm = reverse('rental-confirm-return', kwargs={'pk': rental.id})
        response = self.client.patch(url_confirm)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rental.refresh_from_db()
        self.assertEqual(rental.status, 'returned_confirmed')
        self.clothing.refresh_from_db()
        self.assertEqual(self.clothing.stock_quantity, initial_stock + 1)

    def test_damage_report_submission(self):
        rental = Rental.objects.create(
            customer=self.customer,
            store=self.store,
            clothing=self.clothing,
            rent_start_date=date.today(),
            rent_end_date=date.today(),
            total_price=5000.00,
            status='approved'
        )
        
        self.client.force_authenticate(user=self.customer)
        url = reverse('damage-report-submit')
        data = {
            'rental': rental.id,
            'description': 'Small tear in the seam.'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DamageReport.objects.count(), 1)
        report = DamageReport.objects.first()
        self.assertEqual(report.user, self.customer)
        self.assertEqual(report.status, 'pending')
        # Check store notification
        self.assertTrue(Notification.objects.filter(user=self.store, notification_type='rental').exists())

    def test_store_action_on_damage_report(self):
        rental = Rental.objects.create(
            customer=self.customer,
            store=self.store,
            clothing=self.clothing,
            rent_start_date=date.today(),
            rent_end_date=date.today(),
            total_price=5000.00,
            status='approved'
        )
        report = DamageReport.objects.create(
            rental=rental,
            user=self.customer,
            clothing=self.clothing,
            description='Test damage'
        )
        
        self.client.force_authenticate(user=self.store)
        url = reverse('damage-report-action', kwargs={'pk': report.id})
        data = {
            'status': 'accepted',
            'extra_charge': 500.00
        }
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        report.refresh_from_db()
        self.assertEqual(report.status, 'accepted')
        self.assertEqual(report.extra_charge, 500.00)
        # Check customer notification
        self.assertTrue(Notification.objects.filter(user=self.customer, notification_type='rental').exists())

# --- PyTest style tests ---

# UT12 - Rental/booking creation success
def test_rental_booking_success(db):
    from accounts.models import User, Clothing
    from rent.models import Rental
    client = APIClient()
    customer = User.objects.create_user(email='c1@t.com', password='p', role='Customer')
    store = User.objects.create_user(email='s1@t.com', password='p', role='Store', is_store=True, store_name='S1')
    clothing = Clothing.objects.create(
        store=store, item_name='Suit', category='Formal Wear', gender='Male', size='L', condition='New', rental_price=1000, stock_quantity=1
    )
    client.force_authenticate(user=customer)
    url = reverse('rental-create')
    data = {
        'clothing': clothing.id,
        'rent_start_date': date.today(),
        'rent_end_date': date.today() + timedelta(days=1),
        'selected_size': 'L'
    }
    response = client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert Rental.objects.count() == 1

# UT13 - Rental/booking with invalid data (failure)
def test_rental_booking_invalid_data(db):
    from accounts.models import User, Clothing
    client = APIClient()
    customer = User.objects.create_user(email='c2@t.com', password='p', role='Customer')
    store = User.objects.create_user(email='s2@t.com', password='p', role='Store', is_store=True, store_name='S2')
    clothing = Clothing.objects.create(
        store=store, item_name='Suit', category='Formal Wear', gender='Male', size='L', condition='New', rental_price=1000, stock_quantity=1
    )
    client.force_authenticate(user=customer)
    url = reverse('rental-create')
    # End date before start date
    data = {
        'clothing': clothing.id,
        'rent_start_date': date.today(),
        'rent_end_date': date.today() - timedelta(days=1),
        'selected_size': 'L'
    }
    response = client.post(url, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
