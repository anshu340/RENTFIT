import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
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
    FaComments,
    FaShieldAlt,
    FaSignOutAlt
} from 'react-icons/fa';

const DashboardSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
    };

    const navItemClasses = (path) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive(path)
            ? 'text-purple-600 bg-purple-50 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50'
        }`;

    return (
        <aside className="w-60 bg-white border border-gray-100 rounded-3xl p-4 h-fit ml-4 mt-6 shadow-md flex flex-col justify-between" style={{ minHeight: 'calc(100vh - 120px)' }}>
            {/* Menu Items */}
            <div className="space-y-2">
                <nav className="space-y-2">
                    <Link to="/dashboard" className={navItemClasses('/dashboard')}>
                        <FaTachometerAlt className="text-lg" />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/browseClothes" className={navItemClasses('/browseClothes')}>
                        <FaTshirt className="text-lg" />
                        <span>Browse Clothes</span>
                    </Link>
                    <Link to="/myrentals" className={navItemClasses('/myrentals')}>
                        <FaShoppingBag className="text-lg" />
                        <span>My Rentals</span>
                    </Link>
                    <Link to="/wishlist" className={navItemClasses('/wishlist')}>
                        <FaHeart className="text-lg" />
                        <span>Wishlist</span>
                    </Link>
                    <Link to="/donate" className={navItemClasses('/donate')}>
                        <FaHandHoldingHeart className="text-lg" />
                        <span>Donate Clothes</span>
                    </Link>
                    <Link to="/mydonations" className={navItemClasses('/mydonations')}>
                        <FaBox className="text-lg" />
                        <span>My Donations</span>
                    </Link>
                    <Link to="/chat" className={navItemClasses('/chat')}>
                        <FaComments className="text-lg" />
                        <span>Messages</span>
                    </Link>
                    {role === 'Customer' && (
                        <Link to="/nearbyStores" className={navItemClasses('/nearbyStores')}>
                            <FaMapMarkerAlt className="text-lg" />
                            <span>Nearby Shops</span>
                        </Link>
                    )}
                    <Link to="/myreviews" className={navItemClasses('/myreviews')}>
                        <FaStar className="text-lg" />
                        <span>My Reviews</span>
                    </Link>
                    <Link to="/profile" className={navItemClasses('/profile')}>
                        <FaUser className="text-lg" />
                        <span>Profile</span>
                    </Link>
                    <Link to="/privacy-security" className={navItemClasses('/privacy-security')}>
                        <FaShieldAlt className="text-lg text-blue-500" />
                        <span>Privacy & Security</span>
                    </Link>
                </nav>
            </div>

            {/* Logout Button */}
            <div className="pt-4 mt-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium group"
                >
                    <FaSignOutAlt className="text-lg group-hover:scale-110 transition-transform" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
