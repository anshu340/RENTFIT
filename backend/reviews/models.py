from django.db import models
from django.conf import settings
from accounts.models import Clothing
from rent.models import Rental

class Review(models.Model):
    """
    Review model for clothing rentals.
    Enforces rules:
    - Only rental.customer can review
    - rental.status must be returned_confirmed
    - One review per rental
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    clothing = models.ForeignKey(
        Clothing,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rental = models.OneToOneField(
        Rental,
        on_delete=models.CASCADE,
        related_name='review'
    )
    rating = models.IntegerField(
        choices=[(i, i) for i in range(1, 6)],
        help_text="Rating from 1 to 5"
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'

    def __str__(self):
        return f"Review by {self.user.email} for {self.clothing.item_name} (Rating: {self.rating})"
