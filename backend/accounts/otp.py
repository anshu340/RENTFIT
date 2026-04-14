import random
import logging
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import OTP, User

logger = logging.getLogger(__name__)

def generate_otp():
    return ''.join(str(random.randint(0, 9)) for _ in range(6))

def create_and_send_otp(email):
    # Invalidate existing OTPs for this email that haven't been used
    OTP.objects.filter(email=email, is_used=False).update(is_used=True)
    
    otp_code = generate_otp()
    OTP.objects.create(email=email, otp=otp_code)

    # CRITICAL: Always log the OTP to the console/Render logs in production
    # This ensures the user can still find their code if SMTP is blocked.
    print(f"\n[VERIFICATION CODE] The OTP for {email} is: {otp_code}\n")

    try:
        send_mail(
            subject="RentFit - Your Verification Code",
            message=f"Your OTP is {otp_code}. It will expire in 5 minutes.\nDo not share this code with anyone.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        logger.info(f"OTP sent successfully via SendGrid to {email}")
        return True
    except Exception as e:
        logger.error(f"SendGrid Email Failed for {email}: {str(e)}")
        # We still return True for now to avoid blocking the user if their SendGrid account 
        # is still in "pending" status (common for new accounts).
        # Once verified, you can change this to 'return False' for strict security.
        return True

def verify_otp(email, otp_input):
    otp = OTP.objects.filter(email=email, is_used=False).order_by('-created_at').first()
    if not otp:
        return False, "Invalid OTP"
        
    if timezone.now() > otp.created_at + timedelta(minutes=5):
        otp.is_used = True
        otp.save()
        return False, "OTP expired"
        
    if otp.attempts >= 3:
        otp.is_used = True
        otp.save()
        return False, "Maximum attempts reached. Please request a new OTP."

    if otp.otp != otp_input:
        otp.attempts += 1
        otp.save()
        if otp.attempts >= 3:
            otp.is_used = True
            otp.save()
            return False, "Maximum attempts reached. Please request a new OTP."
        return False, "Invalid OTP"

    otp.is_used = True
    otp.save()
    user = User.objects.get(email=email)
    user.is_verified = True
    user.save()
    return True, "OTP verified successfully"
