import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import AdminSidebar from '../Components/AdminSidebar';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { FaTshirt, FaCheck, FaTimes, FaEye, FaStore, FaClock } from 'react-icons/fa';

const AdminClothingApproval = () => {
    const [pendingClothes, setPendingClothes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchPendingClothes();
    }, []);

    const fetchPendingClothes = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('admin/clothing/pending/');
            setPendingClothes(response.data);
        } catch (error) {
            console.error("Error fetching pending clothes:", error);
            setMessage({ type: 'error', text: 'Failed to load pending clothing items.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproval = async (id, status) => {
        try {
            await axiosInstance.patch(`admin/clothing/${id}/approve/`, { status });
            setMessage({
                type: 'success',
                text: `Item ${status === 'approved' ? 'approved' : 'rejected'} successfully.`
            });
            fetchPendingClothes();
            if (showDetailModal) setShowDetailModal(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error(`Error ${status}ing item:`, error);
            setMessage({ type: 'error', text: `Failed to ${status} item.` });
        }
    };

    const handleViewDetail = (item) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clothing Approval</h1>
                                <p className="text-slate-500 font-medium">Review and approve new clothing items from stores.</p>
                            </div>
                        </div>

                        {/* Message Display */}
                        {message.text && (
                            <div className={`p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                                } font-bold text-sm shadow-sm animate-in fade-in slide-in-from-top-4 duration-300`}>
                                {message.text}
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-500 font-bold">Loading pending items...</p>
                            </div>
                        ) : pendingClothes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center px-6">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                                    <FaTshirt className="text-slate-300 text-4xl" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Queue Clear!</h2>
                                <p className="text-slate-500 font-medium max-w-md mx-auto">There are no pending clothing items awaiting approval at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingClothes.map((item) => (
                                    <div key={item.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                        <div className="relative h-64 overflow-hidden">
                                            <img
                                                src={item.image_url || item.images || 'https://via.placeholder.com/400x500'}
                                                alt={item.item_name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50 shadow-lg flex items-center gap-2">
                                                <FaStore className="text-indigo-500 text-xs" />
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest truncate max-w-[120px]">{item.store_name}</span>
                                            </div>
                                            <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                                                <FaClock className="text-xs" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="mb-4">
                                                <h3 className="text-xl font-black text-slate-900 truncate mb-1">{item.item_name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                                                    <span className="text-slate-200">|</span>
                                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">₹{item.rental_price}/Day</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(item)}
                                                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FaEye /> Detail
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(item.id, 'approved')}
                                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] py-3 rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FaCheck /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(item.id, 'rejected')}
                                                    className="w-12 bg-rose-50 hover:bg-rose-100 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] py-3 rounded-xl transition-all flex items-center justify-center"
                                                    title="Reject"
                                                >
                                                    <FaTimes />
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

            {/* Detail Modal */}
            {showDetailModal && selectedItem && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
                        {/* Image Section */}
                        <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden relative">
                            <img
                                src={selectedItem.image_url || selectedItem.images || 'https://via.placeholder.com/800x1200'}
                                alt={selectedItem.item_name}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="absolute top-6 left-6 w-10 h-10 bg-white/90 backdrop-blur-md text-slate-900 rounded-full flex items-center justify-center shadow-xl md:hidden"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Content Section */}
                        <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                                    <FaStore /> {selectedItem.store_name}
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full hidden md:flex items-center justify-center transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <h2 className="text-4xl font-black text-slate-900 mb-2 leading-tight">{selectedItem.item_name}</h2>
                            <p className="text-slate-500 font-medium text-lg mb-8">{selectedItem.description || "No description provided by the store."}</p>

                            <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                                    <p className="font-bold text-slate-900">{selectedItem.category}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Event Type</p>
                                    <p className="font-bold text-slate-900">{selectedItem.event_type}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Size</p>
                                    <p className="font-bold text-slate-900">{selectedItem.size}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Condition</p>
                                    <p className="font-bold text-slate-900">{selectedItem.condition}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rental Price</p>
                                    <p className="font-bold text-indigo-600">₹{selectedItem.rental_price}/Day</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Deposit</p>
                                    <p className="font-bold text-slate-900">₹{selectedItem.security_deposit}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleApproval(selectedItem.id, 'approved')}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[12px] uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3"
                                >
                                    <FaCheck /> Approve Item
                                </button>
                                <button
                                    onClick={() => handleApproval(selectedItem.id, 'rejected')}
                                    className="px-8 bg-rose-50 hover:bg-rose-100 text-rose-500 font-black text-[12px] uppercase tracking-[0.2em] py-5 rounded-2xl transition-all"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default AdminClothingApproval;
