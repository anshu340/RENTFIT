from django.urls import path
from .views import (
    CustomerRegisterView,
    StoreRegisterView,
    LoginView,
    VerifyOTPView,
    ProfileView,
    StoreDashboardView,
    CustomerProfileView,
    StoreProfileView
)

urlpatterns = [
    
    # Authentication Endpoints
    path("register/customer/", CustomerRegisterView.as_view(), name="register-customer"),
    path("register/store/", StoreRegisterView.as_view(), name="register-store"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("login/", LoginView.as_view(), name="login"),
    
    
    # Legacy Endpoints (kept for backward compatibility)
    path("profile/", ProfileView.as_view(), name="profile"),
    path("dashboard/store/", StoreDashboardView.as_view(), name="store-dashboard"),
    
    
    # Customer CRUD Endpoints
   
    # GET    /api/accounts/customers/profile/     
    # PUT    /api/accounts/customers/profile/     
    # PATCH  /api/accounts/customers/profile/     
    # DELETE /api/accounts/customers/profile/    
    path("customers/profile/", CustomerProfileView.as_view(), name="customer-profile"),
    
    
    # Store CRUD Endpoints
    
    # GET    /api/accounts/stores/profile/       - Get store profile with items and requests
    # PUT    /api/accounts/stores/profile/       - Full update store profile
    # PATCH  /api/accounts/stores/profile/       - Partial update store profile
    # DELETE /api/accounts/stores/profile/       - Soft delete (deactivate) store account
    path("stores/profile/", StoreProfileView.as_view(), name="store-profile"),
]