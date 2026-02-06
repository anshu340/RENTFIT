import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaCheckCircle size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-8">
                        Your transaction has been completed successfully. Your rental request is now approved.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2 group"
                    >
                        Go to Dashboard
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentSuccess;
