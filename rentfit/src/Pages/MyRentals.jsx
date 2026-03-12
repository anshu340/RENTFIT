import React, { useState, useEffect } from 'react';
import rentalAxiosInstance, { submitDamageReport } from '../services/rentalAxiosInstance';
import paymentAxiosInstance from '../services/paymentAxiosInstance';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import Alert from '../Components/Alert';
import DashboardSidebar from '../Components/DashboardSidebar';
import EsewaPayment from '../Components/EsewaPayment';
import RentalModal from '../Components/RentalModal';
import { FaClock, FaCheckCircle, FaUndo, FaCreditCard, FaSearch, FaFilter, FaMoneyBillWave, FaExclamationTriangle, FaCloudUploadAlt, FaMapMarkerAlt, FaPhoneAlt, FaCalendarAlt } from 'react-icons/fa';

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

    // Extension States
    const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
    const [selectedClothing, setSelectedClothing] = useState(null);
    const [prefilledStartDate, setPrefilledStartDate] = useState('');
    const [prefilledSize, setPrefilledSize] = useState('');
    const [extensionModal, setExtensionModal] = useState({ show: false, rental: null, newEndDate: '' });

    useEffect(() => {
        fetchRentals();
    }, []);

    useEffect(() => {
        filterRentals();
    }, [rentals, statusFilter, searchQuery]);

    const fetchRentals = async () => {
        try {
            setIsLoading(true);
            const response = await rentalAxiosInstance.get('rentals/my/');
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
            await rentalAxiosInstance.patch(`rentals/${id}/mark-return/`);
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
            const paymentRes = await paymentAxiosInstance.post('payments/initiate/', {
                rental_id: rentalId
            });
            setPaymentData(paymentRes.data);
            showAlert('Redirecting to eSewa...', 'success');
        } catch (error) {
            console.error('Payment Error:', error);
            showAlert('Failed to initiate payment.', 'error');
        }
    };

    const handleDeleteRental = async (rentalId) => {
        if (!window.confirm("Are you sure you want to remove this rental record?")) return;

        try {
            await rentalAxiosInstance.delete(`rentals/${rentalId}/delete/`);
            showAlert('Rental record removed successfully.', 'success');
            fetchRentals(); // refresh list
        } catch (error) {
            console.error("Delete failed:", error);
            showAlert(error.response?.data?.detail || "Failed to remove rental record.", "error");
        }
    };

    const handleExtendRental = (rental) => {
        if (['rented', 'returned_pending', 'returned_confirmed'].includes(rental.status)) {
            // For active or already returned rentals, open RentalModal for a new request
            let nextStartDate;
            const currentEndDate = new Date(rental.rent_end_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (rental.status === 'rented') {
                // Continuation: Start Date = End Date + 1
                nextStartDate = new Date(currentEndDate);
                nextStartDate.setDate(nextStartDate.getDate() + 1);
            } else {
                // Rent Again: Start Date = Today
                nextStartDate = today;
            }

            const formattedNextDay = nextStartDate.toISOString().split('T')[0];

            setSelectedClothing(rental.clothing);
            setPrefilledStartDate(formattedNextDay);
            setPrefilledSize(rental.selected_size);
            setIsRentalModalOpen(true);
        } else if (['pending', 'rejected', 'approved'].includes(rental.status)) {
            // For pending/rejected/approved, open update modal to change existing end date
            setExtensionModal({
                show: true,
                rental: rental,
                newEndDate: rental.rent_end_date
            });
        }
    };

    const handleUpdateExtension = async () => {
        const { rental, newEndDate } = extensionModal;
        if (!newEndDate) return;

        try {
            setIsSubmitting(true);
            await rentalAxiosInstance.patch(`rentals/${rental.id}/update/`, {
                rent_end_date: newEndDate
            });
            showAlert('Rental duration updated successfully!', 'success');
            setExtensionModal({ show: false, rental: null, newEndDate: '' });
            fetchRentals();
        } catch (error) {
            console.error('Update failed:', error);
            showAlert(error.response?.data?.detail || 'Failed to update rental duration.', 'error');
        } finally {
            setIsSubmitting(false);
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

    const getReturnDateStyle = (dateStr, status) => {
        if (!['rented', 'approved'].includes(status)) return 'text-gray-900';
        if (!dateStr) return 'text-gray-900';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(dateStr);
        endDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'text-red-600 font-bold'; // Overdue
        if (diffDays === 0 || diffDays === 1) return 'text-orange-600 font-bold'; // Due Today or Tomorrow
        return 'text-gray-900';
    };

    const getReturnStatusBadge = (dateStr, status) => {
        if (status === 'returned_confirmed') return { label: 'Returned', style: 'bg-green-50 text-green-600 border-green-100' };
        if (!['rented', 'approved'].includes(status)) return null;
        if (!dateStr) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(dateStr);
        endDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Overdue', style: 'bg-red-50 text-red-600 border-red-100' };
        if (diffDays === 0) return { label: 'Due Today', style: 'bg-orange-50 text-orange-600 border-orange-100' };
        if (diffDays === 1) return { label: 'Due Tomorrow', style: 'bg-orange-50 text-orange-600 border-orange-100' };

        return { label: 'Active', style: 'bg-green-50 text-green-600 border-green-100' };
    };

    const getRentalDuration = (start, end) => {
        if (!start || !end) return '';
        const s = new Date(start);
        const e = new Date(end);
        const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
        return `${diff} days`;
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
                            filteredRentals.map((rental) => {
                                const statusBadge = getReturnStatusBadge(rental.rent_end_date, rental.status);
                                return (
                                    <div key={rental.id} className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6 hover:shadow-md transition-all duration-300">
                                        {/* Urgency Badge in Top Right */}
                                        {statusBadge && statusBadge.label !== 'Active' && statusBadge.label !== 'Returned' && (
                                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm z-10 ${statusBadge.style}`}>
                                                {statusBadge.label}
                                            </div>
                                        )}

                                        {/* Main Content */}
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            {/* Image */}
                                            <div className="w-full lg:w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden relative">
                                                {rental.clothing?.images ? (
                                                    <img
                                                        src={rental.clothing.images}
                                                        alt={rental.clothing_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 truncate pr-24">{rental.clothing_name}</h3>
                                                        <div className="text-sm text-gray-500 mt-0.5 font-medium">
                                                            Size: {rental.clothing?.size || 'M'} | Brand: {rental.clothing?.brand || 'Premium'}
                                                        </div>
                                                        {statusBadge && (statusBadge.label === 'Active' || statusBadge.label === 'Returned') && (
                                                            <div className={`mt-3 inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusBadge.style}`}>
                                                                {statusBadge.label}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-black text-gray-900">${rental.total_price}</div>
                                                        <div className="text-xs font-bold text-gray-400 mt-1">{getRentalDuration(rental.rent_start_date, rental.rent_end_date)}</div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                                            {['rented', 'returned_pending', 'returned_confirmed'].includes(rental.status) ? 'Rental Dates' : 'Requested Dates'}
                                                        </p>
                                                        <p className={`text-sm font-bold ${['rented', 'returned_pending', 'returned_confirmed'].includes(rental.status) ? 'text-gray-800' : 'text-purple-600 italic'}`}>
                                                            {rental.rent_start_date} - {rental.rent_end_date}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Payment</p>
                                                        <p className={`text-sm font-bold ${['rented', 'returned_pending', 'returned_confirmed'].includes(rental.status)
                                                            ? 'text-green-600'
                                                            : rental.status === 'approved'
                                                                ? 'text-orange-500'
                                                                : 'text-gray-400'
                                                            }`}>
                                                            {['rented', 'returned_pending', 'returned_confirmed'].includes(rental.status)
                                                                ? 'Paid'
                                                                : rental.status === 'approved'
                                                                    ? 'Awaiting Payment'
                                                                    : 'Not Paid'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-gray-100 pt-4">
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-6">
                                                    <button className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 transition">
                                                        <FaMapMarkerAlt size={14} />
                                                        View Store
                                                    </button>
                                                    <button className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-700 transition">
                                                        <FaPhoneAlt size={14} />
                                                        Contact
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {rental.status === 'rented' && (
                                                        <>
                                                            <button
                                                                onClick={() => setDamageModal({ show: true, rentalId: rental.id })}
                                                                className="text-gray-400 hover:text-amber-500 transition px-3 hover:scale-110"
                                                                title="Report Damage"
                                                            >
                                                                <FaExclamationTriangle />
                                                            </button>
                                                            <button
                                                                onClick={() => handleMarkReturned(rental.id)}
                                                                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm transition shadow-lg shadow-blue-100 hover:-translate-y-0.5"
                                                            >
                                                                Return Now
                                                            </button>
                                                        </>
                                                    )}
                                                    {rental.status === 'approved' && (
                                                        <button
                                                            onClick={() => handlePayment(rental.id)}
                                                            className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm transition shadow-lg shadow-green-100 hover:-translate-y-0.5"
                                                        >
                                                            Pay Now
                                                        </button>
                                                    )}
                                                    {rental.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleDeleteRental(rental.id)}
                                                            className="px-6 py-2 border-2 border-red-100 text-red-500 rounded-xl font-bold text-xs hover:bg-red-50 hover:border-red-200 transition-all uppercase tracking-wider"
                                                        >
                                                            Cancel Request
                                                        </button>
                                                    )}
                                                    {rental.status === 'rejected' && (
                                                        <button
                                                            onClick={() => handleDeleteRental(rental.id)}
                                                            className="px-6 py-2 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all uppercase tracking-wider"
                                                        >
                                                            Delete Record
                                                        </button>
                                                    )}
                                                    {['pending', 'rejected', 'rented', 'approved', 'returned_pending', 'returned_confirmed'].includes(rental.status) && (
                                                        <button
                                                            onClick={() => handleExtendRental(rental)}
                                                            className="px-6 py-2 border-2 border-purple-100 text-purple-600 rounded-xl font-bold text-xs hover:bg-purple-50 hover:border-purple-200 transition-all uppercase tracking-wider flex items-center gap-2"
                                                        >
                                                            <FaCalendarAlt />
                                                            {['returned_pending', 'returned_confirmed'].includes(rental.status) ? 'Rent Again' : 'Extend'}
                                                        </button>
                                                    )}
                                                    {rental.status === 'returned_pending' && (
                                                        <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">
                                                            <FaClock className="animate-pulse" />
                                                            <span className="text-xs font-black uppercase tracking-wider">Awaiting Confirmation</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
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

            {/* Extension Date Picker Modal (For Pending/Rejected) */}
            {extensionModal.show && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
                        <div className="bg-purple-600 p-6 text-white text-center">
                            <h2 className="text-xl font-bold">Extend Duration</h2>
                            <p className="text-purple-100 mt-1">Update your rental end date</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">New End Date</label>
                                <input
                                    type="date"
                                    min={extensionModal.rental.rent_start_date}
                                    value={extensionModal.newEndDate}
                                    onChange={(e) => setExtensionModal(prev => ({ ...prev, newEndDate: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setExtensionModal({ show: false, rental: null, newEndDate: '' })}
                                    className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateExtension}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg transition-all"
                                >
                                    {isSubmitting ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Extension Modal (Standard Rental Request) */}
            {selectedClothing && (
                <RentalModal
                    isOpen={isRentalModalOpen}
                    onClose={() => {
                        setIsRentalModalOpen(false);
                        setSelectedClothing(null);
                        setPrefilledStartDate('');
                        setPrefilledSize('');
                    }}
                    clothing={selectedClothing}
                    prefilledStartDate={prefilledStartDate}
                    prefilledSize={prefilledSize}
                    onRentalCreated={(msg, type) => {
                        showAlert(msg, type);
                        fetchRentals();
                    }}
                />
            )}

            <Footer />
            <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: '', type: '' })} />
        </>
    );
};

export default MyRentals;