from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rent.models import Rental, DamageReport
from accounts.models import Clothing
from decimal import Decimal

User = get_user_model()

class DamageReportTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='password123',
            name='Test Customer',
            role='Customer'
        )
        self.store_owner = User.objects.create_user(
            email='store@example.com',
            password='password123',
            name='Test Store',
            is_store=True,
            store_name='MyStore'
        )
        self.other_store = User.objects.create_user(
            email='other@example.com',
            password='password123',
            name='Other Store',
            is_store=True,
            store_name='OtherStore'
        )
        
        self.clothing = Clothing.objects.create(
            store=self.store_owner,
            item_name='Red Dress',
            rental_price=Decimal('50.00'),
            stock_quantity=5,
            category='Dresses',
            gender='Female',
            size='M'
        )
        
        self.rental = Rental.objects.create(
            customer=self.customer,
            store=self.store_owner,
            clothing=self.clothing,
            rent_start_date='2026-02-15',
            rent_end_date='2026-02-17',
            total_price=Decimal('150.00'),
            status='rented'
        )

    def test_customer_submit_damage_report(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('damage-report-submit')
        data = {
            'rental': self.rental.id,
            'description': 'Stain on the front'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DamageReport.objects.count(), 1)
        self.assertEqual(DamageReport.objects.first().description, 'Stain on the front')

    def test_store_owner_view_reports(self):
        DamageReport.objects.create(
            rental=self.rental,
            user=self.customer,
            clothing=self.clothing,
            description='Tear in sleeve'
        )
        
        self.client.force_authenticate(user=self.store_owner)
        url = reverse('damage-report-store')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_other_store_cannot_view_reports(self):
        DamageReport.objects.create(
            rental=self.rental,
            user=self.customer,
            clothing=self.clothing,
            description='Tear in sleeve'
        )
        
        self.client.force_authenticate(user=self.other_store)
        url = reverse('damage-report-store')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_store_owner_action_accept(self):
        report = DamageReport.objects.create(
            rental=self.rental,
            user=self.customer,
            clothing=self.clothing,
            description='Tear in sleeve'
        )
        
        self.client.force_authenticate(user=self.store_owner)
        url = reverse('damage-report-action', kwargs={'pk': report.id})
        data = {
            'status': 'accepted',
            'extra_charge': '10.00'
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        report.refresh_from_db()
        self.assertEqual(report.status, 'accepted')
        self.assertEqual(report.extra_charge, Decimal('10.00'))

    def test_unauthorized_submit(self):
        other_customer = User.objects.create_user(
            email='other_cust@example.com',
            password='password123',
            name='Other Customer',
            role='Customer'
        )
        self.client.force_authenticate(user=other_customer)
        url = reverse('damage-report-submit')
        data = {
            'rental': self.rental.id,
            'description': 'Stain'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
