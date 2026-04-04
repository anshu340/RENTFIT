from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import User
from .models import Conversation, Message
from notifications.models import Notification

class ChatTestCase(APITestCase):
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
        # Create Another User to check permissions
        self.other_user = User.objects.create_user(
            email='other@test.com',
            password='password123',
            role='Customer'
        )

    def test_start_conversation_as_customer(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('start-chat', kwargs={'store_id': self.store.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Conversation.objects.count(), 1)
        conversation = Conversation.objects.first()
        self.assertEqual(conversation.customer, self.customer)
        self.assertEqual(conversation.store, self.store)

    def test_start_conversation_as_store_fails(self):
        self.client.force_authenticate(user=self.store)
        url = reverse('start-chat', kwargs={'store_id': self.store.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Conversation.objects.count(), 0)

    def test_start_conversation_with_invalid_store(self):
        self.client.force_authenticate(user=self.customer)
        # Try to start chat with another customer (not a store)
        url = reverse('start-chat', kwargs={'store_id': self.other_user.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_user_conversations(self):
        # Create conversation manually
        Conversation.objects.create(customer=self.customer, store=self.store)
        
        self.client.force_authenticate(user=self.customer)
        url = reverse('my_conversations')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_send_message_in_conversation(self):
        conversation = Conversation.objects.create(customer=self.customer, store=self.store)
        
        self.client.force_authenticate(user=self.customer)
        url = reverse('send_message', kwargs={'conversation_id': conversation.id})
        data = {'text': 'Hello Store!'}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 1)
        
        message = Message.objects.first()
        self.assertEqual(message.text, 'Hello Store!')
        self.assertEqual(message.sender, self.customer)
        self.assertEqual(message.conversation, conversation)

        # Check notification creation
        self.assertEqual(Notification.objects.count(), 1)
        notification = Notification.objects.first()
        self.assertEqual(notification.user, self.store)
        self.assertEqual(notification.notification_type, 'chat')

    def test_send_message_forbidden(self):
        conversation = Conversation.objects.create(customer=self.customer, store=self.store)
        
        # Authenticate as a different user not in the conversation
        self.client.force_authenticate(user=self.other_user)
        url = reverse('send_message', kwargs={'conversation_id': conversation.id})
        data = {'text': 'Snooping...'}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Message.objects.count(), 0)

    def test_get_conversation_messages(self):
        conversation = Conversation.objects.create(customer=self.customer, store=self.store)
        Message.objects.create(conversation=conversation, sender=self.customer, text='Hello')
        Message.objects.create(conversation=conversation, sender=self.store, text='Hi there')
        
        self.client.force_authenticate(user=self.store)
        url = reverse('conversation_messages', kwargs={'conversation_id': conversation.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        # Check that messages get marked as read correctly
        # The store is viewing messages, so the customer's message should now be read
        self.assertTrue(Message.objects.get(text='Hello').is_read)
        # Store's own message remains unread based on the logic
        self.assertFalse(Message.objects.get(text='Hi there').is_read)
