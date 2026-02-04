from django.db import models
from accounts.models import User

class Conversation(models.Model):
    customer = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='customer_conversations',
        limit_choices_to={'role': 'Customer'}
    )
    store = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='store_conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'store')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer.email} <-> {self.store.store_name}"

class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Message from {self.sender.email} at {self.timestamp}"
