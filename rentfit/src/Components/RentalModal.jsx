import React, { useState } from 'react';
import axiosInstance from '../services/axiosInstance';

const RentalModal = ({ isOpen, onClose, clothing, onRentalCreated }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post('rent/create/', {
                clothing: clothing.id,
                rent_start_date: startDate,
                rent_end_date: endDate,
            });

            onRentalCreated('Rental request submitted successfully!', 'success');
            onClose();
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.error || err.response?.data?.non_field_errors?.[0] || 'Failed to create rental request.';
            setError(errorMsg);
            onRentalCreated(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="bg-purple-600 p-6 text-white text-center">
                    <h2 className="text-2xl font-bold">Rent Item</h2>
                    <p className="text-purple-100 mt-1">{clothing.item_name}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Start Date</label>
                        <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">End Date</label>
                        <input
                            type="date"
                            required
                            min={startDate || new Date().toISOString().split('T')[0]}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Price per day:</span>
                        <span className="text-xl font-bold text-purple-600">${clothing.rental_price}</span>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 py-3 bg-purple-600 rounded-xl text-white font-bold shadow-lg transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700 hover:-translate-y-0.5'
                                }`}
                        >
                            {isLoading ? 'Processing...' : 'Confirm Rent'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RentalModal;
