from django.db import models
from django.conf import settings
from accounts.models import Clothing

class Rental(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        RENTED = "rented", "Rented"
        RETURNED_PENDING = "returned_pending", "Returned Pending"
        RETURNED_CONFIRMED = "returned_confirmed", "Returned Confirmed"

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rentals',
        limit_choices_to={'role': 'Customer'}
    )
    store = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='store_rentals',
        limit_choices_to={'role': 'Store'}
    )
    clothing = models.ForeignKey(
        Clothing,
        on_delete=models.CASCADE,
        related_name='rentals'
    )
    rent_start_date = models.DateField()
    rent_end_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.clothing.item_name} - {self.customer.email} ({self.status})"
