from django.urls import path
from .views import APIRootView, RegisterView, LoginView, CustomerDashboard, StoreDashboard

urlpatterns = [
    path('', APIRootView.as_view()),  
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('dashboard/customer/', CustomerDashboard.as_view()),
    path('dashboard/store/', StoreDashboard.as_view()),
]