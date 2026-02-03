import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import rentalAxiosInstance from '../services/rentalAxiosInstance';
import reviewAxiosInstance from '../services/reviewAxiosInstance';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import ReviewSection from '../Components/ReviewSection';
import ReviewForm from '../Components/ReviewForm';
import RentalModal from '../Components/RentalModal';
import Alert from '../Components/Alert';
import { FaTag, FaRuler, FaCheckCircle, FaStore, FaArrowLeft, FaShoppingCart, FaStar } from 'react-icons/fa';

const ClothingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clothing, setClothing] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ average_rating: 0, count: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isEligible, setIsEligible] = useState(false);
    const [eligibleRental, setEligibleRental] = useState(null);

    // Rental UI States
    const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
    const [alert, setAlert] = useState({ message: '', type: '' });

    useEffect(() => {
        fetchClothingData();
        checkEligibility();
    }, [id]);

    const fetchClothingData = async () => {
        try {
            setIsLoading(true);
            // Fetch clothing details
            const detailRes = await axiosInstance.get(`clothing/all/`);
            const item = detailRes.data.find(c => c.id === parseInt(id));
            setClothing(item);

            // Fetch reviews
            const reviewsRes = await reviewAxiosInstance.get(`clothing/${id}/`);
            setReviews(reviewsRes.data.results);
            setStats({
                average_rating: reviewsRes.data.average_rating,
                count: reviewsRes.data.count
            });
        } catch (error) {
            console.error('Error fetching clothing data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkEligibility = async () => {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'Customer') return;

        try {
            const response = await rentalAxiosInstance.get('my/');
            const userRentals = response.data.results || response.data;

            // Look for a completed rental for this clothing that hasn't been reviewed yet
            const eligible = userRentals.find(r => {
                const rentalClothingId = typeof r.clothing === 'object' ? r.clothing.id : r.clothing;
                return rentalClothingId === parseInt(id) &&
                    r.status === 'returned_confirmed' &&
                    !r.has_review;
            });

            if (eligible) {
                setIsEligible(true);
                setEligibleRental(eligible);
            }
        } catch (error) {
            console.error('Error checking eligibility:', error);
        }
    };

    const handleReviewSubmitted = () => {
        fetchClothingData(); // Refresh reviews
        setIsEligible(false); // Hide form
        setAlert({ message: 'Thank you for your review!', type: 'success' });
    };

    const showAlert = (message, type) => {
        setAlert({ message, type });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!clothing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Item not found</h2>
                    <button onClick={() => navigate('/browseClothes')} className="mt-4 text-purple-600 font-medium flex items-center gap-2 justify-center">
                        <FaArrowLeft /> Out of context... Back to Browse
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Breadcrumbs / Back button */}
                    <button
                        onClick={() => navigate('/browseClothes')}
                        className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-8 font-medium group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to Collection
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 group">
                                <img
                                    src={clothing.images || 'https://via.placeholder.com/600x800'}
                                    alt={clothing.item_name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-purple-600 text-sm font-bold uppercase tracking-wider mb-2">
                                <FaTag size={12} />
                                {clothing.category}
                            </div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{clothing.item_name}</h1>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < Math.round(stats.average_rating) ? 'text-yellow-400' : 'text-gray-200'} />
                                    ))}
                                </div>
                                <span className="text-gray-500 font-medium">({stats.count} reviews)</span>
                            </div>

                            <div className="bg-purple-50 rounded-2xl p-6 mb-8 flex justify-between items-center border border-purple-100">
                                <div>
                                    <span className="text-sm text-purple-600 font-bold block">Rental Price</span>
                                    <span className="text-4xl font-black text-purple-700">${clothing.rental_price}</span>
                                    <span className="text-purple-600 font-medium">/day</span>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${clothing.clothing_status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {clothing.clothing_status}
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                        <FaRuler />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Size & Fit</h4>
                                        <p className="text-gray-600">{clothing.size} — Relaxed standard fit</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                        <FaStore />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Store Partner</h4>
                                        <p className="text-gray-600">{clothing.store_name || 'RentFit Certified Store'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                        <FaCheckCircle />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Description</h4>
                                        <p className="text-gray-600 leading-relaxed">{clothing.description || 'Premium quality clothing carefully inspected for your special occasion.'}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsRentalModalOpen(true)}
                                disabled={clothing.clothing_status !== 'Available'}
                                className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-purple-700 shadow-xl shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 flex items-center justify-center gap-3"
                            >
                                <FaShoppingCart size={24} />
                                Rent Now
                            </button>
                        </div>
                    </div>

                    {/* Eligibility based Review Form */}
                    {isEligible && (
                        <div className="max-w-3xl mx-auto">
                            <ReviewForm
                                rental={eligibleRental}
                                onReviewSubmitted={handleReviewSubmitted}
                                onCancel={() => setIsEligible(false)}
                            />
                        </div>
                    )}

                    {/* Review Section */}
                    <div className="max-w-4xl mx-auto">
                        <ReviewSection
                            reviews={reviews}
                            averageRating={stats.average_rating}
                            totalReviews={stats.count}
                        />
                    </div>
                </div>
            </div>
            <Footer />

            <RentalModal
                isOpen={isRentalModalOpen}
                onClose={() => setIsRentalModalOpen(false)}
                clothing={clothing}
                onRentalCreated={showAlert}
            />

            <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ message: '', type: '' })}
            />
        </>
    );
};

export default ClothingDetail;
