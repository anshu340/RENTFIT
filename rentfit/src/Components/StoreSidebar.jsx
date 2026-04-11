import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import {
    FaHome,
    FaBox,
    FaHeart,
    FaMapMarkerAlt,
    FaFileAlt,
    FaCheckCircle,
    FaTshirt,
    FaSignOutAlt,
    FaCog,
    FaStore,
    FaComments,
    FaExclamationTriangle,
    FaShieldAlt
} from 'react-icons/fa';

const StoreSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: FaHome, path: '/storeDashboard' },
        { name: 'Verify Listings', icon: FaCheckCircle, path: '/myClothingItems' },
        { name: 'List Clothes', icon: FaTshirt, path: '/addClothingItem' },
        { name: 'Rental Management', icon: FaBox, path: '/rentmanagement' },
        { name: 'Messages', icon: FaComments, path: '/chat' },
        { name: 'Donations', icon: FaHeart, path: '/storedonations' },
        { name: 'Damage Reports', icon: FaExclamationTriangle, path: '/damaged-items' },
        { name: 'Shop Locations', icon: FaMapMarkerAlt, path: '/storeLocation' },
        { name: 'Reports', icon: FaFileAlt, path: '/reports' },
        { name: 'Privacy & Security', icon: FaShieldAlt, path: '/privacy-security' },
    ];


    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
    };

    const isActive = (path) => {
        if (!path) return false;
        return location.pathname === path;
    };

    return (
        <div className="w-60 bg-white border border-gray-100 rounded-3xl flex flex-col h-fit m-6 shadow-md">

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
