from django.contrib import admin
from .models import Conversation, Message

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'store', 'created_at')
    search_fields = ('customer__email', 'store__store_name')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'timestamp', 'is_read')
    list_filter = ('is_read', 'timestamp')
    search_fields = ('text', 'sender__email')
