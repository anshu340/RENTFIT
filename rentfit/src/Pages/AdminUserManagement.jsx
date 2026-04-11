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
    FaUserShield,
    FaTimes,
    FaCalendarAlt,
    FaPhone,
    FaMapMarkerAlt,
    FaEnvelope,
    FaInfoCircle
} from 'react-icons/fa';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [alert, setAlert] = useState({ message: '', type: '' });
    const [selectedUserDetail, setSelectedUserDetail] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        role: 'Customer',
        is_verified: true
    });

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

    const fetchUserDetail = async (userId) => {
        try {
            setLoadingDetail(true);
            const response = await axiosInstance.get(`accounts/admin/users/${userId}/`);
            setSelectedUserDetail(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching user detail:", error);
            setAlert({ message: "Failed to fetch user details.", type: "error" });
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            setLoadingAction(true);
            await axiosInstance.post('accounts/admin/users/', newUser);
            setAlert({ message: "User created successfully!", type: "success" });
            setIsAddModalOpen(false);
            setNewUser({ email: '', password: '', name: '', phone: '', role: 'Customer', is_verified: true });
            fetchUsers();
        } catch (error) {
            const errorMsg = error.response?.data?.email?.[0] || "Failed to create user.";
            setAlert({ message: errorMsg, type: "error" });
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDeactivate = async (e, userId) => {
        e.stopPropagation(); // Prevent modal from opening
        try {
            const response = await axiosInstance.patch(`accounts/admin/users/${userId}/deactivate/`);
            setAlert({ message: response.data.message, type: "success" });
            fetchUsers(); // Refresh list
        } catch (error) {
            setAlert({ message: "Failed to update user status.", type: "error" });
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("ARE YOU SURE? This is a HARD DELETE and cannot be undone. All data related to this user will be lost.")) return;
        
        try {
            setLoadingAction(true);
            await axiosInstance.delete(`accounts/admin/users/${userId}/`);
            setAlert({ message: "User permanently deleted.", type: "success" });
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            setAlert({ message: "Failed to delete user.", type: "error" });
        } finally {
            setLoadingAction(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

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
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-bold text-slate-400">Total Users: {users.length}</div>
                                <button 
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                >
                                    + Add User
                                </button>
                            </div>
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
                                            <tr 
                                                key={user.id} 
                                                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                                onClick={() => fetchUserDetail(user.id)}
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 border border-slate-200 uppercase overflow-hidden">
                                                            {user.profile_image_url || user.store_logo_url ? (
                                                                <img
                                                                    src={user.profile_image_url || user.store_logo_url}
                                                                    alt={user.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                user.name.charAt(0)
                                                            )}
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
                                                        onClick={(e) => handleDeactivate(e, user.id)}
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

            {/* User Detail Modal */}
            {isModalOpen && selectedUserDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                        {/* Modal Header */}
                        <div className="relative h-32 bg-indigo-600">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="absolute right-6 top-6 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
                            >
                                <FaTimes />
                            </button>
                            <div className="absolute -bottom-12 left-10">
                                <div className="w-28 h-28 bg-white p-2 rounded-3xl shadow-xl">
                                    <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center font-black text-3xl text-slate-400 border border-slate-100 uppercase overflow-hidden">
                                        {selectedUserDetail.profile_image_url || selectedUserDetail.store_logo_url ? (
                                            <img
                                                src={selectedUserDetail.profile_image_url || selectedUserDetail.store_logo_url}
                                                alt={selectedUserDetail.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            selectedUserDetail.name.charAt(0)
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="pt-16 pb-10 px-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900">{selectedUserDetail.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getRoleBadge(selectedUserDetail.role)}
                                        {selectedUserDetail.is_verified && (
                                            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px] font-black uppercase">Verified</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined On</div>
                                    <div className="flex items-center gap-2 text-slate-600 font-bold justify-end">
                                        <FaCalendarAlt className="text-indigo-500" />
                                        {new Date(selectedUserDetail.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Contact & Location */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                                        Contact Details
                                    </h3>
                                    <div className="space-y-4 text-left">
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                <FaEnvelope />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</div>
                                                <div className="text-slate-700 font-bold">{selectedUserDetail.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                <FaPhone />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</div>
                                                <div className="text-slate-700 font-bold">{selectedUserDetail.phone || 'Not Provided'}</div>
                                            </div>
                                        </div>
                                        {(selectedUserDetail.store_address || selectedUserDetail.city) && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                    <FaMapMarkerAlt />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</div>
                                                    <div className="text-slate-700 font-bold">
                                                        {selectedUserDetail.store_address || selectedUserDetail.city}
                                                        {selectedUserDetail.city && selectedUserDetail.store_address ? `, ${selectedUserDetail.city}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-4 border-t border-slate-50">
                                        <button 
                                            onClick={() => handleDeleteUser(selectedUserDetail.id)}
                                            disabled={loadingAction}
                                            className="w-full bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            {loadingAction ? 'Deleting...' : 'Permanently Delete User'}
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column: Stats & Meta */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                                        Platform Activity
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100 hover:border-indigo-200 transition-colors">
                                            <div className="text-2xl font-black text-slate-900">{selectedUserDetail.total_rentals}</div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rentals</div>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100 hover:border-indigo-200 transition-colors">
                                            <div className="text-2xl font-black text-slate-900">{selectedUserDetail.total_donations}</div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Donations</div>
                                        </div>
                                        {selectedUserDetail.role === 'Store' && (
                                            <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100 hover:border-indigo-200 transition-colors">
                                                <div className="text-2xl font-black text-slate-900">{selectedUserDetail.total_listings}</div>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Listings</div>
                                            </div>
                                        )}
                                    </div>

                                    {selectedUserDetail.store_description && (
                                        <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <FaInfoCircle /> Store Description
                                            </div>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed italic text-left">
                                                "{selectedUserDetail.store_description}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="px-10 pt-10 pb-4">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Create New User</h2>
                            <p className="text-slate-500 text-sm font-medium">Add a new customer or store account.</p>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-10 pt-4 space-y-4">
                            <div className="space-y-4 text-left">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Email</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Password</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Role</label>
                                        <select
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all appearance-none cursor-pointer"
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                                        >
                                            <option value="Customer">Customer</option>
                                            <option value="Store">Store</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Phone</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                                            value={newUser.phone}
                                            onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-6 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loadingAction}
                                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                >
                                    {loadingAction ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
