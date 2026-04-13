from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager

class User(AbstractUser):
    class UserRoles(models.TextChoices):
        ADMIN = "Admin", _("Admin")
        STORE = "Store", _("Store")
        CUSTOMER = "Customer", _("Customer")

    username = None
    first_name = None
    last_name = None

    # Common fields
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)  # full_name for Customer, owner_name for Store
    phone = models.CharField(max_length=20, blank=True, null=True)  # phone_number
    is_verified = models.BooleanField(default=False)
    is_store = models.BooleanField(default=False)

    role = models.CharField(
        max_length=20,
        choices=UserRoles.choices,
        default=UserRoles.CUSTOMER
    )

    # Customer-specific fields
    address = models.TextField(blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True, choices=[
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ])
    preferred_clothing_size = models.CharField(max_length=255, blank=True, null=True, choices=[
        ('XS', 'XS'),
        ('S', 'S'),
        ('M', 'M'),
        ('L', 'L'),
        ('XL', 'XL'),
        ('XXL', 'XXL'),
    ])

    # Store-specific fields
    store_name = models.CharField(max_length=255, blank=True, null=True)
    store_address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    store_description = models.TextField(blank=True, null=True)
    store_logo = models.ImageField(upload_to='store_logos/', blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    
    # Store KYC Verification
    citizenship_image = models.ImageField(upload_to='kyc/citizenship/', blank=True, null=True)
    business_card_image = models.ImageField(upload_to='kyc/business_card/', blank=True, null=True)
    verification_status = models.CharField(
        max_length=10,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected')
        ],
        default='pending'
    )

    
    # Location fields
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # Store Hours
    open_time = models.TimeField(null=True, blank=True)
    close_time = models.TimeField(null=True, blank=True)

    # Privacy Settings
    profile_visibility = models.BooleanField(default=True)
    location_sharing = models.BooleanField(default=True)
    recommendations_enabled = models.BooleanField(default=True)

    date_joined = models.DateTimeField(auto_now_add=True)
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.UserRoles.ADMIN
        elif self.is_store:
            self.role = self.UserRoles.STORE
        else:
            self.role = self.UserRoles.CUSTOMER
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} ({self.role})"


class OTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.email} - {self.otp}"

class Clothing(models.Model):
    """
    Clothing model for store inventory management
    Stores can add clothing items for rent with pricing and availability tracking
    """
    
    class Category(models.TextChoices):
        SHIRT = "shirt", "Shirt"
        PANTS = "pants", "Pants"
        DRESS = "dress", "Dress"
        JACKET = "jacket", "Jacket"
        TRADITIONAL = "traditional", "Traditional Wear"
        OTHER = "other", "Other"

    class EventType(models.TextChoices):
        WEDDING = "Wedding", "Wedding"
        PARTY = "Party", "Party"
        FORMAL = "Formal", "Formal"
        CASUAL = "Casual", "Casual"

    class Condition(models.TextChoices):
        NEW = "New", "New"
        LIKE_NEW = "Like New", "Like New"
        GOOD = "Good", "Good"
        USED = "Used", "Used"

    class ClothingAvailability(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        RENTED = 'RENTED', 'Rented'
        UNAVAILABLE = 'UNAVAILABLE', 'Unavailable'

    # Relationships
    store = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='clothing_items',
        limit_choices_to={'role': 'Store'}
    )

    # Clothing details
    item_name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=Category.choices)
    event_type = models.CharField(max_length=50, choices=EventType.choices, default=EventType.CASUAL)
    gender = models.CharField(
        max_length=20, 
        choices=[
            ('Male', 'Male'),
            ('Female', 'Female'),
            ('Other', 'Other'),
        ]
    )
    size = models.CharField(max_length=255, help_text="Comma-separated sizes like S, M, L")
    condition = models.CharField(max_length=20, choices=Condition.choices)
    description = models.TextField(blank=True, null=True)
    rental_price = models.DecimalField(max_digits=10, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stock_quantity = models.IntegerField(default=1)  # Renamed from available_quantity
    images = models.ImageField(upload_to='clothing_images/', blank=True, null=True)
    
    # Status tracking
    availability = models.CharField(
        max_length=20,
        choices=ClothingAvailability.choices,
        default=ClothingAvailability.AVAILABLE
    )

    class ClothingApproval(models.TextChoices):
        PENDING = 'PENDING_APPROVAL', 'Pending Approval'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    # Status tracking (Internal/Approval)
    status = models.CharField(
        max_length=20,
        choices=ClothingApproval.choices,
        default=ClothingApproval.PENDING
    )

    # Link to donation
    donation = models.ForeignKey(
        'donations.Donation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='converted_clothing'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Automatically update availability based on stock
        if self.stock_quantity is not None and self.stock_quantity > 0:
            if self.availability == self.ClothingAvailability.UNAVAILABLE:
                self.availability = self.ClothingAvailability.AVAILABLE
        else:
            self.availability = self.ClothingAvailability.UNAVAILABLE
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Clothing Item'
        verbose_name_plural = 'Clothing Items'

    def __str__(self):
        return f"{self.item_name} - {self.store.store_name} ({self.availability})"

    @property
    def average_rating(self):
        """
        DEPRECATED: This property causes circular import issues.
        Use serializer's get_average_rating() method instead.
        Kept for backward compatibility only.
        """
        try:
            from reviews.models import Review
            reviews = Review.objects.filter(clothing=self)
            if reviews.exists():
                return round(sum(r.rating for r in reviews) / reviews.count(), 1)
            return 0.0
        except Exception as e:
            # Avoid breaking serialization if Review model doesn't exist yet
            return 0.0

    @property
    def review_count(self):
        """
        DEPRECATED: This property causes circular import issues.
        Use serializer's get_review_count() method instead.
        Kept for backward compatibility only.
        """
        try:
            from reviews.models import Review
            return Review.objects.filter(clothing=self).count()
        except Exception as e:
            # Avoid breaking serialization if Review model doesn't exist yet
            return 0

class Wishlist(models.Model):
    """
    Wishlist model for customers to save favorite clothing items
    """
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='wishlist_items',
        limit_choices_to={'role': 'Customer'}
    )
    clothing = models.ForeignKey(
        Clothing,
        on_delete=models.CASCADE,
        related_name='wishlisted_by'
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'clothing')
        ordering = ['-added_at']
        verbose_name = 'Wishlist Item'
        verbose_name_plural = 'Wishlist Items'

    def __str__(self):
        return f"{self.customer.email} - {self.clothing.item_name}"