from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsCustomer
from .models import Review
from .serializers import ReviewCreateSerializer, ReviewListSerializer
from accounts.models import Clothing

class ReviewCreateView(generics.CreateAPIView):
    """
    Create a review for a completed rental.
    POST /api/reviews/create/
    """
    serializer_class = ReviewCreateSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        review = serializer.save()
        
        # Create notification for the store owner
        from notifications.models import Notification
        Notification.objects.create(
            user=review.clothing.store,
            message=f"New review received for {review.clothing.item_name} from {review.user.email}: {review.rating} stars.",
            notification_type='rental'
        )

class ClothingReviewListView(generics.ListAPIView):
    """
    Get all reviews for a specific clothing item.
    GET /api/reviews/clothing/<id>/
    """
    serializer_class = ReviewListSerializer
    permission_classes = [] # Allow anyone to see reviews

    def get_queryset(self):
        clothing_id = self.kwargs.get('clothing_id')
        return Review.objects.filter(clothing_id=clothing_id)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Calculate average rating
        avg_rating = 0
        if queryset.exists():
            avg_rating = sum(r.rating for r in queryset) / queryset.count()

        return Response({
            'count': queryset.count(),
            'average_rating': round(avg_rating, 1),
            'results': serializer.data
        })
