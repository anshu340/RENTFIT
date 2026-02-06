import React, { useState, useEffect } from 'react';
import rentalAxiosInstance from '../services/rentalAxiosInstance';
import paymentAxiosInstance from '../services/paymentAxiosInstance';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import Alert from '../Components/Alert';
import DashboardSidebar from '../Components/DashboardSidebar';
import EsewaPayment from '../Components/EsewaPayment';
import { FaCalendarAlt, FaStore, FaClock, FaCheckCircle, FaTimesCircle, FaUndo, FaCreditCard, FaSearch, FaFilter, FaMoneyBillWave } from 'react-icons/fa';

const MyRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [filteredRentals, setFilteredRentals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({ message: '', type: '' });
    const [paymentData, setPaymentData] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRentals();
    }, []);

    useEffect(() => {
        filterRentals();
    }, [rentals, statusFilter, searchQuery]);

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

    const filterRentals = () => {
        let result = rentals;

        if (statusFilter !== 'All Status') {
            result = result.filter(r => r.status === statusFilter.toLowerCase().replace(' ', '_'));
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.clothing_name.toLowerCase().includes(query) ||
                r.store_name.toLowerCase().includes(query)
            );
        }

        setFilteredRentals(result);
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

    const handlePayment = async (rentalId) => {
        try {
            const paymentRes = await paymentAxiosInstance.post('initiate/', {
                rental_id: rentalId
            });
            setPaymentData(paymentRes.data);
            showAlert('Redirecting to eSewa...', 'success');
        } catch (error) {
            console.error('Payment Error:', error);
            showAlert('Failed to initiate payment.', 'error');
        }
    };

    const showAlert = (message, type) => {
        setAlert({ message, type });
        setTimeout(() => setAlert({ message: '', type: '' }), 3000);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'rented': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'returned_pending': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'returned_confirmed': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    // calculate stats
    const activeRentalsCount = rentals.filter(r => ['rented', 'approved'].includes(r.status)).length;
    const totalRentalsCount = rentals.length;
    const totalSpent = rentals
        .filter(r => ['rented', 'returned_pending', 'returned_confirmed'].includes(r.status))
        .reduce((sum, r) => sum + parseFloat(r.total_price), 0);
    const pendingCount = rentals.filter(r => r.status === 'pending').length;

    return (
        <>
            {paymentData && <EsewaPayment data={paymentData} />}
            <Navbar />
            <div className="flex min-h-screen bg-gray-50 text-gray-800">
                <DashboardSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-screen">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Rentals</h1>
                            <p className="text-gray-500 mt-1">Track and manage your clothing rentals in one place.</p>
                        </div>
                        <a href="/browseClothes" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2">
                            + New Rental
                        </a>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Rentals</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{activeRentalsCount}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                <FaClock />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{totalRentalsCount}</p>
                            </div>
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                                <FaCheckCircle />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Approval</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{pendingCount}</p>
                            </div>
                            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                <FaUndo />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">${totalSpent.toFixed(2)}</p>
                            </div>
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                <FaMoneyBillWave />
                            </div>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <h2 className="font-bold text-gray-800 whitespace-nowrap">Filter Rentals</h2>
                            <div className="relative">
                                <select
                                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option>All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rented">Rented (Active)</option>
                                    <option value="returned_pending">Return Pending</option>
                                    <option value="returned_confirmed">Completed</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <FaFilter className="absolute right-3 top-3 text-gray-400 text-xs pointer-events-none" />
                            </div>
                        </div>
                        <div className="w-full md:w-96 relative">
                            <input
                                type="text"
                                placeholder="Search rentals..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
                        </div>
                    </div>

                    {/* Rentals List */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-20">
                                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-gray-500 mt-3 font-medium">Loading rentals...</p>
                            </div>
                        ) : filteredRentals.length === 0 ? (
                            <div className="bg-white p-16 rounded-xl border border-gray-100 text-center shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaSearch className="text-gray-300 text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No rentals found</h3>
                                <p className="text-gray-500 mt-1">Try adjusting your filters or filters.</p>
                            </div>
                        ) : (
                            filteredRentals.map((rental) => (
                                <div key={rental.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 hover:shadow-md transition-shadow duration-200">
                                    {/* Image */}
                                    <div className="w-full lg:w-48 h-48 lg:h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative group">
                                        {rental.clothing.image_url ? (
                                            <img
                                                src={rental.clothing.image_url}
                                                alt={rental.clothing_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                                                No Image
                                            </div>
                                        )}
                                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border bg-white/90 ${getStatusStyle(rental.status).split(' ')[1]}`}>
                                            {rental.status.replace('_', ' ')}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{rental.clothing_name}</h3>
                                                    <p className="text-sm text-gray-500 font-medium mt-1">{rental.clothing.category} • {rental.clothing.gender}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">${rental.total_price}</p>
                                                    <p className="text-xs text-gray-400 font-medium">Total Cost</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Start Date</p>
                                                    <p className="font-semibold text-gray-700">{rental.rent_start_date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Return Date</p>
                                                    <p className="font-semibold text-gray-700">{rental.rent_end_date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Store</p>
                                                    <div className="flex items-center gap-1 font-semibold text-purple-600">
                                                        <FaStore className="text-xs" /> {rental.store_name}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Payment</p>
                                                    <p className={`font-bold ${['rented', 'returned_pending', 'returned_confirmed'].includes(rental.status) ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {['rented', 'returned_pending', 'returned_confirmed'].includes(rental.status) ? 'PAID' : 'PENDING'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex gap-4 text-sm font-medium text-gray-500">
                                                <button className="hover:text-purple-600 flex items-center gap-1 transition-colors">
                                                    View Store
                                                </button>
                                                <button className="hover:text-purple-600 flex items-center gap-1 transition-colors">
                                                    Contact Support
                                                </button>
                                            </div>

                                            <div className="flex gap-3">
                                                {rental.status === 'rented' && (
                                                    <button
                                                        onClick={() => handleMarkReturned(rental.id)}
                                                        className="px-5 py-2 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 font-bold text-sm transition-all shadow-sm flex items-center gap-2"
                                                    >
                                                        <FaUndo className="text-xs" /> Return Item
                                                    </button>
                                                )}
                                                {rental.status === 'approved' && (
                                                    <button
                                                        onClick={() => handlePayment(rental.id)}
                                                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                                    >
                                                        <FaCreditCard /> Pay Now
                                                    </button>
                                                )}
                                                {rental.status === 'pending' && (
                                                    <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full border border-orange-200">
                                                        Awaiting Approval
                                                    </span>
                                                )}
                                                {rental.status === 'rejected' && (
                                                    <span className="text-xs font-semibold bg-red-100 text-red-700 px-3 py-1.5 rounded-full border border-red-200">
                                                        Declined
                                                    </span>
                                                )}
                                                {rental.status === 'returned_confirmed' && (
                                                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200">
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
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
