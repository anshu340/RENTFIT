import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import StoreSidebar from '../Components/StoreSidebar';
import { FaCheck, FaTimes, FaUser, FaTshirt, FaCalendarAlt, FaHistory, FaExclamationTriangle, FaInfoCircle, FaDollarSign } from 'react-icons/fa';

const RentManagement = () => {
    const navigate = useNavigate();
    const [rentals, setRentals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({ message: '', type: '' });
    const [selectedRental, setSelectedRental] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            const response = await axiosInstance.get('rentals/store/');
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
            await axiosInstance.patch(`rentals/${id}/${action}/`);
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
        <div className="min-h-screen bg-gray-50 flex flex-col uppercase-none">
            <Navbar />

            <div className="flex flex-1">
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
                                            <th className="px-6 py-4 text-sm font-bold text-white uppercase tracking-wider text-center">Payment</th>
                                            <th className="px-6 py-4 text-sm font-bold text-white uppercase tracking-wider text-center">Status</th>
                                            <th className="px-6 py-4 text-sm font-bold text-white uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center">
                                                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                    <p className="text-gray-500 font-medium">Fetching your rentals...</p>
                                                </td>
                                            </tr>
                                        ) : rentals.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center">
                                                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <FaTshirt className="text-gray-300 text-2xl" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900">No requests found</h3>
                                                    <p className="text-gray-500">You don't have any rental requests at the moment.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            rentals.map((rental) => (
                                                <tr key={rental.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0 uppercase-none">
                                                    {/* Customer Column */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                                                                {rental.customer_profile_image ? (
                                                                    <img src={rental.customer_profile_image} alt={rental.customer_name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <FaUser className="text-sm" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-gray-900 text-sm truncate">{rental.customer_name || 'Customer'}</p>
                                                                <p className="text-[10px] text-gray-400 truncate">{rental.customer_email}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Item Details Column */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
                                                                {rental.clothing_image ? (
                                                                    <img src={rental.clothing_image} alt={rental.clothing_name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <FaTshirt className="text-gray-300" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-gray-800 text-sm truncate">{rental.clothing_name}</p>
                                                                <div className="mt-0.5">
                                                                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-black uppercase tracking-widest border border-purple-100">
                                                                        Size: {rental.selected_size || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Rental Period Column */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                                                                <FaCalendarAlt className="text-purple-400 text-[10px]" />
                                                                <span>{rental.rent_start_date}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                                                                <div className="w-[10px] h-[1px] bg-gray-300 ml-[1px]"></div>
                                                                <span>{rental.rent_end_date}</span>
                                                            </div>
                                                            <p className="text-[11px] font-black text-green-600 mt-1 uppercase tracking-tight">Rs. {rental.total_price}</p>
                                                        </div>
                                                    </td>

                                                    {/* Payment Status Column */}
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="inline-flex flex-col items-center gap-1">
                                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${rental.payment_status === 'paid'
                                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                                }`}>
                                                                {rental.payment_status || 'PENDING'}
                                                            </span>
                                                            {rental.payment_status === 'paid' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedRental(rental);
                                                                        setIsModalOpen(true);
                                                                    }}
                                                                    className="text-purple-500 hover:text-purple-700 font-bold text-[9px] uppercase tracking-tighter"
                                                                >
                                                                    Details
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Status Column */}
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${getStatusStyle(rental.status)}`}>
                                                                {rental.status.replace('_', ' ')}
                                                            </span>
                                                            {rental.has_damage_report && (
                                                                <span
                                                                    onClick={() => navigate('/damaged-items')}
                                                                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 cursor-pointer hover:bg-red-100 transition-colors text-[8px] font-black uppercase tracking-tighter"
                                                                >
                                                                    <FaExclamationTriangle />
                                                                    Damaged
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Actions Column */}
                                                    <td className="px-6 py-4 text-right">
                                                        {rental.status === 'pending' ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleAction(rental.id, 'approve')}
                                                                    className="h-8 w-8 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center justify-center shadow-sm"
                                                                    title="Approve"
                                                                >
                                                                    <FaCheck />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(rental.id, 'reject')}
                                                                    className="h-8 w-8 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center justify-center shadow-sm"
                                                                    title="Reject"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </div>
                                                        ) : rental.status === 'returned_pending' ? (
                                                            <button
                                                                onClick={() => handleAction(rental.id, 'confirm-return')}
                                                                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-bold text-[10px] uppercase tracking-wider shadow-sm"
                                                            >
                                                                Confirm Return
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-gray-300 uppercase italic">No Actions</span>
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

            {/* Payment Details Modal */}
            {isModalOpen && selectedRental && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-purple-600 p-6 flex justify-between items-center text-white">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FaDollarSign /> Payment Details
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="space-y-6">
                                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                                        <p className="text-lg font-bold text-gray-900">{selectedRental.customer_name}</p>
                                        <p className="text-sm text-gray-500">{selectedRental.customer_email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Amount Paid</p>
                                        <p className="text-2xl font-black text-green-600">Rs. {selectedRental.payment_details?.amount}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Item Details</p>
                                        <p className="text-sm font-bold text-gray-800">{selectedRental.clothing_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rental Period</p>
                                        <p className="text-sm font-bold text-gray-800">{selectedRental.rent_start_date}</p>
                                        <p className="text-sm font-bold text-gray-800">{selectedRental.rent_end_date}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Transaction Info</p>
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded border border-green-200">
                                            Verified
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Transaction ID</span>
                                            <span className="font-mono font-bold text-gray-800">{selectedRental.payment_details?.transaction_id}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Payment Date</span>
                                            <span className="font-bold text-gray-800">{selectedRental.payment_details?.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default RentManagement;