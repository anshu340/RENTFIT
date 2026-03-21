import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Rentfit.settings')
django.setup()

from accounts.models import Clothing

update_map = {
    'approved': 'APPROVED',
    'pending': 'PENDING_APPROVAL',
    'rejected': 'REJECTED'
}

count = 0
for c in Clothing.objects.all():
    if c.status in update_map:
        old_status = c.status
        c.status = update_map[old_status]
        c.save()
        print(f"Updating ID {c.id}: {old_status} -> {c.status}")
        count += 1

print(f"Successfully updated {count} items.")
