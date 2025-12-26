import random
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import OTP, User

def generate_otp():
    return ''.join(str(random.randint(0, 9)) for _ in range(6))

def create_and_send_otp(email):
    OTP.objects.filter(email=email, is_used=False).update(is_used=True)
    otp_code = generate_otp()
    OTP.objects.create(email=email, otp=otp_code)

    send_mail(
        subject="RentFit Email Verification",
        message=f"Your OTP is {otp_code}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
    )

def verify_otp(email, otp_input):
    otp = OTP.objects.filter(email=email, otp=otp_input, is_used=False).first()
    if not otp:
        return False, "Invalid OTP"
    if timezone.now() > otp.created_at + timedelta(minutes=3):
        otp.delete()
        return False, "OTP expired"

    otp.is_used = True
    otp.save()
    user = User.objects.get(email=email)
    user.is_verified = True
    user.save()
    return True, "OTP verified successfully"
