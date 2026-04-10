from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import User
from .models import Notification

class NotificationTests(APITestCase):
    def setUp(self):
        # Create User
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='password123',
            name='Test User'
        )
        # Create some notifications
        self.notif1 = Notification.objects.create(
            user=self.user,
            message='Your rental is pending approval.',
            notification_type='rental'
        )
        self.notif2 = Notification.objects.create(
            user=self.user,
            message='New donation pledge received.',
            notification_type='donation'
        )

    def test_get_user_notifications(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('notification-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify both notifications are returned
        self.assertEqual(len(response.data), 2)
        # Test default ordering (most recent first)
        self.assertEqual(response.data[0]['message'], 'New donation pledge received.')

    def test_mark_notification_as_read(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('mark-as-read', kwargs={'pk': self.notif1.id})
        response = self.client.patch(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif1.refresh_from_db()
        self.assertTrue(self.notif1.is_read)

    def test_mark_all_notifications_as_read(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('mark-all-read')
        response = self.client.patch(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Both notifications should now be read
        self.assertEqual(Notification.objects.filter(user=self.user, is_read=False).count(), 0)

    def test_unread_notification_count(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('unread-count')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['unread_count'], 2)
        
        # Mark one as read and check count again
        self.notif1.is_read = True
        self.notif1.save()
        
        response = self.client.get(url)
        self.assertEqual(response.data['unread_count'], 1)

    def test_cannot_read_others_notification(self):
        # Create another user
        other_user = User.objects.create_user(
            email='other@test.com',
            password='password123'
        )
        # Try to mark our user's notification as read by this other user
        self.client.force_authenticate(user=other_user)
        url = reverse('mark-as-read', kwargs={'pk': self.notif1.id})
        response = self.client.patch(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.notif1.refresh_from_db()
        self.assertFalse(self.notif1.is_read)
