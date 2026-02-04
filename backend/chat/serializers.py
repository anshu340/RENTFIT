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
    store_name = serializers.CharField(source='store.store_name', read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'customer', 'customer_name', 'store', 'store_name', 'created_at', 'last_message']
        read_only_fields = ['id', 'created_at', 'last_message']

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None
