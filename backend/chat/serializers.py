from rest_framework import serializers
from .models import Conversation, Message
from accounts.models import User

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    sender_email = serializers.CharField(source='sender.email', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'sender_email', 'text', 'timestamp', 'is_read']
        read_only_fields = ['id', 'sender', 'timestamp', 'is_read', 'sender_name', 'sender_email']

class ConversationSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_image = serializers.ImageField(source='customer.profile_image', read_only=True)

    store_name = serializers.CharField(source='store.store_name', read_only=True)
    store_image = serializers.ImageField(source='store.store_logo', read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id',
            'customer_name',
            'store_name',
            'customer_image',
            'store_image',
            'created_at'
        ]

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None
