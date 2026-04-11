import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import { formatPrice } from '../services/axiosInstance';
import AdminSidebar from '../Components/AdminSidebar';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import Alert from '../Components/Alert';
import { FaCheck, FaTimes, FaEye, FaTag, FaStore, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const AdminListingApproval = () => {
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({ message: '', type: '' });
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchPendingListings = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('accounts/admin/clothing/pending/');
            setListings(response.data);
        } catch (error) {
            console.error("Error fetching pending listings:", error);
            setAlert({ message: "Failed to fetch pending listings.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingListings();
    }, []);

    const handleApproval = async (id, action) => {
        try {
            const url = `accounts/admin/clothing/${id}/${action}/`;
            const response = await axiosInstance.patch(url);
            setAlert({ message: response.data.message, type: "success" });
            fetchPendingListings();
            if (selectedItem?.id === id) setSelectedItem(null);
        } catch (error) {
            setAlert({ message: `Failed to ${action} listing.`, type: "error" });
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
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Listing Approval</h1>
                                <p className="text-slate-500 font-medium">Review and moderate new clothing listings.</p>
                            </div>
                            <div className="text-sm font-bold text-slate-400">Pending Requests: {listings.length}</div>
                        </div>

                        {isLoading ? (
                            <div className="bg-white rounded-[2.5rem] p-20 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4 text-slate-400">
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="font-black uppercase tracking-widest text-xs">Loading Listings...</span>
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-20 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4 text-slate-400">
                                <FaCheckCircle size={48} className="text-emerald-500/20" />
                                <span className="font-black uppercase tracking-widest text-xs">No pending listing requests found.</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {listings.map((item) => (
                                    <div key={item.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
                                        <div className="aspect-[4/5] relative overflow-hidden bg-slate-100">
                                            {item.image_url ? (
                                                <img 
                                                    src={item.image_url} 
                                                    alt={item.item_name} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <FaTag size={40} />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
                                                    <FaClock className="text-amber-500" /> Pending Approval
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 leading-tight">{item.item_name}</h3>
                                                <p className="text-sm text-slate-500 font-bold flex items-center gap-1.5 mt-1">
                                                    <FaStore className="text-indigo-500" /> {item.store_name}
                                                </p>
                                            </div>
                                            
                                            <div className="flex justify-between items-center py-4 border-y border-slate-50">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rental Price</p>
                                                    <p className="text-xl font-black text-indigo-600">{formatPrice(item.rental_price)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                                                    <p className="text-sm font-black text-slate-700">{item.category}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <button 
                                                    onClick={() => handleApproval(item.id, 'approve')}
                                                    className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FaCheck /> Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleApproval(item.id, 'reject')}
                                                    className="flex-1 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
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

export default AdminListingApproval;
