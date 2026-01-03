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
        ('Prefer not to say', 'Prefer not to say'),
    ])
    preferred_clothing_size = models.CharField(max_length=10, blank=True, null=True, choices=[
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

    def __str__(self):
        return f"{self.email} - {self.otp}"