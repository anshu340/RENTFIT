from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import User
from .models import Donation
from notifications.models import Notification
import os
from django.core.files.uploadedfile import SimpleUploadedFile

class DonationTests(APITestCase):
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
            store_name='Fashion Hub',
            city='Kathmandu',
            store_address='Durbarmarg'
        )

    def test_create_donation_pledge(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('donation-create')
        data = {
            'item_name': 'Blue Jeans',
            'category': 'Pants',
            'gender': 'Male',
            'size': '32',
            'condition': 'Good',
            'description': 'Slightly used blue jeans',
            'store_id': self.store.id
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Donation.objects.count(), 1)
        donation = Donation.objects.first()
        self.assertEqual(donation.item_name, 'Blue Jeans')
        self.assertEqual(donation.customer, self.customer)
        self.assertEqual(donation.store, self.store)
        
        # Check if notification was created for store
        self.assertTrue(Notification.objects.filter(user=self.store, notification_type='donation').exists())

    def test_get_customer_donations(self):
        Donation.objects.create(
            customer=self.customer,
            store=self.store,
            item_name='Red Shirt',
            category='Shirt',
            gender='Unisex',
            size='M',
            condition='New'
        )
        
        self.client.force_authenticate(user=self.customer)
        url = reverse('customer-donations')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['item_name'], 'Red Shirt')

    def test_store_approve_donation(self):
        donation = Donation.objects.create(
            customer=self.customer,
            store=self.store,
            item_name='Old Jacket',
            category='Jacket',
            gender='Female',
            size='L',
            condition='Used'
        )
        
        self.client.force_authenticate(user=self.store)
        url = reverse('donation-status-update', kwargs={'pk': donation.id})
        data = {'donation_status': 'Approved'}
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        donation.refresh_from_db()
        self.assertEqual(donation.donation_status, 'Approved')
        
        # Check if notification was created for customer
        self.assertTrue(Notification.objects.filter(user=self.customer, notification_type='donation').exists())

    def test_donation_invalid_status_transition(self):
        donation = Donation.objects.create(
            customer=self.customer,
            store=self.store,
            item_name='Hat',
            category='Accessories',
            gender='Unisex',
            size='Free',
            condition='New',
            donation_status='Approved'
        )
        
        self.client.force_authenticate(user=self.store)
        url = reverse('donation-status-update', kwargs={'pk': donation.id})
        # Cannot go from Approved back to Pending
        data = {'donation_status': 'Pending'}
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_store_list_for_donation(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('store-list-for-donation')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(s['store_name'] == 'Fashion Hub' for s in response.data['stores']))
