import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import AdminSidebar from '../Components/AdminSidebar';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { FaHistory, FaTshirt, FaHandHoldingHeart, FaClock, FaChevronRight } from 'react-icons/fa';

const AdminActivity = () => {
    const [activity, setActivity] = useState({
        recent_rentals: [],
        recent_donations: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await axiosInstance.get('admin/activity/');
                setActivity(response.data);
            } catch (error) {
                console.error("Error fetching admin activity:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchActivity();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Activity</h1>
                            <p className="text-slate-500 font-medium">Real-time pulse of rentals and donations across the platform.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Recent Rentals */}
                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                            <FaTshirt />
                                        </div>
                                        Recent Rentals
                                    </h2>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Latest 10</span>
                                </div>
                                <div className="flex-1 overflow-y-auto max-h-[600px]">
                                    {isLoading ? (
                                        <div className="p-20 text-center text-slate-400 font-bold">Loading rentals...</div>
                                    ) : activity.recent_rentals.length === 0 ? (
                                        <div className="p-20 text-center text-slate-400 font-bold">No recent rentals found.</div>
                                    ) : (
                                        <div className="divide-y divide-slate-50">
                                            {activity.recent_rentals.map((rental) => (
                                                <div key={rental.id} className="p-6 hover:bg-slate-50 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200">
                                                            {rental.clothing_image ? (
                                                                <img src={rental.clothing_image} alt={rental.clothing_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                    <FaTshirt size={24} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className="font-bold text-slate-900 truncate">{rental.clothing_name}</h4>
                                                                <span className="text-indigo-600 font-black text-sm">${rental.total_price}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                                                <span>By {rental.customer_name}</span>
                                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                                <span className="flex items-center gap-1"><FaClock size={10} /> {formatDate(rental.created_at)}</span>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${rental.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                rental.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                    'bg-slate-50 text-slate-600 border-slate-100'
                                                                }`}>
                                                                {rental.status}
                                                            </span>
                                                        </div>
                                                        <FaChevronRight className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Donations */}
                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                        <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                                            <FaHandHoldingHeart />
                                        </div>
                                        Recent Donations
                                    </h2>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Latest 10</span>
                                </div>
                                <div className="flex-1 overflow-y-auto max-h-[600px]">
                                    {isLoading ? (
                                        <div className="p-20 text-center text-slate-400 font-bold">Loading donations...</div>
                                    ) : activity.recent_donations.length === 0 ? (
                                        <div className="p-20 text-center text-slate-400 font-bold">No recent donations found.</div>
                                    ) : (
                                        <div className="divide-y divide-slate-50">
                                            {activity.recent_donations.map((donation) => (
                                                <div key={donation.id} className="p-6 hover:bg-slate-50 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 font-black uppercase overflow-hidden border border-rose-100">
                                                            {donation.image_url ? (
                                                                <img
                                                                    src={donation.image_url}
                                                                    alt={donation.item_name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                donation.donor_name ? donation.donor_name.charAt(0) : 'D'
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className="font-bold text-slate-900 truncate">{donation.clothing_type || 'Clothing Donation'}</h4>
                                                                <span className="text-rose-500 font-black text-sm">{donation.quantity} Items</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                                                <span>From {donation.donor_name}</span>
                                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                                <span className="flex items-center gap-1"><FaClock size={10} /> {formatDate(donation.created_at)}</span>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${donation.donation_status === 'collected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                'bg-amber-50 text-amber-600 border-amber-100'
                                                                }`}>
                                                                {donation.donation_status}
                                                            </span>
                                                        </div>
                                                        <FaChevronRight className="text-slate-200 group-hover:text-rose-400 transition-colors" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminActivity;
