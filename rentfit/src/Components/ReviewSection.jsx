import React from 'react';
import { FaStar, FaUserCircle } from 'react-icons/fa';

const ReviewSection = ({ reviews, averageRating, totalReviews }) => {
    const renderStars = (rating) => {
        return (
            <div className="flex gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-200'} />
                ))}
            </div>
        );
    };

    return (
        <div className="mt-12">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Reviews & Ratings</h2>
                    <p className="text-gray-500 mt-1">What our community says about this item</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-3 justify-end">
                        <span className="text-4xl font-extrabold text-gray-900">{averageRating || '0.0'}</span>
                        <div className="flex flex-col">
                            {renderStars(Math.round(averageRating || 0))}
                            <span className="text-sm font-medium text-gray-500 mt-0.5">{totalReviews} reviews</span>
                        </div>
                    </div>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-500">
                    <p className="text-lg">No reviews yet. Be the first to share your experience!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-hover hover:shadow-md">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                        <FaUserCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{review.user_name || review.user_email.split('@')[0]}</h4>
                                        <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {renderStars(review.rating)}
                            </div>
                            <p className="text-gray-600 leading-relaxed italic">
                                "{review.comment}"
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
