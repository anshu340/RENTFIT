import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import rentalAxiosInstance from '../services/rentalAxiosInstance';
import Navbar from '../Components/Navbar';
import StoreSidebar from '../Components/StoreSidebar';
import { FaCheck, FaTimes, FaUser, FaTshirt, FaCalendarAlt, FaHistory } from 'react-icons/fa';

const RentManagement = () => {
    const navigate = useNavigate();
    const [rentals, setRentals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({ message: '', type: '' });

    useEffect(() => {
        const role = localStorage.getItem('role');
        const token = localStorage.getItem('access_token');

        if (!token || role !== 'Store') {
            navigate('/login');
            return;
        }

        fetchRentals();
    }, [navigate]);

    const fetchRentals = async () => {
        try {
            setIsLoading(true);
            const response = await rentalAxiosInstance.get('store/');
            console.log('Rental Requests Response:', response.data);
            setRentals(response.data);
        } catch (error) {
            console.error('Error fetching rentals:', error);
            showAlert('Failed to load rental requests.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            await rentalAxiosInstance.patch(`${id}/${action}/`);
            showAlert(`Rental request ${action}ed successfully!`, 'success');
            fetchRentals();
        } catch (error) {
            console.error(`Error during rental ${action}:`, error);
            showAlert(`Failed to ${action} rental request.`, 'error');
        }
    };

    const showAlert = (message, type) => {
        setAlert({ message, type });
        setTimeout(() => setAlert({ message: '', type: '' }), 3000);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'rented': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'returned_pending': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'returned_confirmed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 uppercase-none">
            <StoreSidebar />

            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Rental Management</h1>
                            <p className="text-gray-500 mt-2">Manage incoming rental invitations and track active bookings.</p>
                        </div>
                        <button
                            onClick={fetchRentals}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <FaHistory className={isLoading ? 'animate-spin' : ''} />
                            Refresh List
                        </button>
                    </div>

                    {alert.message && (
                        <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between animate-in fade-in slide-in-from-top-4 ${alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                            <span className="font-semibold">{alert.message}</span>
                            <button onClick={() => setAlert({ message: '', type: '' })} className="hover:opacity-70">
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-purple-600">
                                        <th className="px-6 py-4 text-sm font-bold text-white uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-sm font-bold text-white uppercase tracking-wider">Item Details</th>
                                        <th className="px-6 py-4 text-sm font-bold text-white uppercase tracking-wider">Rental Period</th>
                                        <th className="px-6 py-4 text-sm font-bold text-white uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-sm font-bold text-white uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="text-gray-500 font-medium">Fetching your rentals...</p>
                                            </td>
                                        </tr>
                                    ) : rentals.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <FaTshirt className="text-gray-300 text-2xl" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900">No requests found</h3>
                                                <p className="text-gray-500">You don't have any rental requests at the moment.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        rentals.map((rental) => (
                                            <tr key={rental.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                                            <FaUser />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{rental.customer_name || 'Customer'}</p>
                                                            <p className="text-xs text-gray-500">{rental.customer_email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 font-medium text-gray-800">
                                                    <div className="flex items-center gap-2">
                                                        <FaTshirt className="text-purple-400" />
                                                        <span>{rental.clothing_name}</span>
                                                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-widest border border-gray-200">
                                                            Size: {rental.selected_size || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tight">ID: #{rental.id}</p>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FaCalendarAlt className="text-purple-400" />
                                                        <span>{rental.rent_start_date} <span className="text-gray-300 px-1">|</span> {rental.rent_end_date}</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-green-600 mt-1">${rental.total_price} Total</p>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusStyle(rental.status)}`}>
                                                        {rental.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    {rental.status === 'pending' ? (
                                                        <div className="flex justify-end gap-3">
                                                            <button
                                                                onClick={() => handleAction(rental.id, 'approve')}
                                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-bold text-xs flex items-center gap-2 shadow-sm"
                                                            >
                                                                <FaCheck /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(rental.id, 'reject')}
                                                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-bold text-xs flex items-center gap-2 shadow-sm"
                                                            >
                                                                <FaTimes /> Reject
                                                            </button>
                                                        </div>
                                                    ) : rental.status === 'returned_pending' ? (
                                                        <div className="flex justify-end">
                                                            <button
                                                                onClick={() => handleAction(rental.id, 'confirm-return')}
                                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-bold text-xs flex items-center gap-2 shadow-sm"
                                                            >
                                                                <FaCheck /> Confirm Return
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs italic text-gray-400">No actions available</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RentManagement;
