import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User, OTP
from accounts.otp import create_and_send_otp

pytestmark = pytest.mark.django_db

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user_customer(db):
    user = User.objects.create_user(
        email='customer@example.com',
        password='Password123!',
        name='Test Customer',
        role='Customer',
        is_verified=True
    )
    return user
# --- OTP Tests ---

# Forgot password - Send OTP to email
def test_forgot_password_request(api_client, test_user_customer):
    url = reverse('forgot-password')
    data = {"email": "customer@example.com"}
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_200_OK
    assert OTP.objects.filter(email="customer@example.com").exists()

# OTP verification with correct OTP (success)
def test_otp_verification_success(api_client, test_user_customer):
    create_and_send_otp(test_user_customer.email)
    otp_obj = OTP.objects.filter(email=test_user_customer.email).first()
    
    url = reverse('verify-otp')
    data = {"email": test_user_customer.email, "otp": otp_obj.otp}
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['message'] == "OTP verified successfully"

# OTP verification with incorrect OTP (failure)
def test_otp_verification_failure(api_client, test_user_customer):
    create_and_send_otp(test_user_customer.email)
    
    url = reverse('verify-otp')
    data = {"email": test_user_customer.email, "otp": "000000"} # Wrong OTP
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.data['message'] == "Invalid OTP"



# # --- Registration Tests ---

# # Customer registration with valid data (success)
# def test_customer_registration_valid(api_client):
#     url = reverse('register-customer')
#     data = {
#         "email": "newcustomer@example.com",
#         "password": "Password123!",
#         "full_name": "New Customer",
#         "phone_number": "9800000000"
#     }
#     response = api_client.post(url, data)
#     assert response.status_code == status.HTTP_201_CREATED
#     assert User.objects.filter(email="newcustomer@example.com").exists()

# # Registration with missing fields (failure)
# def test_customer_registration_missing_fields(api_client):
#     url = reverse('register-customer')
#     data = {
#         "email": "missing@example.com",
#     }
#     response = api_client.post(url, data)
#     assert response.status_code == status.HTTP_400_BAD_REQUEST

# # --- Login Tests ---

# # Login with valid credentials (success)
# def test_login_valid_credentials(api_client, test_user_customer):
#     url = reverse('login')
#     data = {"email": "customer@example.com", "password": "Password123!"}
#     response = api_client.post(url, data)
#     assert response.status_code == status.HTTP_200_OK
#     assert "access_token" in response.data

# # Login with invalid credentials (failure)
# def test_login_invalid_credentials(api_client, test_user_customer):
#     url = reverse('login')
#     data = {"email": "customer@example.com", "password": "WrongPassword"}
#     response = api_client.post(url, data)
#     assert response.status_code == status.HTTP_400_BAD_REQUEST
#     assert "error" in response.data


