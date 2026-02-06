import hmac, hashlib, base64
from django.conf import settings

def generate_signature(total_amount, transaction_uuid, product_code):
    message = f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}"

    digest = hmac.new(
        settings.ESEWA_SECRET_KEY.encode(),
        message.encode(),
        hashlib.sha256
    ).digest()

    return base64.b64encode(digest).decode()
