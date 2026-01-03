from rest_framework import serializers
from .models import Donation
from accounts.models import User


class DonationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a donation
    - Accepts store ID
    - Automatically assigns logged-in user as customer
    - Sets donation_status = Pending
    """
    store_id = serializers.IntegerField(write_only=True)
    store_name = serializers.CharField(source='store.store_name', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = [
            'id', 'store_id', 'store_name', 'customer_name',
            'item_name', 'category', 'gender', 'size', 'condition',
            'description', 'images', 'image_url',
            'donation_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'donation_status', 'created_at', 'updated_at', 'store_name', 'customer_name']

    def validate_store_id(self, value):
        """Validate that the store exists and is a Store role"""
        try:
            store = User.objects.get(id=value, role='Store')
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid store ID or store does not exist.")
        return value

    def create(self, validated_data):
        """Create donation with customer from request user"""
        store_id = validated_data.pop('store_id')
        store = User.objects.get(id=store_id, role='Store')
        customer = self.context['request'].user
        
        donation = Donation.objects.create(
            customer=customer,
            store=store,
            donation_status=Donation.DonationStatus.PENDING,
            **validated_data
        )
        return donation

    def get_image_url(self, obj):
        """Return absolute URL for donation image"""
        if obj.images:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.images.url)
            return obj.images.url
        return None


class DonationListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing donations
    - Used for customer & store listing
    - Includes donation_status and store name
    """
    store_name = serializers.CharField(source='store.store_name', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = [
            'id', 'item_name', 'category', 'gender', 'size', 'condition',
            'donation_status', 'store_name', 'customer_name',
            'images', 'image_url', 'created_at', 'updated_at'
        ]

    def get_image_url(self, obj):
        """Return absolute URL for donation image"""
        if obj.images:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.images.url)
            return obj.images.url
        return None


class DonationDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for full donation details
    """
    store_name = serializers.CharField(source='store.store_name', read_only=True)
    store_email = serializers.EmailField(source='store.email', read_only=True)
    store_phone = serializers.CharField(source='store.phone', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = [
            'id', 'item_name', 'category', 'gender', 'size', 'condition',
            'description', 'images', 'image_url',
            'donation_status', 'store_name', 'store_email', 'store_phone',
            'customer_name', 'customer_email',
            'created_at', 'updated_at'
        ]

    def get_image_url(self, obj):
        """Return absolute URL for donation image"""
        if obj.images:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.images.url)
            return obj.images.url
        return None


class DonationStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for store to update donation status
    - Used to approve/reject/collect donations
    """
    class Meta:
        model = Donation
        fields = ['donation_status']

    def validate_donation_status(self, value):
        """Validate status transitions"""
        if self.instance:
            current_status = self.instance.donation_status
            
            # Only allow valid transitions
            valid_transitions = {
                'Pending': ['Approved', 'Rejected'],
                'Approved': ['Collected'],
                'Rejected': [],
                'Collected': []
            }
            
            if value not in valid_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot change status from {current_status} to {value}."
                )
        
        return value


class DonationUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for customer to update donation (only if Pending)
    """
    class Meta:
        model = Donation
        fields = ['item_name', 'category', 'gender', 'size', 'condition', 'description', 'images']

    def validate(self, attrs):
        """Ensure donation is still Pending"""
        if self.instance.donation_status != Donation.DonationStatus.PENDING:
            raise serializers.ValidationError(
                "Cannot update donation. Status must be Pending."
            )
        return attrs