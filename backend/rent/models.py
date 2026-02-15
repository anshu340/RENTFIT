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
    selected_size = models.CharField(max_length=50, blank=True, null=True)
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

class DamageReport(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    rental = models.ForeignKey(
        Rental,
        on_delete=models.CASCADE,
        related_name='damage_reports'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='damage_reports'
    )
    clothing = models.ForeignKey(
        Clothing,
        on_delete=models.CASCADE,
        related_name='damage_reports'
    )
    description = models.TextField()
    image = models.ImageField(upload_to='damage_reports/', blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    extra_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Damage Report - {self.clothing.item_name} - {self.status}"
