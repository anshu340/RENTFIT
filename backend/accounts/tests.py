from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from accounts.models import User, OTP
from accounts.otp import verify_otp, create_and_send_otp

class OTPVerificationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser@example.com',
            password='testpassword123',
            name='Test User',
            is_store=False
        )

    def test_otp_attempt_limit_locked_out(self):
        # Create an OTP
        create_and_send_otp(self.user.email)
        
        otp_obj = OTP.objects.get(email=self.user.email, is_used=False)
        valid_otp = otp_obj.otp
        invalid_otp = "000000" if valid_otp != "000000" else "111111"
        
        # Attempt 1: Failed
        success, msg = verify_otp(self.user.email, invalid_otp)
        self.assertFalse(success)
        self.assertEqual(msg, "Invalid OTP")
        
        # Attempt 2: Failed
        success, msg = verify_otp(self.user.email, invalid_otp)
        self.assertFalse(success)
        self.assertEqual(msg, "Invalid OTP")

        # Attempt 3: Failed -> Locks OTP
        success, msg = verify_otp(self.user.email, invalid_otp)
        self.assertFalse(success)
        self.assertEqual(msg, "Maximum attempts reached. Please request a new OTP.")
        
        # Attempt 4: Even with correct OTP -> Fails because locked/used
        success, msg = verify_otp(self.user.email, valid_otp)
        self.assertFalse(success)
        self.assertEqual(msg, "Invalid OTP")
        
        otp_obj.refresh_from_db()
        self.assertTrue(otp_obj.is_used)
        self.assertEqual(otp_obj.attempts, 3)

    def test_otp_correct_on_third_attempt(self):
        # Verify it works if correct on attempt #3
        create_and_send_otp(self.user.email)
        otp_obj = OTP.objects.get(email=self.user.email, is_used=False)
        valid_otp = otp_obj.otp
        invalid_otp = "000000" if valid_otp != "000000" else "111111"

        verify_otp(self.user.email, invalid_otp) # 1
        verify_otp(self.user.email, invalid_otp) # 2
        
        # 3rd is correct -> success
        success, msg = verify_otp(self.user.email, valid_otp)
        self.assertTrue(success)
        self.assertEqual(msg, "OTP verified successfully")
