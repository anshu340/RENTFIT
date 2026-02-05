from django.urls import path
from .views import ReviewCreateView, ClothingReviewListView, MyReviewsView, ReviewDetailView

urlpatterns = [
    path('create/', ReviewCreateView.as_view(), name='review-create'),
    path('clothing/<int:clothing_id>/', ClothingReviewListView.as_view(), name='clothing-reviews'),
    path('my/', MyReviewsView.as_view(), name='myreviews'),
    path('<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
]
