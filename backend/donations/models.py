from django.db import models
from django.conf import settings


class Donation(models.Model):
    """
    Donation model for clothing donations with store selection and approval workflow
    """
    class DonationStatus(models.TextChoices):
        PENDING = "Pending", "Pending"
        APPROVED = "Approved", "Approved"
        REJECTED = "Rejected", "Rejected"
        COLLECTED = "Collected", "Collected"

    class Category(models.TextChoices):
        SHIRT = "Shirt", "Shirt"
        PANTS = "Pants", "Pants"
        DRESS = "Dress", "Dress"
        JACKET = "Jacket", "Jacket"
        SKIRT = "Skirt", "Skirt"
        SHOES = "Shoes", "Shoes"
        ACCESSORIES = "Accessories", "Accessories"
        OTHER = "Other", "Other"

    class Condition(models.TextChoices):
        NEW = "New", "New"
        LIKE_NEW = "Like New", "Like New"
        GOOD = "Good", "Good"
        USED = "Used", "Used"

    # Relationships
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='donations',
        limit_choices_to={'role': 'Customer'}
    )
    store = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='store_donations',
        limit_choices_to={'role': 'Store'}
    )

    # Donation details
    item_name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=Category.choices)
    gender = models.CharField(max_length=20, choices=[
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Unisex', 'Unisex'),
        ('Other', 'Other'),
    ])
    size = models.CharField(max_length=255)
    condition = models.CharField(max_length=20, choices=Condition.choices)
    description = models.TextField(blank=True, null=True)
    images = models.ImageField(upload_to='donation_images/', blank=True, null=True)

    # Status tracking
    donation_status = models.CharField(
        max_length=20,
        choices=DonationStatus.choices,
        default=DonationStatus.PENDING
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Donation'
        verbose_name_plural = 'Donations'

    def __str__(self):
        return f"{self.item_name} - {self.customer.email} -> {self.store.store_name} ({self.donation_status})"