from rest_framework import serializers
from .models import Rental, DamageReport
from accounts.models import Clothing
from accounts.serializers import ClothingListSerializer
from datetime import date

class RentalSerializer(serializers.ModelSerializer):
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    store_name = serializers.CharField(source='store.store_name', read_only=True)
    clothing = ClothingListSerializer(read_only=True)
    clothing_name = serializers.CharField(source='clothing.item_name', read_only=True)
    clothing_image = serializers.SerializerMethodField()
    customer_profile_image = serializers.SerializerMethodField()
    has_review = serializers.SerializerMethodField()
    has_damage_report = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    payment_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Rental
        fields = [
            'id', 'customer', 'customer_email', 'customer_name', 'customer_profile_image', 
            'store', 'store_name', 'clothing', 'clothing_name', 'clothing_image', 
            'selected_size', 'rent_start_date', 'rent_end_date', 'total_price', 
            'status', 'has_review', 'has_damage_report', 'payment_status', 
            'payment_details', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_clothing_image(self, obj):
        if obj.clothing and obj.clothing.images:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.clothing.images.url)
            return obj.clothing.images.url
        return None

    def get_customer_profile_image(self, obj):
        if obj.customer and obj.customer.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.customer.profile_image.url)
            return obj.customer.profile_image.url
        return None

    def get_has_review(self, obj):
        return hasattr(obj, 'review')

    def get_has_damage_report(self, obj):
        return obj.damage_reports.exists()

    def get_payment_status(self, obj):
        payment = obj.payment_set.filter(status='completed').first()
        if payment:
            return 'paid'
        return 'pending'

    def get_payment_details(self, obj):
        payment = obj.payment_set.filter(status='completed').first()
        if payment:
            return {
                'transaction_id': payment.transaction_id,
                'amount': float(payment.amount),
                'date': payment.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'status': payment.status
            }
        return None

class RentalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rental
        fields = ['id', 'clothing', 'selected_size', 'rent_start_date', 'rent_end_date']

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
        if clothing.stock_quantity <= 0:
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
            selected_size=validated_data.get('selected_size'),
            rent_start_date=start_date,
            rent_end_date=end_date,
            total_price=total_price,
            status=Rental.Status.PENDING
        )
        return rental



class DamageReportSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    clothing_name = serializers.CharField(source='clothing.item_name', read_only=True)
    rental_id_val = serializers.ReadOnlyField(source='rental_id')
    
    class Meta:
        model = DamageReport
        fields = [
            'id', 'rental', 'rental_id_val', 'user', 'user_email', 'clothing', 
            'clothing_name', 'description', 'image', 'status', 
            'extra_charge', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'clothing', 'status', 'created_at', 'updated_at']

    def validate_rental(self, value):
        # Ensure the rental belongs to the customer and is in a state where damage can be reported
        request = self.context.get('request')
        if request and value.customer != request.user:
            raise serializers.ValidationError("You can only report damage for your own rentals.")
        return value
