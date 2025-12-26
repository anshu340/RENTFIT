from django.urls import path
from .views import (
    CustomerRegisterView,
    StoreRegisterView,
    LoginView,
    VerifyOTPView,
    ProfileView
)

urlpatterns = [
    path("register/customer/", CustomerRegisterView.as_view(), name="register-customer"),
    path("register/store/", StoreRegisterView.as_view(), name="register-store"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name="profile"),
]
