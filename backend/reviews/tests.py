from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import User, Clothing
from rent.models import Rental
from .models import Review
from datetime import date, timedelta

class ReviewTests(APITestCase):
    def setUp(self):
        # Create Customer
        self.customer = User.objects.create_user(
            email='customer@test.com',
            password='password123',
            role='Customer',
            name='Test Customer'
        )
        # Create Store
        self.store = User.objects.create_user(
            email='store@test.com',
            password='password123',
            role='Store',
            is_store=True,
            name='Test Store'
        )
        # Create Clothing
        self.clothing = Clothing.objects.create(
            store=self.store,
            item_name='Luxury Gown',
            category='Formal Wear',
            gender='Female',
            size='M',
            condition='New',
            rental_price=2000.00,
            stock_quantity=5
        )
        # Create Rental (Completed for review)
        self.rental = Rental.objects.create(
            customer=self.customer,
            store=self.store,
            clothing=self.clothing,
            rent_start_date=date.today() - timedelta(days=5),
            rent_end_date=date.today() - timedelta(days=3),
            total_price=4000.00,
            status=Rental.Status.RETURNED_CONFIRMED
        )

    def test_create_review_success(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('review-create')
        data = {
            'rental': self.rental.id,
            'rating': 5,
            'comment': 'Amazing dress! Perfect fit.'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)
        review = Review.objects.first()
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.user, self.customer)
        self.assertEqual(review.rental, self.rental)

    def test_create_review_wrong_status_fails(self):
        # Create a pending rental
        pending_rental = Rental.objects.create(
            customer=self.customer,
            store=self.store,
            clothing=self.clothing,
            rent_start_date=date.today(),
            rent_end_date=date.today() + timedelta(days=1),
            total_price=2000.00,
            status=Rental.Status.PENDING
        )
        
        self.client.force_authenticate(user=self.customer)
        url = reverse('review-create')
        data = {
            'rental': pending_rental.id,
            'rating': 4,
            'comment': 'Nice'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('You can only review completed rentals.', str(response.data))

    def test_create_review_unauthorized_user_fails(self):
        other_customer = User.objects.create_user(
            email='other@test.com',
            password='password123',
            role='Customer'
        )
        
        self.client.force_authenticate(user=other_customer)
        url = reverse('review-create')
        data = {
            'rental': self.rental.id,
            'rating': 5,
            'comment': 'I am trying to review someone else\'s rental.'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('You can only review your own rentals.', str(response.data))

    def test_create_duplicate_review_fails(self):
        # Create first review
        Review.objects.create(
            user=self.customer,
            clothing=self.clothing,
            rental=self.rental,
            rating=5,
            comment='First review'
        )
        
        self.client.force_authenticate(user=self.customer)
        url = reverse('review-create')
        data = {
            'rental': self.rental.id,
            'rating': 4,
            'comment': 'Second review for same rental'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Review with this rental already exists.', str(response.data))

    def test_get_clothing_reviews(self):
        Review.objects.create(
            user=self.customer,
            clothing=self.clothing,
            rental=self.rental,
            rating=4,
            comment='Good quality'
        )
        
        url = reverse('clothing-reviews', kwargs={'clothing_id': self.clothing.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['average_rating'], 4.0)

    def test_update_my_review(self):
        review = Review.objects.create(
            user=self.customer,
            clothing=self.clothing,
            rental=self.rental,
            rating=4,
            comment='Good'
        )
        
        self.client.force_authenticate(user=self.customer)
        url = reverse('review-detail', kwargs={'pk': review.id})
        data = {'rating': 5, 'comment': 'Actually it was perfect!'}
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        review.refresh_from_db()
        self.assertEqual(review.rating, 5)

    def test_delete_my_review(self):
        review = Review.objects.create(
            user=self.customer,
            clothing=self.clothing,
            rental=self.rental,
            rating=4,
            comment='Delete me'
        )
        
        self.client.force_authenticate(user=self.customer)
        url = reverse('review-detail', kwargs={'pk': review.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Review.objects.count(), 0)
