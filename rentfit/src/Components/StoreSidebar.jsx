import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import {
    FaHome,
    FaBox,
    FaHeart,
    FaMapMarkerAlt,
    FaQuestionCircle,
    FaFileAlt,
    FaCheckCircle,
    FaTshirt,
    FaSignOutAlt,
    FaCog,
    FaStore,
    FaComments
} from 'react-icons/fa';

const StoreSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [storeInfo, setStoreInfo] = useState({
        storeName: "",
        storeImage: "",
    });

    const menuItems = [
        { name: 'Dashboard', icon: FaHome, path: '/storeDashboard' },
        { name: 'Verify Listings', icon: FaCheckCircle, path: '/myClothingItems' },
        { name: 'List Clothes', icon: FaTshirt, path: '/addClothingItem' },
        { name: 'Rental Management', icon: FaBox, path: '/rentmanagement' },
        { name: 'Messages', icon: FaComments, path: '/chat' },
        { name: 'Donations', icon: FaHeart, path: '/storedonations' },
        { name: 'Shop Locations', icon: FaMapMarkerAlt, path: '/storeProfile' },
        { name: 'User Support', icon: FaQuestionCircle, path: null },
        { name: 'Reports', icon: FaFileAlt, path: null },
    ];

    useEffect(() => {
        const fetchStoreProfile = async () => {
            try {
                const response = await axiosInstance.get("stores/profile/");
                const data = response.data?.data || response.data;
                setStoreInfo({
                    storeName: data.store_name || "My Store",
                    storeImage: data.store_logo_url || data.store_logo || "",
                });
            } catch (error) {
                console.error("Error fetching sidebar profile:", error);
            }
        };
        fetchStoreProfile();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const isActive = (path) => {
        if (!path) return false;
        return location.pathname === path;
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {storeInfo.storeImage ? (
                            <img src={storeInfo.storeImage} alt="Store Logo" className="w-full h-full object-cover" />
                        ) : (
                            <FaStore className="text-white text-xl" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-gray-800 truncate">{storeInfo.storeName}</h1>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.name}
                            onClick={() => {
                                if (item.path) {
                                    navigate(item.path);
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${active
                                ? 'bg-purple-50 text-purple-600 font-bold shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Icon className={`text-base ${active ? 'text-purple-600' : 'text-gray-400'}`} />
                            <span>{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-gray-100 space-y-1">
                <Link
                    to="/storeProfile"
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${location.pathname === '/storeProfile'
                        ? 'bg-purple-50 text-purple-600 font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <FaCog className={`text-base ${location.pathname === '/storeProfile' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span>Settings</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                    <FaSignOutAlt className="text-base" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default StoreSidebar;
