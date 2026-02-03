from rest_framework import serializers
from .models import Review
from rent.models import Rental

class ReviewListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'user_email', 'rating', 'comment', 'created_at']

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

        # Check if the rental belongs to the user
        if rental.customer != user:
            raise serializers.ValidationError("You can only review your own rentals.")

        # Check if the rental is completed (returned_confirmed)
        if rental.status != Rental.Status.RETURNED_CONFIRMED:
            raise serializers.ValidationError("You can only review completed rentals.")

        # Check if a review already exists for this rental
        # Note: Since we used OneToOneField, this is also enforced at the DB level,
        # but a clean validation message is better.
        if hasattr(rental, 'review'):
            raise serializers.ValidationError("You have already submitted a review for this rental.")

        return data

    def create(self, validated_data):
        # Automatically assign user and clothing from rental
        rental = validated_data['rental']
        validated_data['user'] = self.context['request'].user
        validated_data['clothing'] = rental.clothing
        return super().create(validated_data)
