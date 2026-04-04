from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Clothing

class ClothingApprovalTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create Store User
        self.store = User.objects.create_user(
            email='store@example.com',
            password='password123',
            name='Test Store',
            role='Store',
            is_store=True,
            is_verified=True
        )
        
        # Create Admin User
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            name='Admin User',
            is_verified=True,
            is_superuser=True,
            is_staff=True
        )
        
        # Create Customer User
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='password123',
            name='Test Customer',
            role='Customer',
            is_verified=True
        )

    def test_store_cannot_set_status_on_create(self):
        self.client.force_authenticate(user=self.store)
        data = {
            'item_name': 'New Item',
            'category': 'Casual',
            'event_type': 'Casual',
            'gender': 'Male',
            'size': 'M',
            'condition': 'New',
            'rental_price': 100.00,
            'security_deposit': 500.00,
            'stock_quantity': 1,
            'status': 'approved'  # Attempt to bypass
        }
        url = reverse('clothing-create')
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], Clothing.ClothingApproval.PENDING) # Should still be pending
        
        clothing = Clothing.objects.get(id=response.data['id'])
        self.assertEqual(clothing.status, Clothing.ClothingApproval.PENDING)

    def test_public_list_only_shows_approved_items(self):
        # Create one approved and one pending item
        Clothing.objects.create(
            store=self.store, item_name='Approved Item', status=Clothing.ClothingApproval.APPROVED,
            category='Casual', gender='Male', size='L', rental_price=10.0
        )
        Clothing.objects.create(
            store=self.store, item_name='Pending Item', status=Clothing.ClothingApproval.PENDING,
            category='Casual', gender='Male', size='L', rental_price=10.0
        )
        
        url = reverse('all-clothing')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Assuming listing returns a list directly or in 'data' field
        items = response.data
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['item_name'], 'Approved Item')

    def test_admin_can_approve_item(self):
        clothing = Clothing.objects.create(
            store=self.store, item_name='To Approve', status=Clothing.ClothingApproval.PENDING,
            category='Casual', gender='Male', size='L', rental_price=10.0
        )
        
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-clothing-approval', kwargs={'pk': clothing.id, 'action': 'approve'})
        response = self.client.post(url, {'status': Clothing.ClothingApproval.APPROVED})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        clothing.refresh_from_db()
        self.assertEqual(clothing.status, Clothing.ClothingApproval.APPROVED)

    def test_store_cannot_approve_own_item(self):
        clothing = Clothing.objects.create(
            store=self.store, item_name='Wait For Admin', status=Clothing.ClothingApproval.PENDING,
            category='Casual', gender='Male', size='L', rental_price=10.0
        )
        
        self.client.force_authenticate(user=self.store)
        url = reverse('admin-clothing-approval', kwargs={'pk': clothing.id, 'action': 'approve'})
        response = self.client.post(url, {'status': Clothing.ClothingApproval.APPROVED})
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        clothing.refresh_from_db()
        self.assertEqual(clothing.status, Clothing.ClothingApproval.PENDING)
