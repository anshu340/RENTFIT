import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaTshirt,
    FaHeart,
    FaHandHoldingHeart,
    FaMapMarkerAlt,
    FaStar,
    FaUser,
    FaShoppingBag,
    FaBox,
    FaComments
} from 'react-icons/fa';

const DashboardSidebar = () => {
    const navigate = useNavigate();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 p-6">
            {/* Menu Items */}
            <nav className="space-y-2">
                <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-purple-600 bg-purple-50 rounded-lg font-medium">
                    <FaTachometerAlt className="text-lg" />
                    <span>Dashboard</span>
                </a>
                <a href="/browseClothes" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <FaTshirt className="text-lg" />
                    <span>Browse Clothes</span>
                </a>
                <a href="/myrentals" onClick={(e) => { e.preventDefault(); navigate('/myrentals'); }} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <FaShoppingBag className="text-lg" />
                    <span>My Rentals</span>
                </a>
                <a href="/wishlist" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <FaHeart className="text-lg" />
                    <span>Wishlist</span>
                </a>
                <a href="/donate" onClick={(e) => { e.preventDefault(); navigate('/donate'); }} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <FaHandHoldingHeart className="text-lg" />
                    <span>Donate Clothes</span>
                </a>
                <a href="/mydonations" onClick={(e) => { e.preventDefault(); navigate('/mydonations'); }} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <FaBox className="text-lg" />
                    <span>My Donations</span>
                </a>
                <a href="/chat" onClick={(e) => { e.preventDefault(); navigate('/chat'); }} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <FaComments className="text-lg" />
                    <span>Messages</span>
                </a>
                <a href="/nearbyStores" onClick={(e) => { e.preventDefault(); navigate('/nearbyStores'); }} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <FaMapMarkerAlt className="text-lg" />
                    <span>Nearby Shops</span>
                </a>
                <a href="/myreviews" onClick={(e) => { e.preventDefault(); navigate('/myreviews'); }} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <FaStar className="text-lg" />
                    <span>My Reviews</span>
                </a>
                <a href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); }} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <FaUser className="text-lg" />
                    <span>Profile</span>
                </a>
            </nav>
        </aside>
    );
};

export default DashboardSidebar;
