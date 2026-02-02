import React, { useState, useEffect } from 'react';
import { IoMdNotifications, IoMdCheckmark, IoMdClose } from 'react-icons/io';
import notificationAxiosInstance from '../services/notificationAxiosInstance';

const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const NotificationDropdown = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await notificationAxiosInstance.get('');
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await notificationAxiosInstance.patch(`${id}/read/`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationAxiosInstance.patch('read-all/');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'rental': return 'bg-blue-100 text-blue-600';
            case 'donation': return 'bg-green-100 text-green-600';
            case 'system': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Notifications</h3>
                <div className="flex gap-2">
                    {notifications.some(n => !n.is_read) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            Mark all read
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <IoMdClose size={18} />
                    </button>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2 text-sm">Loading...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 transition-colors relative group ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notification.is_read ? 'bg-blue-600' : 'bg-transparent'}`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${getTypeStyles(notification.notification_type)}`}>
                                                {notification.notification_type}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                {formatTime(notification.created_at)}
                                            </span>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${!notification.is_read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                            {notification.message}
                                        </p>
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline"
                                            >
                                                <IoMdCheckmark size={12} /> Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <IoMdNotifications className="text-gray-400" size={20} />
                        </div>
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                    </div>
                )}
            </div>
            {notifications.length > 0 && (
                <div className="p-3 border-top border-gray-50 text-center bg-gray-50/30">
                    <p className="text-[10px] text-gray-400 font-medium">Showing latest 20 notifications</p>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
