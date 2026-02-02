from rest_framework import serializers
from .models import Rental
from accounts.models import Clothing
from datetime import date

class RentalSerializer(serializers.ModelSerializer):
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    store_name = serializers.CharField(source='store.store_name', read_only=True)
    clothing_name = serializers.CharField(source='clothing.item_name', read_only=True)
    
    class Meta:
        model = Rental
        fields = [
            'id', 'customer', 'customer_email', 'store', 'store_name',
            'clothing', 'clothing_name', 'rent_start_date', 'rent_end_date',
            'total_price', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class RentalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rental
        fields = ['id', 'clothing', 'rent_start_date', 'rent_end_date']

    def validate(self, data):
        clothing = data['clothing']
        start_date = data['rent_start_date']
        end_date = data['rent_end_date']

        # 1. Validate dates
        if start_date < date.today():
            raise serializers.ValidationError("Start date cannot be in the past.")
        if end_date < start_date:
            raise serializers.ValidationError("End date cannot be before start date.")

        # 2. Check available quantity
        if clothing.available_quantity <= 0:
            raise serializers.ValidationError("This item is currently out of stock for rent.")

        return data

    def create(self, validated_data):
        clothing = validated_data['clothing']
        start_date = validated_data['rent_start_date']
        end_date = validated_data['rent_end_date']
        
        # 3. Calculate total price
        num_days = (end_date - start_date).days + 1  # Standard rental logic: inclusive of both days
        total_price = clothing.rental_price * num_days
        
        customer = self.context['request'].user
        store = clothing.store
        
        rental = Rental.objects.create(
            customer=customer,
            store=store,
            clothing=clothing,
            rent_start_date=start_date,
            rent_end_date=end_date,
            total_price=total_price,
            status=Rental.Status.PENDING
        )
        return rental
