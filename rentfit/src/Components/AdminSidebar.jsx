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
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 shadow-xl">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaUserShield className="text-white text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold truncate">Admin Central</h1>
                        <p className="text-xs text-slate-400 capitalize">{localStorage.getItem('role')}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                <p className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Overview</p>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${active
                                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-900/50 transform scale-[1.02]'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Icon className={`text-base ${active ? 'text-white' : 'text-slate-500'}`} />
                            <span>{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-slate-800 space-y-1">
                <Link
                    to="/adminDashboard"
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm ${location.pathname === '/adminSettings'
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-400 hover:bg-slate-800'
                        }`}
                >
                    <FaCog className="text-base text-slate-500" />
                    <span>Settings</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-sm font-bold"
                >
                    <FaSignOutAlt className="text-base" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
