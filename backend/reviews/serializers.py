from rest_framework import serializers
from .models import Review
from rent.models import Rental

class ReviewListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    dress_name = serializers.CharField(source='clothing.item_name', read_only=True)
    store_name = serializers.CharField(source='clothing.store.store_name', read_only=True)
    dress_image = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'user_email', 'dress_name', 'store_name', 'dress_image', 'rating', 'comment', 'created_at']

    def get_dress_image(self, obj):
        if obj.clothing.images:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.clothing.images.url)
            return obj.clothing.images.url
        return None

class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rental', 'rating', 'comment']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, data):
        user = self.context['request'].user
        rental = data['rental']

        if rental.customer != user:
            raise serializers.ValidationError("You can only review your own rentals.")

        if rental.status != Rental.Status.RETURNED_CONFIRMED:
            raise serializers.ValidationError("You can only review completed rentals.")

        if hasattr(rental, 'review'):
            raise serializers.ValidationError("You have already submitted a review for this rental.")

        return data

    def create(self, validated_data):
        rental = validated_data['rental']
        validated_data['user'] = self.context['request'].user
        validated_data['clothing'] = rental.clothing
        return super().create(validated_data)

class ReviewUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'comment']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
