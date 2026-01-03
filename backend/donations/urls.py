from django.urls import path
from .views import (
    DonationCreateView,
    CustomerDonationListView,
    DonationDetailView,
    DonationUpdateView,
    DonationDeleteView,
    StoreDonationListView,
    DonationStatusUpdateView,
    DonationCollectView,
    StoreListForDonationView,
)

urlpatterns = [
    # Customer endpoints
    path('create/', DonationCreateView.as_view(), name='donation-create'),
    path('my/', CustomerDonationListView.as_view(), name='customer-donations'),
    path('<int:pk>/', DonationDetailView.as_view(), name='donation-detail'),
    path('<int:pk>/update/', DonationUpdateView.as_view(), name='donation-update'),
    path('<int:pk>/delete/', DonationDeleteView.as_view(), name='donation-delete'),
    path('stores/', StoreListForDonationView.as_view(), name='store-list-for-donation'),
    
    # Store endpoints
    path('store/', StoreDonationListView.as_view(), name='store-donations'),
    path('store/<int:pk>/status/', DonationStatusUpdateView.as_view(), name='donation-status-update'),
    path('store/<int:pk>/collect/', DonationCollectView.as_view(), name='donation-collect'),
]