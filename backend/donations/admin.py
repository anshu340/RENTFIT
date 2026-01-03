from django.contrib import admin
from .models import Donation


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['item_name', 'customer', 'store', 'category', 'donation_status', 'created_at']
    list_filter = ['donation_status', 'category', 'condition', 'created_at']
    search_fields = ['item_name', 'customer__email', 'store__store_name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Donation Information', {
            'fields': ('customer', 'store', 'item_name', 'category', 'gender', 'size', 'condition', 'description', 'images')
        }),
        ('Status', {
            'fields': ('donation_status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )