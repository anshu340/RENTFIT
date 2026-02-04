from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from accounts.models import User

class StartConversationView(APIView):
    """
    Start or get a conversation with a store.
    Only Customers can start a conversation.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, store_id):
        if request.user.role != 'Customer':
            return Response(
                {"detail": "Only customers can start conversations."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Look up by ID first
        target_user = User.objects.filter(id=store_id).first()
        if not target_user:
            return Response({"error": "Store user not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Check role case-insensitively
        if target_user.role.lower() != 'store':
             return Response({"error": "User is not a store"}, status=status.HTTP_400_BAD_REQUEST)
             
        store = target_user
            
        # Optional: Check if role is store-like if needed, but finding the user is primary.
        # Keeping it simple as per user request to avoid crashes.
        
        conversation, created = Conversation.objects.get_or_create(
            customer=request.user,
            store=store
        )
        
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


class UserConversationsView(APIView):
    """
    List all conversations for the logged-in user (Customer or Store).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # DEBUGGING
        print(f"\n--- DEBUG UserConversationsView ---")
        print(f"Request User: {request.user.email} (ID: {request.user.id}, Role: {request.user.role})")
        
        conversations = Conversation.objects.filter(
            Q(customer=request.user) | Q(store=request.user)
        )
        print(f"Found {conversations.count()} conversations")
        if conversations.count() == 0:
            print(f"ALL CONVERSATIONS: {list(Conversation.objects.values('id', 'customer__email', 'store__email'))}")
        
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)


class MessageListView(APIView):
    """
    List messages for a specific conversation.
    Security: Only participants can view messages.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Security Check
        if request.user != conversation.customer and request.user != conversation.store:
            return Response(
                {"detail": "You do not have permission to view this conversation."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        messages = conversation.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


from notifications.models import Notification

class SendMessageView(APIView):
    """
    Send a message in a conversation.
    Security: Only participants can send messages.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Security Check
        if request.user != conversation.customer and request.user != conversation.store:
            return Response(
                {"detail": "You do not have permission to send messages to this conversation."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(conversation=conversation, sender=request.user)
            
            # Create Notification
            if request.user == conversation.customer:
                recipient = conversation.store
            else:
                recipient = conversation.customer

            Notification.objects.create(
                user=recipient,
                sender=request.user,
                message="sent you a message",
                notification_type="chat"
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
