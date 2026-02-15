import React, { useState, useEffect } from 'react';
import rentalAxiosInstance, { submitDamageReport } from '../services/rentalAxiosInstance';
import paymentAxiosInstance from '../services/paymentAxiosInstance';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import Alert from '../Components/Alert';
import DashboardSidebar from '../Components/DashboardSidebar';
import EsewaPayment from '../Components/EsewaPayment';
import { FaCalendarAlt, FaStore, FaClock, FaCheckCircle, FaTimesCircle, FaUndo, FaCreditCard, FaSearch, FaFilter, FaMoneyBillWave, FaExclamationTriangle, FaCloudUploadAlt } from 'react-icons/fa';

const MyRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [filteredRentals, setFilteredRentals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({ message: '', type: '' });
    const [paymentData, setPaymentData] = useState(null);

    // Damage Report State
    const [damageModal, setDamageModal] = useState({ show: false, rentalId: null });
    const [damageData, setDamageData] = useState({ description: '', image: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleDamageSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('rental', damageModal.rentalId);
            formData.append('description', damageData.description);
            if (damageData.image) {
                formData.append('image', damageData.image);
            }

            await submitDamageReport(formData);

            // Now mark as returned
            await handleMarkReturned(damageModal.rentalId);

            setDamageModal({ show: false, rentalId: null });
            setDamageData({ description: '', image: null });
            showAlert('Damage report submitted and item returned!', 'success');
        } catch (error) {
            console.error('Damage Submission Error:', error.response?.data);
            showAlert('Failed to submit damage report. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
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
                <div className="flex-1 flex flex-col min-h-screen p-6 md:p-8 space-y-6">

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
                    {/* (Stats Cards remain same) */}
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
                                <p className="text-gray-500 mt-1">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            filteredRentals.map((rental) => (
                                <div key={rental.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 hover:shadow-md transition-shadow duration-200">
                                    {/* Image */}
                                    <div className="w-full lg:w-48 h-48 lg:h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative group">
                                        {rental.clothing?.images ? (
                                            <img
                                                src={rental.clothing.images}
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

                                    {/* Content (Simplified for brevity) */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{rental.clothing_name}</h3>
                                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                        <span>{rental.store_name}</span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                        <span className="font-bold text-gray-900">${rental.total_price}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-6 mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                <div>
                                                    <p className="mb-1">Start</p>
                                                    <p className="text-gray-900">{rental.rent_start_date}</p>
                                                </div>
                                                <div>
                                                    <p className="mb-1">End</p>
                                                    <p className="text-gray-900">{rental.rent_end_date}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex gap-4">
                                                {rental.status === 'rented' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleMarkReturned(rental.id)}
                                                            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition shadow-lg shadow-purple-100 flex items-center gap-2"
                                                        >
                                                            <FaUndo /> Quick Return
                                                        </button>
                                                        <button
                                                            onClick={() => setDamageModal({ show: true, rentalId: rental.id })}
                                                            className="px-5 py-2.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl font-bold text-sm hover:bg-amber-100 transition flex items-center gap-2"
                                                        >
                                                            <FaExclamationTriangle /> Report Damage
                                                        </button>
                                                    </div>
                                                )}
                                                {rental.status === 'approved' && (
                                                    <button onClick={() => handlePayment(rental.id)} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition shadow-lg shadow-green-100 flex items-center gap-2">
                                                        <FaCreditCard /> Complete Payment
                                                    </button>
                                                )}
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusStyle(rental.status)}`}>
                                                {rental.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Damage Report Modal */}
            {damageModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-white rounded-[2rem] p-10 max-w-xl w-full shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                                <FaExclamationTriangle size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Damage Report</h2>
                                <p className="text-gray-500 font-medium">Please provide details about the damage.</p>
                            </div>
                        </div>

                        <form onSubmit={handleDamageSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Description</label>
                                <textarea
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 focus:outline-none font-medium h-32 transition-colors"
                                    placeholder="Tell us what happened to the item..."
                                    value={damageData.description}
                                    onChange={(e) => setDamageData({ ...damageData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Upload Photo (Optional)</label>
                                <div className="relative group/upload">
                                    <input
                                        type="file"
                                        id="damageImage"
                                        accept="image/*"
                                        onChange={(e) => setDamageData({ ...damageData, image: e.target.files[0] })}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="damageImage"
                                        className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl py-10 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer bg-gray-50 group-hover/upload:shadow-inner"
                                    >
                                        <FaCloudUploadAlt className="text-3xl text-gray-400 group-hover:text-purple-500 mb-2 transition-colors" />
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-purple-700">
                                            {damageData.image ? damageData.image.name : 'Click to upload image'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black text-lg hover:bg-purple-700 transition shadow-xl shadow-purple-200 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDamageModal({ show: false, rentalId: null })}
                                    className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-lg hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
            <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: '', type: '' })} />
        </>
    );
};

export default MyRentals;