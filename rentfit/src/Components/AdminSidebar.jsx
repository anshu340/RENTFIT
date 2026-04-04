import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    FaHome,
    FaUsers,
    FaHistory,
    FaSignOutAlt,
    FaCog,
    FaUserShield,
    FaTshirt
} from 'react-icons/fa';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Admin Dashboard', icon: FaHome, path: '/adminDashboard' },
        { name: 'User Management', icon: FaUsers, path: '/adminUsers' },
        { name: 'Global Activity', icon: FaHistory, path: '/adminActivity' },
        { name: 'Clothing Approval', icon: FaTshirt, path: '/adminClothingApproval' },
    ];

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="w-64 bg-white border border-gray-100 rounded-3xl flex flex-col h-fit m-6 shadow-md sticky top-6">
            <div className="p-6 border-b border-gray-100 text-center">
                <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-100">
                    <FaUserShield className="text-white text-3xl" />
                </div>
                <h1 className="text-lg font-bold text-gray-800">Admin Central</h1>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Super User</p>
            </div>

            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${active
                                ? 'bg-indigo-50 text-indigo-600 font-bold shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                        >
                            <Icon className={`text-lg ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
                            <span>{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-1.5">
                <Link
                    to="/adminDashboard"
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm ${location.pathname === '/adminSettings'
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <FaCog className={`text-lg ${location.pathname === '/adminSettings' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span>Settings</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-sm font-bold"
                >
                    <FaSignOutAlt className="text-lg" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
