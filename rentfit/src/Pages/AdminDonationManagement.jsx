import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import AdminSidebar from '../Components/AdminSidebar';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import Alert from '../Components/Alert';
import { 
    FaHandHoldingHeart, 
    FaCheck, 
    FaTimes, 
    FaBox, 
    FaUser, 
    FaStore, 
    FaShieldAlt, 
    FaInfoCircle, 
    FaClock 
} from 'react-icons/fa';

const AdminDonationManagement = () => {
    const [donations, setDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({ message: '', type: '' });

    const fetchDonations = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('donations/admin/');
            setDonations(response.data);
        } catch (error) {
            console.error("Error fetching admin donations:", error);
            setAlert({ message: "Failed to fetch pending donations.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    const handleAction = async (id, action) => {
        try {
            await axiosInstance.patch(`donations/admin/${id}/${action}/`);
            setAlert({ message: `Donation ${action}ed successfully!`, type: "success" });
            fetchDonations();
        } catch (error) {
            setAlert({ message: `Failed to ${action} donation.`, type: "error" });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto space-y-6 text-left">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Donation Moderation</h1>
                                <p className="text-slate-500 font-medium">Coordinate and approve platform-wide donations.</p>
                            </div>
                            <div className="text-sm font-bold text-slate-400">Requests Pending: {donations.length}</div>
                        </div>

                        {isLoading ? (
                            <div className="bg-white rounded-[2.5rem] p-20 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4 text-slate-400">
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="font-black uppercase tracking-widest text-xs">Fetching Donations...</span>
                            </div>
                        ) : donations.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-20 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4 text-slate-400 text-center">
                                <FaHandHoldingHeart size={48} className="text-indigo-500/20" />
                                <span className="font-black uppercase tracking-widest text-xs max-w-xs leading-relaxed">
                                    No donation pledges currently awaiting moderation.
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {donations.map((donation) => (
                                    <div key={donation.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all flex flex-col sm:flex-row">
                                        <div className="w-full sm:w-48 bg-slate-100 relative overflow-hidden h-48 sm:h-auto">
                                            {donation.images ? (
                                                <img 
                                                    src={donation.images} 
                                                    alt={donation.item_name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <FaBox size={40} />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-lg">
                                                    {donation.category}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900 leading-tight">{donation.item_name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-0.5 rounded-md">Size: {donation.size}</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-0.5 rounded-md">{donation.condition}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-rose-50 p-2 rounded-xl text-rose-500">
                                                    <FaShieldAlt size={16} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FaUser className="text-indigo-400" /> From Customer</p>
                                                    <p className="text-sm font-bold text-slate-700 truncate">{donation.customer_email}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FaStore className="text-emerald-400" /> Target Store</p>
                                                    <p className="text-sm font-bold text-slate-700 truncate">{donation.store_name}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <button 
                                                    onClick={() => handleAction(donation.id, 'accept')}
                                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                                                >
                                                    <FaCheck /> Accept Donation
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(donation.id, 'reject')}
                                                    className="flex-1 bg-slate-50 hover:bg-rose-500 hover:text-white text-slate-500 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FaTimes /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
            <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: '', type: '' })} />
        </div>
    );
};

export default AdminDonationManagement;
