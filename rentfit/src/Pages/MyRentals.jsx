import React, { useState, useEffect } from 'react';
import rentalAxiosInstance from '../services/rentalAxiosInstance';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import Alert from '../Components/Alert';
import { FaCalendarAlt, FaDollarSign, FaClock, FaCheckCircle, FaTimesCircle, FaUndo } from 'react-icons/fa';

const MyRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({ message: '', type: '' });

    useEffect(() => {
        fetchRentals();
    }, []);

    const fetchRentals = async () => {
        try {
            setIsLoading(true);
            const response = await rentalAxiosInstance.get('my/');
            setRentals(response.data);
        } catch (error) {
            console.error('Error fetching rentals:', error);
            showAlert('Failed to load rentals.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkReturned = async (id) => {
        try {
            await rentalAxiosInstance.patch(`${id}/mark-return/`);
            showAlert('Item marked as returned. Waiting for store confirmation.', 'success');
            fetchRentals();
        } catch (error) {
            console.error('Error marking return:', error);
            showAlert(error.response?.data?.error || 'Failed to mark as returned.', 'error');
        }
    };

    const showAlert = (message, type) => {
        setAlert({ message, type });
    };

    const getStatusStyle = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            rented: 'bg-blue-100 text-blue-800 border-blue-200',
            returned_pending: 'bg-purple-100 text-purple-800 border-purple-200',
            returned_confirmed: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Rentals</h1>
                            <p className="text-gray-600 mt-2">Manage your rental requests and history</p>
                        </div>
                        <button
                            onClick={fetchRentals}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <FaUndo className={isLoading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : rentals.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-20 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaCalendarAlt className="text-3xl text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No rentals found</h3>
                            <p className="text-gray-600 mt-2 max-w-xs mx-auto">
                                You haven't made any rental requests yet. Explore our collection and find something perfect!
                            </p>
                            <a
                                href="/browseClothes"
                                className="mt-8 inline-block px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200"
                            >
                                Browse Clothes
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rentals.map((rental) => (
                                <div key={rental.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(rental.status)}`}>
                                                {rental.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <p className="text-xs text-gray-400">ID: #{rental.id}</p>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{rental.clothing_name}</h3>
                                        <p className="text-sm text-gray-500 mb-4">Store: {rental.store_name}</p>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <FaCalendarAlt className="text-purple-500" />
                                                <span>{rental.rent_start_date} to {rental.rent_end_date}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <FaDollarSign className="text-green-500" />
                                                <span className="font-bold text-gray-900">Total: ${rental.total_price}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                                        {(rental.status === 'approved' || rental.status === 'rented') && (
                                            <button
                                                onClick={() => handleMarkReturned(rental.id)}
                                                className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-sm"
                                            >
                                                Mark as Returned
                                            </button>
                                        )}
                                        {rental.status === 'pending' && (
                                            <p className="text-center text-sm text-yellow-600 font-medium py-2 italic">
                                                Waiting for store approval
                                            </p>
                                        )}
                                        {rental.status === 'returned_pending' && (
                                            <p className="text-center text-sm text-purple-600 font-medium py-2 italic flex items-center justify-center gap-2">
                                                <FaClock className="animate-pulse" />
                                                Waiting for return confirmation
                                            </p>
                                        )}
                                        {rental.status === 'returned_confirmed' && (
                                            <div className="flex justify-center items-center gap-2 py-2 text-green-600 font-bold">
                                                <FaCheckCircle />
                                                <span>Rental Completed</span>
                                            </div>
                                        )}
                                        {rental.status === 'rejected' && (
                                            <div className="flex justify-center items-center gap-2 py-2 text-red-600 font-bold">
                                                <FaTimesCircle />
                                                <span>Request Rejected</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
            <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ message: '', type: '' })}
            />
        </>
    );
};

export default MyRentals;