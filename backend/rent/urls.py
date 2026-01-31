from django.urls import path
from .views import (
    RentalCreateView,
    CustomerRentalListView,
    StoreRentalListView,
    RentalApproveView,
    RentalRejectView,
    RentalMarkReturnedView,
    RentalConfirmReturnView,
)

urlpatterns = [
    path('create/', RentalCreateView.as_view(), name='rental-create'),
    path('my/', CustomerRentalListView.as_view(), name='rental-list-customer'),
    path('store/', StoreRentalListView.as_view(), name='rental-list-store'),
    path('<int:pk>/approve/', RentalApproveView.as_view(), name='rental-approve'),
    path('<int:pk>/reject/', RentalRejectView.as_view(), name='rental-reject'),
    path('<int:pk>/mark-return/', RentalMarkReturnedView.as_view(), name='rental-mark-return'),
    path('<int:pk>/confirm-return/', RentalConfirmReturnView.as_view(), name='rental-confirm-return'),
]
