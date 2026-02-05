import React, { useState, useEffect } from "react";
import { reviewService } from "../services/reviewAxiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Alert from "../Components/Alert";
import DashboardSidebar from "../Components/DashboardSidebar";
import { FaStar, FaStore, FaTshirt, FaCalendarAlt, FaTrash, FaEdit, FaQuoteLeft } from "react-icons/fa";

const MyReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({ message: "", type: "" });

    useEffect(() => {
        fetchMyReviews();
    }, []);

    const fetchMyReviews = async () => {
        try {
            setIsLoading(true);
            const data = await reviewService.getMyReviews();
            setReviews(data.results || data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            showAlert("Failed to load your reviews.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await reviewService.deleteReview(id);
            showAlert("Review deleted successfully.", "success");
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            showAlert("Failed to delete review.", "error");
        }
    };

    const showAlert = (message, type) => {
        setAlert({ message, type });
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
                <DashboardSidebar />
                <main className="flex-1 p-8">
                    <div className="max-w-5xl mx-auto">
                        <header className="mb-10">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Review History</h1>
                            <p className="text-gray-500 mt-2 font-medium">Manage and track all reviews you've shared with our community.</p>
                        </header>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                    <FaStar size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Average Rating Given</p>
                                    <h3 className="text-3xl font-black text-gray-900">{averageRating} <span className="text-lg text-gray-400">/ 5.0</span></h3>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <FaQuoteLeft size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Reviews Written</p>
                                    <h3 className="text-3xl font-black text-gray-900">{reviews.length}</h3>
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-sm p-20 text-center border border-gray-100">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaStar className="text-3xl text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No reviews yet</h3>
                                <p className="text-gray-500 mt-2 max-w-xs mx-auto font-medium">
                                    You haven't written any reviews for your rentals yet. Your feedback helps others choose the best outfits!
                                </p>
                                <a
                                    href="/myrentals"
                                    className="mt-8 inline-block px-8 py-3 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
                                >
                                    Go to My Rentals
                                </a>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                                        <div className="flex flex-col md:flex-row">
                                            {/* Top/Left: Item Info */}
                                            <div className="w-full md:w-64 h-48 md:h-auto relative bg-gray-100">
                                                {review.dress_image ? (
                                                    <img
                                                        src={review.dress_image}
                                                        alt={review.dress_name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <FaTshirt size={40} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 md:hidden">
                                                    <h3 className="text-white font-bold">{review.dress_name}</h3>
                                                </div>
                                            </div>

                                            {/* Right: Review Details */}
                                            <div className="flex-1 p-6 flex flex-col justify-between">
                                                <div>
                                                    <div className="hidden md:flex justify-between items-start mb-2">
                                                        <h3 className="text-xl font-bold text-gray-900">{review.dress_name}</h3>
                                                        <div className="flex bg-yellow-50 px-3 py-1 rounded-full items-center gap-1.5 border border-yellow-100">
                                                            <FaStar className="text-yellow-500" size={14} />
                                                            <span className="text-sm font-black text-yellow-700">{review.rating}.0</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 mb-4">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                            <FaStore className="text-purple-500" />
                                                            <span>{review.store_name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                            <FaCalendarAlt className="text-blue-500" />
                                                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50 p-4 rounded-2xl relative">
                                                        <FaQuoteLeft className="text-gray-200 absolute -top-2 -left-2" size={20} />
                                                        <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-6 border-t border-gray-50 flex justify-end gap-3">
                                                    <button
                                                        disabled
                                                        className="px-4 py-2 text-sm font-bold text-gray-400 bg-gray-50 rounded-xl cursor-not-allowed flex items-center gap-2"
                                                    >
                                                        <FaEdit size={14} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="px-4 py-2 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-2"
                                                    >
                                                        <FaTrash size={14} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
            <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ message: "", type: "" })}
            />
        </div>
    );
};

export default MyReviews;
