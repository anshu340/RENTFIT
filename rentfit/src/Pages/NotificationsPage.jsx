import React, { useState, useEffect } from 'react';
import { IoMdNotifications, IoMdCheckmark, IoMdMore, IoMdSearch } from 'react-icons/io';
import { FaCommentAlt, FaBoxOpen, FaClock, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import notificationAxiosInstance from '../services/notificationAxiosInstance';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getDayGroup = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return 'Earlier';
};

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationAxiosInstance.get('');
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        // Optimistic UI Update
        const previousState = [...notifications];
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));

        try {
            await notificationAxiosInstance.patch(`${id}/read/`);
        } catch (error) {
            console.error("Error marking as read:", error);
            setNotifications(previousState); // Revert on failure
        }
    };

    const markAllAsRead = async () => {
        const previousState = [...notifications];
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));

        try {
            await notificationAxiosInstance.patch('read-all/');
        } catch (error) {
            console.error("Error marking all read:", error);
            setNotifications(previousState);
        }
    };

    const getTypeConfig = (type) => {
        switch (type) {
            case 'chat': return { icon: <FaCommentAlt />, style: 'bg-blue-100 text-blue-600', label: 'Message' };
            case 'rental': return { icon: <FaBoxOpen />, style: 'bg-purple-100 text-purple-600', label: 'Rental' };
            case 'reminder': return { icon: <FaClock />, style: 'bg-orange-100 text-orange-600', label: 'Reminder' };
            case 'overdue': return { icon: <FaExclamationTriangle />, style: 'bg-red-100 text-red-600', label: 'Overdue' };
            case 'donation': return { icon: <FaBoxOpen />, style: 'bg-green-100 text-green-600', label: 'Donation' };
            case 'system': return { icon: <FaInfoCircle />, style: 'bg-gray-100 text-gray-600', label: 'System' };
            default: return { icon: <FaInfoCircle />, style: 'bg-gray-100 text-gray-600', label: 'Update' };
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'All') return true;
        if (filter === 'Unread') return !n.is_read;
        return n.notification_type === filter.toLowerCase();
    });

    const groupedNotifications = filteredNotifications.reduce((groups, n) => {
        const group = getDayGroup(n.created_at);
        if (!groups[group]) groups[group] = [];
        groups[group].push(n);
        return groups;
    }, {});

    const filters = ['All', 'Unread', 'Chat', 'Rental', 'Reminder', 'Overdue'];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            All Notifications
                            <span className="text-sm font-bold px-3 py-1 bg-purple-100 text-purple-600 rounded-full">
                                {notifications.filter(n => !n.is_read).length} New
                            </span>
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium">Stay updated with your rental activity</p>
                    </div>
                    {notifications.some(n => !n.is_read) && (
                        <button
                            onClick={markAllAsRead}
                            className="bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
                        >
                            <IoMdCheckmark /> Mark All as Read
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-8 items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-xl text-sm font-black transition-all duration-200 ${filter === f
                                    ? (f === 'Overdue' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white')
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                    <div className="ml-auto px-4 text-gray-400">
                        <IoMdSearch size={20} />
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        <p className="text-gray-500 mt-4 font-bold">Fetching your updates...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm mt-8">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <IoMdNotifications size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">You're all caught up!</h2>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto">
                            Check back later for new rental activity and messages.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {['Today', 'Yesterday', 'Earlier'].map(group => (
                            groupedNotifications[group] && (
                                <div key={group}>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 px-2">
                                        {group}
                                    </h3>
                                    <div className="grid gap-3">
                                        {groupedNotifications[group].map((n) => {
                                            const config = getTypeConfig(n.notification_type);
                                            const isOverdue = n.notification_type === 'overdue';
                                            return (
                                                <div
                                                    key={n.id}
                                                    className={`group relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md ${!n.is_read ? 'bg-indigo-50/10' : ''
                                                        } ${isOverdue ? 'border-l-4 border-l-red-500 bg-red-50/20' : ''}`}
                                                >
                                                    <div className="flex gap-4">
                                                        {/* Icon/Profile */}
                                                        <div className="flex-shrink-0">
                                                            {n.notification_type === 'chat' && n.sender_profile_image ? (
                                                                <img
                                                                    src={n.sender_profile_image}
                                                                    alt=""
                                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                                />
                                                            ) : (
                                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${config.style}`}>
                                                                    {config.icon}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${config.style} bg-opacity-10`}>
                                                                        {config.label}
                                                                    </span>
                                                                    {!n.is_read && (
                                                                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs font-bold text-gray-400">
                                                                    {formatTime(n.created_at)}
                                                                </span>
                                                            </div>

                                                            <p className={`text-sm leading-relaxed mb-3 ${!n.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                                                                {n.notification_type === 'chat' ? (
                                                                    <>
                                                                        <span className="text-gray-900">{n.sender_name || 'Someone'}</span>
                                                                        <span className="text-gray-500 ml-1">sent you a message</span>
                                                                    </>
                                                                ) : n.message}
                                                            </p>

                                                            {!n.is_read && (
                                                                <button
                                                                    onClick={() => markAsRead(n.id)}
                                                                    className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
                                                                >
                                                                    <IoMdCheckmark /> Mark as Read
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Context Menu */}
                                                        <button className="text-gray-300 hover:text-gray-500 transition-colors h-fit opacity-0 group-hover:opacity-100 px-2 py-1">
                                                            <IoMdMore size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default NotificationsPage;
