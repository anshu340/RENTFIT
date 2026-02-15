import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import AdminSidebar from '../Components/AdminSidebar';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import Alert from '../Components/Alert';
import {
    FaSearch,
    FaUserSlash,
    FaCheckCircle,
    FaFilter,
    FaStore,
    FaUserGraduate,
    FaUserShield
} from 'react-icons/fa';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [alert, setAlert] = useState({ message: '', type: '' });

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('accounts/admin/users/');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            setAlert({ message: "Failed to fetch users list.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeactivate = async (userId) => {
        try {
            const response = await axiosInstance.patch(`accounts/admin/users/${userId}/deactivate/`);
            setAlert({ message: response.data.message, type: "success" });
            fetchUsers(); // Refresh list
        } catch (error) {
            setAlert({ message: "Failed to update user status.", type: "error" });
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role) => {
        switch (role) {
            case 'Admin': return <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-200 flex items-center gap-1.5"><FaUserShield /> Admin</span>;
            case 'Store': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 flex items-center gap-1.5"><FaStore /> Store</span>;
            default: return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 flex items-center gap-1.5"><FaUserGraduate /> Customer</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
                                <p className="text-slate-500 font-medium">Control platform access and review user accounts.</p>
                            </div>
                            <div className="text-sm font-bold text-slate-400">Total Users: {users.length}</div>
                        </div>

                        {/* Search & Filters */}
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-medium transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 px-4 bg-slate-50 rounded-2xl border-2 border-transparent">
                                <FaFilter className="text-slate-400" />
                                <select
                                    className="bg-transparent border-none py-4 text-sm font-bold text-slate-600 focus:ring-0 cursor-pointer"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="All">All Roles</option>
                                    <option value="Admin">Admins</option>
                                    <option value="Store">Stores</option>
                                    <option value="Customer">Customers</option>
                                </select>
                            </div>
                        </div>

                        {/* User Table */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">User Information</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-medium">
                                    {isLoading ? (
                                        <tr><td colSpan="4" className="text-center py-20 text-slate-400 font-bold">Loading system users...</td></tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-20 text-slate-400 font-bold">No users found matching your search.</td></tr>
                                    ) : (
                                        filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 border border-slate-200 uppercase">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{user.name}</div>
                                                            <div className="text-sm text-slate-400">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {getRoleBadge(user.role)}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    {user.is_active ? (
                                                        <span className="inline-flex items-center gap-1.5 text-emerald-500 font-bold text-sm">
                                                            <FaCheckCircle /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold text-sm italic">
                                                            <FaUserSlash /> Deactivated
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleDeactivate(user.id)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${user.is_active
                                                            ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white'
                                                            : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                                    >
                                                        {user.is_active ? 'Deactivate' : 'Reactivate'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
            <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: '', type: '' })} />
        </div>
    );
};

export default AdminUserManagement;
