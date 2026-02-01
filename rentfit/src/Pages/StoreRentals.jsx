import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import Alert from '../Components/Alert';
import { FaCheck, FaTimes, FaBox, FaUser, FaCalendarAlt, FaDollarSign, FaUndo } from 'react-icons/fa';

const StoreRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({ message: '', type: '' });

    useEffect(() => {
        fetchStoreRentals();
    }, []);

    const fetchStoreRentals = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('rent/store/');
            setRentals(response.data);
        } catch (error) {
            console.error('Error fetching store rentals:', error);
            showAlert('Failed to load rental requests.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axiosInstance.patch(`rent/${id}/approve/`);
            showAlert('Rental approved successfully.', 'success');
            fetchStoreRentals();
        } catch (error) {
            showAlert(error.response?.data?.error || 'Failed to approve rental.', 'error');
        }
    };

    const handleReject = async (id) => {
        try {
            await axiosInstance.patch(`rent/${id}/reject/`);
            showAlert('Rental request rejected.', 'info');
            fetchStoreRentals();
        } catch (error) {
            showAlert(error.response?.data?.error || 'Failed to reject rental.', 'error');
        }
    };

    const handleConfirmReturn = async (id) => {
        try {
            await axiosInstance.patch(`rent/${id}/confirm-return/`);
            showAlert('Return confirmed and stock updated.', 'success');
            fetchStoreRentals();
        } catch (error) {
            showAlert(error.response?.data?.error || 'Failed to confirm return.', 'error');
        }
    };

    const showAlert = (message, type) => {
        setAlert({ message, type });
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            rented: 'bg-blue-100 text-blue-800',
            returned_pending: 'bg-purple-100 text-purple-800',
            returned_confirmed: 'bg-gray-100 text-gray-800',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Rental Invitations</h1>
                            <p className="text-gray-600 mt-2">Manage incoming rental requests and confirm completions</p>
                        </div>
                        <button
                            onClick={fetchStoreRentals}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <FaUndo className={isLoading ? 'animate-spin' : ''} />
                            Reload Requests
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : rentals.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-20 text-center border border-dashed border-gray-300">
                            <FaBox className="text-5xl text-gray-300 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-gray-900">No rental requests yet</h3>
                            <p className="text-gray-600 mt-2">When customers request to rent your items, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-center">Rental Info</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-center">Customer</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-center">Dates & Price</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {rentals.map((rental) => (
                                        <tr key={rental.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-6 text-center">
                                                <p className="font-bold text-gray-900">{rental.clothing_name}</p>
                                                <p className="text-xs text-gray-500 mt-1">ID: #{rental.id}</p>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex items-center gap-2 justify-center">
                                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <FaUser className="text-purple-600 text-xs" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{rental.customer_email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <FaCalendarAlt className="text-purple-400" />
                                                        <span>{rental.rent_start_date} → {rental.rent_end_date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                                                        <FaDollarSign />
                                                        <span>{rental.total_price}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(rental.status)}`}>
                                                    {rental.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex justify-center gap-2">
                                                    {rental.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(rental.id)}
                                                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm title='Approve'"
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(rental.id)}
                                                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm title='Reject'"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </>
                                                    )}
                                                    {rental.status === 'returned_pending' && (
                                                        <button
                                                            onClick={() => handleConfirmReturn(rental.id)}
                                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-bold text-xs"
                                                        >
                                                            Confirm Return
                                                        </button>
                                                    )}
                                                    {['approved', 'rented'].includes(rental.status) && (
                                                        <span className="text-xs italic text-gray-400">Waiting for Return</span>
                                                    )}
                                                    {['returned_confirmed', 'rejected'].includes(rental.status) && (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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

export default StoreRentals;
