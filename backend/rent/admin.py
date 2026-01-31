from django.contrib import admin
from .models import Rental

@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = (
        'customer', 
        'store', 
        'clothing', 
        'status', 
        'total_price', 
        'created_at'
    )
    list_filter = ('status', 'created_at')
    search_fields = ('customer__email', 'store__store_name', 'clothing__item_name')
