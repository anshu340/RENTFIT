import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import AdminSidebar from '../Components/AdminSidebar';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { FaUser, FaPhone, FaCamera, FaSave, FaShieldAlt } from 'react-icons/fa';

const AdminSettings = () => {
    const [profile, setProfile] = useState({
        name: '',
        phone: '',
        email: '',
        profile_image: null,
        profile_image_url: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosInstance.get('accounts/admin/profile/');
                const data = response.data;
                setProfile({
                    name: data.name || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    profile_image_url: data.profile_image_url || data.profile_image || '',
                    profile_image: null
                });
            } catch (error) {
                console.error("Error fetching admin profile:", error);
                setMessage({ text: 'Failed to load profile data.', type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'profile_image') {
            setProfile(prev => ({ ...prev, profile_image: files[0] }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ text: '', type: '' });

        const formData = new FormData();
        formData.append('name', profile.name);
        formData.append('phone', profile.phone);
        if (profile.profile_image) {
            formData.append('profile_image', profile.profile_image);
        }

        try {
            const response = await axiosInstance.patch('accounts/admin/profile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            // Update local state with new data
            const updatedData = response.data.data;
            setProfile(prev => ({
                ...prev,
                name: updatedData.name,
                phone: updatedData.phone,
                profile_image_url: updatedData.profile_image_url || updatedData.profile_image,
                profile_image: null
            }));
        } catch (error) {
            console.error("Error updating admin profile:", error);
            setMessage({ text: error.response?.data?.message || 'Failed to update profile.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-bold">Loading Settings...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                            <p className="text-slate-500 font-medium">Manage your administrator profile information.</p>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'} font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4`}>
                                <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                {message.text}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Profile Card */}
                            <div className="lg:col-span-1">
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl relative transition-transform group-hover:scale-[1.02]">
                                            {profile.profile_image ? (
                                                <img 
                                                    src={URL.createObjectURL(profile.profile_image)} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : profile.profile_image_url ? (
                                                <img 
                                                    src={profile.profile_image_url} 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                                                    <FaUser size={48} />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl cursor-pointer hover:bg-indigo-700 shadow-lg transition-all hover:scale-110 border-4 border-white">
                                            <FaCamera size={16} />
                                            <input 
                                                type="file" 
                                                name="profile_image" 
                                                className="hidden" 
                                                onChange={handleChange} 
                                                accept="image/*" 
                                            />
                                        </label>
                                    </div>
                                    <div className="mt-6">
                                        <h2 className="text-xl font-black text-slate-900">{profile.name || 'Administrator'}</h2>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Super User</p>
                                    </div>
                                    <div className="mt-8 w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email Address</label>
                                        <p className="text-sm font-bold text-slate-600 truncate">{profile.email}</p>
                                    </div>
                                    <p className="mt-4 text-[10px] text-slate-400 font-bold italic flex items-center gap-1">
                                        <FaShieldAlt className="text-indigo-400" /> Managed by System Security
                                    </p>
                                </div>
                            </div>

                            {/* Settings Form */}
                            <div className="lg:col-span-2">
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                    <FaUser className="text-indigo-500" /> Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={profile.name}
                                                    onChange={handleChange}
                                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                                                    placeholder="Enter your full name"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                    <FaPhone className="text-indigo-500" /> Phone Number
                                                </label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={profile.phone}
                                                    onChange={handleChange}
                                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-50 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                {isSaving ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <FaSave />
                                                )}
                                                Update Profile
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminSettings;
