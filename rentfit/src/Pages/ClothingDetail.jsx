import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import chatAxiosInstance from '../services/chatAxiosInstance';
import rentalAxiosInstance from '../services/rentalAxiosInstance';
import reviewAxiosInstance from '../services/reviewAxiosInstance';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import ReviewSection from '../Components/ReviewSection';
import ReviewForm from '../Components/ReviewForm';
import RentalModal from '../Components/RentalModal';
import StoreLocationMap from '../Components/StoreLocationMap';
import Alert from '../Components/Alert';
import { FaTag, FaRuler, FaCheckCircle, FaStore, FaArrowLeft, FaShoppingCart, FaStar, FaComments, FaDirections, FaMapMarkerAlt } from 'react-icons/fa';

const hasValidCoords = (lat, lng) =>
    lat !== null && lat !== undefined &&
    lng !== null && lng !== undefined;

const ClothingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clothing, setClothing] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ average_rating: 0, count: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isEligible, setIsEligible] = useState(false);
    const [eligibleRental, setEligibleRental] = useState(null);
    const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
    const [alert, setAlert] = useState({ message: '', type: '' });

    useEffect(() => {
        fetchClothingData();
        checkEligibility();
    }, [id]);

    const fetchClothingData = async () => {
        try {
            setIsLoading(true);
            const detailRes = await axiosInstance.get(`clothing/${id}/`);
            setClothing(detailRes.data);

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
        fetchClothingData();
        setIsEligible(false);
        setAlert({ message: 'Thank you for your review!', type: 'success' });
    };

    const handleChatWithStore = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login', { state: { message: "Please login to chat with the store" } });
            return;
        }

        const role = localStorage.getItem('role');
        if (role !== 'Customer') {
            showAlert('Only customers can start a chat with the store.', 'error');
            return;
        }

        try {
            const storeUserId = clothing.store || clothing.store_user_id;

            if (!storeUserId) {
                showAlert('Store information not available.', 'error');
                return;
            }

            console.log('Starting chat with store user ID:', storeUserId);
            const response = await chatAxiosInstance.post(`start/${storeUserId}/`);

            if (response.data && response.data.id) {
                navigate(`/chat/${response.data.id}`);
            } else {
                console.error("Conversation not created properly", response);
                showAlert('Failed to start conversation.', 'error');
            }

        } catch (error) {
            console.error("Chat start failed:", error.response?.data || error.message);
            if (error.response?.status === 404) {
                const serverMsg = error.response.data?.error || 'Store not found.';
                showAlert(serverMsg, 'error');
            } else if (error.response?.status === 403) {
                showAlert('Permission denied.', 'error');
            } else {
                showAlert('Failed to start chat. Please try again.', 'error');
            }
        }
    };

    const scrollToMap = () => {
        document.getElementById("store-map-section")?.scrollIntoView({ behavior: "smooth" });
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
                    <button onClick={() => navigate('/browseClothes')} className="mt-4 text-purple-600 font-medium flex items-center gap-2 justify-center mx-auto">
                        <FaArrowLeft /> Back to Browse
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
                    <button
                        onClick={() => navigate('/browseClothes')}
                        className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-8 font-medium group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to Collection
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="space-y-4">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 group">
                                <img
                                    src={clothing.images || 'https://via.placeholder.com/600x800'}
                                    alt={clothing.item_name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center gap-2 text-purple-600 text-sm font-bold uppercase tracking-wider">
                                    <FaTag size={12} />
                                    {clothing.category}
                                </div>
                                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                                <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">
                                    {clothing.event_type}
                                </div>
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

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 shadow-sm transition-all hover:shadow-md">
                                    <span className="text-xs text-purple-600 font-black uppercase tracking-widest block mb-1">Rental Price</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-purple-700">₹{clothing.rental_price}</span>
                                        <span className="text-purple-600 font-bold text-xs">/day</span>
                                    </div>
                                </div>
                                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm transition-all hover:shadow-md">
                                    <span className="text-xs text-blue-600 font-black uppercase tracking-widest block mb-1">Security Deposit</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-blue-700">₹{clothing.security_deposit}</span>
                                        <span className="text-blue-600 font-bold text-xs">ref.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-8 px-2">
                                <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${clothing.stock_quantity > 0
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-red-100 text-red-700 border border-red-200'
                                    }`}>
                                    {clothing.stock_quantity > 0 ? 'Available' : 'Stock is over'}
                                </div>
                                <div className="text-sm font-bold text-gray-500 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                                    In Stock: <span className="text-gray-900 font-black">{clothing.stock_quantity}</span>
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                        <FaRuler />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Available Sizes</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {clothing.size?.split(',').map(s => s.trim()).filter(Boolean).map(size => (
                                                <span key={size} className="px-3 py-1 bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-200">
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
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
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-gray-800">Store Location</h4>
                                            {hasValidCoords(clothing.store_latitude, clothing.store_longitude) ? (
                                                <button
                                                    onClick={scrollToMap}
                                                    className="text-xs text-purple-600 font-bold hover:underline"
                                                >
                                                    View on Map
                                                </button>
                                            ) : null}
                                        </div>
                                        <p className="text-gray-600">
                                            {hasValidCoords(clothing.store_latitude, clothing.store_longitude)
                                                ? `${clothing.store_city || ''} ${clothing.store_address || ''}`
                                                : 'Location not provided by store'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                        <FaCheckCircle />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Description</h4>
                                        <p className="text-gray-600 leading-relaxed">
                                            {clothing.description || 'Premium quality clothing carefully inspected for your special occasion.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsRentalModalOpen(true)}
                                disabled={clothing.stock_quantity === 0}
                                className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-purple-700 shadow-xl shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 flex items-center justify-center gap-3"
                            >
                                <FaShoppingCart size={24} />
                                {clothing.stock_quantity > 0 ? 'Rent Now' : 'Stock Over'}
                            </button>

                            <button
                                onClick={handleChatWithStore}
                                className="w-full bg-white text-purple-600 border-2 border-purple-100 py-4 rounded-2xl font-bold text-lg hover:bg-purple-50 hover:border-purple-200 transition-all mt-4 flex items-center justify-center gap-2"
                            >
                                <FaComments size={20} />
                                Chat with Store
                            </button>
                        </div>
                    </div>

                    {isEligible && (
                        <div className="max-w-3xl mx-auto mt-12">
                            <ReviewForm
                                rental={eligibleRental}
                                onReviewSubmitted={handleReviewSubmitted}
                                onCancel={() => setIsEligible(false)}
                            />
                        </div>
                    )}

                    {/* Store Location Map */}
                    {hasValidCoords(clothing.store_latitude, clothing.store_longitude) && (
                        <div id="store-map-section" className="max-w-4xl mx-auto mt-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-purple-500" /> Store Location
                                </h3>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${clothing.store_latitude},${clothing.store_longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-100 transition flex items-center gap-2"
                                >
                                    <FaDirections /> Get Directions
                                </a>
                            </div>
                            <StoreLocationMap
                                readonly={true}
                                initialLocation={{ lat: clothing.store_latitude, lng: clothing.store_longitude }}
                            />
                            <p className="text-xs text-gray-500 mt-2 italic">
                                {clothing.store_address}, {clothing.store_city}
                            </p>
                        </div>
                    )}

                    <div className="max-w-4xl mx-auto mt-12">
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