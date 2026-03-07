from django.urls import path
from .views import (
    CustomerRegisterView,
    StoreRegisterView,
    LoginView,
    VerifyOTPView,
    ProfileView,
    StoreDashboardView,
    CustomerProfileView,
    StoreProfileView,
    ClothingCreateView,
    StoreClothingListView,
    ClothingDetailView,
    ClothingUpdateView,
    ClothingDeleteView,
    ClothingStatusUpdateView,
    AllClothingListView,
    WishlistListView,
    WishlistAddView,
    WishlistRemoveView,
    WishlistRemoveByClothingView,
    WishlistCheckView,
    WishlistClearView,
    CustomerDashboardStatsView,
    StoreDashboardStatsView,
    NearbyStoresView,
    AdminPendingClothingListView,
    AdminClothingApprovalView,
)
from .admin_views import (
    AdminStatsView,
    AdminUserListView,
    AdminUserDeactivateView,
    AdminGlobalActivityView,
)

urlpatterns = [
    # ... (other paths)
    
    # Admin Endpoints
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/<int:pk>/deactivate/", AdminUserDeactivateView.as_view(), name="admin-user-deactivate"),
    path("admin/activity/", AdminGlobalActivityView.as_view(), name="admin-activity"),
    path("admin/clothing/pending/", AdminPendingClothingListView.as_view(), name="admin-clothing-pending"),
    path("admin/clothing/<int:pk>/approve/", AdminClothingApprovalView.as_view(), name="admin-clothing-approve"),
    # Authentication Endpoints
    path("register/customer/", CustomerRegisterView.as_view(), name="register-customer"),
    path("register/store/", StoreRegisterView.as_view(), name="register-store"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("login/", LoginView.as_view(), name="login"),
    
    # Location Endpoints
    path("stores/nearby/", NearbyStoresView.as_view(), name="nearby-stores"),
    
    # Legacy Endpoints
    path("profile/", ProfileView.as_view(), name="profile"),
    path("dashboard/store/", StoreDashboardView.as_view(), name="store-dashboard"),
    path("dashboard/store/stats/", StoreDashboardStatsView.as_view(), name="store-stats"),
    path("dashboard/stats/", CustomerDashboardStatsView.as_view(), name="customer-stats"),
    
    # Customer CRUD Endpoints
    path("customers/profile/", CustomerProfileView.as_view(), name="customer-profile"),
    
    # Store CRUD Endpoints
    path("stores/profile/", StoreProfileView.as_view(), name="store-profile"),

    # CLOTHING - STORE
    path("clothing/create/", ClothingCreateView.as_view(), name="clothing-create"),
    path("clothing/my/", StoreClothingListView.as_view(), name="store-clothing"),
    path("clothing/<int:pk>/", ClothingDetailView.as_view(), name="clothing-detail"),
    path("clothing/<int:pk>/update/", ClothingUpdateView.as_view(), name="clothing-update"),
    path("clothing/<int:pk>/delete/", ClothingDeleteView.as_view(), name="clothing-delete"),
    path("clothing/<int:pk>/status/", ClothingStatusUpdateView.as_view(), name="clothing-status-update"),
    
    # CLOTHING - CUSTOMER
    path("clothing/all/", AllClothingListView.as_view(), name="all-clothing"),
    
    # WISHLIST ENDPOINTS
    path("wishlist/", WishlistListView.as_view(), name="wishlist-list"),
    path("wishlist/add/", WishlistAddView.as_view(), name="wishlist-add"),
    path("wishlist/<int:pk>/remove/", WishlistRemoveView.as_view(), name="wishlist-remove"),
    path("wishlist/remove-by-clothing/<int:clothing_id>/", WishlistRemoveByClothingView.as_view(), name="wishlist-remove-by-clothing"),
    path("wishlist/check/<int:clothing_id>/", WishlistCheckView.as_view(), name="wishlist-check"),
    path("wishlist/clear/", WishlistClearView.as_view(), name="wishlist-clear"),
]