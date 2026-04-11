import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import AdminSidebar from '../Components/AdminSidebar';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { 
    FaTshirt, 
    FaHandHoldingHeart, 
    FaClock, 
    FaInfoCircle, 
    FaUser, 
    FaBell, 
    FaExclamationTriangle,
    FaCheckCircle
} from 'react-icons/fa';

const AdminActivity = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('notifications/admin/');
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching admin activity feed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getIcon = (type) => {
        switch (type) {
            case 'rental': return <FaTshirt className="text-indigo-500" />;
            case 'donation': return <FaHandHoldingHeart className="text-rose-500" />;
            case 'system': return <FaInfoCircle className="text-blue-500" />;
            case 'overdue': return <FaExclamationTriangle className="text-amber-500" />;
            default: return <FaBell className="text-slate-400" />;
        }
    };

    const getBadgeColor = (type) => {
        switch (type) {
            case 'rental': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'donation': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'system': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'overdue': return 'bg-amber-50 text-amber-700 border-amber-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto space-y-8 text-left">
                        {/* Header */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Activity Feed</h1>
                                <p className="text-slate-500 font-medium">Global log of all platform events and user notifications.</p>
                            </div>
                            <button 
                                onClick={fetchNotifications}
                                className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                Refresh Feed
                            </button>
                        </div>

                        {/* Activity List */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-50">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <FaClock className="text-indigo-500" /> Recent Events
                                </h2>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <div className="p-20 text-center flex flex-col items-center gap-4 text-slate-400">
                                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="font-black uppercase tracking-widest text-[10px]">Syncing Feed...</span>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-20 text-center flex flex-col items-center gap-4 text-slate-400">
                                        <FaCheckCircle size={40} className="text-emerald-500/20" />
                                        <span className="font-black uppercase tracking-widest text-[10px]">No activity logs found.</span>
                                    </div>
                                ) : (
                                    notifications.map((note) => (
                                        <div key={note.id} className="p-8 hover:bg-slate-50 transition-all group border-l-4 border-transparent hover:border-indigo-500">
                                            <div className="flex gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm border overflow-hidden ${getBadgeColor(note.notification_type)}`}>
                                                    {note.image_url ? (
                                                        <img 
                                                            src={note.image_url} 
                                                            alt="activity" 
                                                            className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" 
                                                        />
                                                    ) : (
                                                        getIcon(note.notification_type)
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getBadgeColor(note.notification_type)}`}>
                                                            {note.notification_type}
                                                        </span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <FaClock /> {formatDate(note.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-700 font-bold leading-relaxed">{note.message}</p>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <FaUser size={10} /> Recipient: {note.user || 'System'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
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
