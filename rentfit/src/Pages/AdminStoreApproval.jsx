import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import AdminSidebar from '../Components/AdminSidebar';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { FaCheck, FaTimes, FaEye, FaStore, FaIdCard, FaBuilding } from 'react-icons/fa';

const AdminStoreApproval = () => {
    const [pendingStores, setPendingStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedStore, setSelectedStore] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchPendingStores();
    }, []);

    const fetchPendingStores = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('accounts/admin/stores/pending/');
            setPendingStores(response.data);
        } catch (error) {
            console.error("Error fetching pending stores:", error);
            setMessage({ type: 'error', text: 'Failed to load pending store applications.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproval = async (id, statusAction) => {
        try {
            await axiosInstance.patch(`accounts/admin/stores/${id}/verify/`, { status: statusAction });
            setMessage({
                type: 'success',
                text: `Store ${statusAction === 'approved' ? 'approved' : 'rejected'} successfully.`
            });
            fetchPendingStores();
            if (showDetailModal) setShowDetailModal(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error(`Error ${statusAction}ing store:`, error);
            setMessage({ type: 'error', text: `Failed to process approval.` });
        }
    };

    const handleViewDetail = (store) => {
        setSelectedStore(store);
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
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Store Applications</h1>
                                <p className="text-slate-500 font-medium">Review and verify new store verification documents (KYC).</p>
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
                                <p className="text-slate-500 font-bold">Loading pending applications...</p>
                            </div>
                        ) : pendingStores.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center px-6">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                                    <FaStore className="text-slate-300 text-4xl" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Queue Clear!</h2>
                                <p className="text-slate-500 font-medium max-w-md mx-auto">There are no pending store verifications awaiting review.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingStores.map((store) => (
                                    <div key={store.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                                        
                                        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                                {store.store_logo_url ? (
                                                    <img src={store.store_logo_url} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                                                ) : (
                                                    <FaStore className="text-xl" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg text-slate-900 truncate tracking-tight">{store.store_name}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{store.city}</p>
                                            </div>
                                        </div>

                                        <div className="p-6 flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <FaIdCard className="text-slate-300" />
                                                <span className="text-sm font-medium text-slate-600 truncate">{store.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FaBuilding className="text-slate-300" />
                                                <span className="text-sm font-medium text-slate-600 truncate">{store.email}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                                            <button
                                                onClick={() => handleViewDetail(store)}
                                                className="flex-1 bg-white hover:bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] py-3 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <FaEye /> Review KFC
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* KYC Detail Modal */}
            {showDetailModal && selectedStore && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        
                        {/* Documents View Section */}
                        <div className="w-full md:w-3/5 bg-slate-100 p-8 overflow-y-auto space-y-8 relative">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="absolute top-6 left-6 w-10 h-10 bg-white/90 backdrop-blur-md text-slate-900 rounded-full flex items-center justify-center shadow-xl md:hidden z-10"
                            >
                                <FaTimes />
                            </button>
                            
                            {/* Citizenship */}
                            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <h4 className="font-black text-sm text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <FaIdCard className="text-indigo-500" /> Citizenship Document
                                    </h4>
                                </div>
                                <div className="h-64 bg-slate-50 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center group relative cursor-pointer" onClick={() => window.open(selectedStore.citizenship_image_url || selectedStore.citizenship_image, '_blank')}>
                                    {(selectedStore.citizenship_image_url || selectedStore.citizenship_image) ? (
                                        <>
                                            <img 
                                                src={selectedStore.citizenship_image_url || selectedStore.citizenship_image} 
                                                className="w-full h-full object-contain" 
                                                alt="Citizenship" 
                                            />
                                            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white font-black text-xs uppercase tracking-widest px-4 py-2 bg-slate-900/80 rounded-xl backdrop-blur-sm">Click to Enlarge</span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Image Provided</p>
                                    )}
                                </div>
                            </div>

                            {/* Business Document */}
                            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <h4 className="font-black text-sm text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <FaBuilding className="text-emerald-500" /> Business Validations
                                    </h4>
                                </div>
                                <div className="h-64 bg-slate-50 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center group relative cursor-pointer" onClick={() => window.open(selectedStore.business_card_image_url || selectedStore.business_card_image, '_blank')}>
                                    {(selectedStore.business_card_image_url || selectedStore.business_card_image) ? (
                                        <>
                                            <img 
                                                src={selectedStore.business_card_image_url || selectedStore.business_card_image} 
                                                className="w-full h-full object-contain" 
                                                alt="Business Card" 
                                            />
                                            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white font-black text-xs uppercase tracking-widest px-4 py-2 bg-slate-900/80 rounded-xl backdrop-blur-sm">Click to Enlarge</span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Image Provided</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="w-full md:w-2/5 p-8 md:p-12 overflow-y-auto flex flex-col">
                            <div className="flex justify-end items-start mb-6 hidden md:flex">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{selectedStore.store_name}</h2>
                                <p className="text-slate-500 font-medium text-sm">Reviewing partner application</p>
                            </div>

                            <div className="space-y-6 mb-10 flex-1">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Founder / Owner Name</p>
                                    <p className="font-bold text-slate-900">{selectedStore.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Email</p>
                                    <p className="font-bold text-slate-900">{selectedStore.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location Details</p>
                                    <p className="font-bold text-slate-900">{selectedStore.store_address}, {selectedStore.city}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined Date</p>
                                    <p className="font-bold text-slate-900">{new Date(selectedStore.date_joined).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mt-auto">
                                <button
                                    onClick={() => handleApproval(selectedStore.id, 'approved')}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[12px] uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3"
                                >
                                    <FaCheck /> Verify & Approve Partner
                                </button>
                                <button
                                    onClick={() => handleApproval(selectedStore.id, 'rejected')}
                                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-500 font-black text-[12px] uppercase tracking-[0.2em] py-5 rounded-2xl transition-all flex items-center justify-center gap-3"
                                >
                                    <FaTimes /> Reject Application
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

export default AdminStoreApproval;
