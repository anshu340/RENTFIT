from django.urls import path
from .views import InitiatePaymentView, EsewaVerifyView, EsewaFailureView

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='payment-initiate'),
    path('verify/', EsewaVerifyView.as_view(), name='payment-verify'),
    path('failure/', EsewaFailureView.as_view(), name='payment-failure'),
]
