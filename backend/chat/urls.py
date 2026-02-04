from django.urls import path
from .views import (
    StartConversationView,
    UserConversationsView,
    MessageListView,
    SendMessageView
)

urlpatterns = [
    path('start/<int:store_id>/', StartConversationView.as_view(), name='start_conversation'),
    path('my/', UserConversationsView.as_view(), name='my_conversations'),
    path('<int:conversation_id>/', MessageListView.as_view(), name='conversation_messages'),
    path('<int:conversation_id>/send/', SendMessageView.as_view(), name='send_message'),
]
