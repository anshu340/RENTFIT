import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaTimesCircle size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Failed</h1>
                    <p className="text-gray-600 mb-8">
                        Something went wrong during the payment process. Please try again.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/browseClothes')}
                            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                            <FaArrowLeft /> Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentFailure;
