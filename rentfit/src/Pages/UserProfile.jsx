import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import DashboardSidebar from "../Components/DashboardSidebar";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Alert from "../Components/Alert";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaCamera, FaRulerCombined, FaVenusMars } from "react-icons/fa";

const UserProfile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [alert, setAlert] = useState({ message: "", type: "" });

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        address: "",
        city: "",
        gender: "",
        preferred_clothing_size: "",
        profile_image: null,
        profile_image_url: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get("customers/profile/");
            const data = response.data?.data || response.data;
            setFormData({
                full_name: data.full_name || "",
                email: data.email || "",
                phone_number: data.phone_number || "",
                address: data.address || "",
                city: data.city || "",
                gender: data.gender || "",
                preferred_clothing_size: data.preferred_clothing_size || "",
                profile_image_url: data.profile_image_url || data.profile_image || "",
                profile_image: null
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
            setAlert({ message: "Failed to load profile", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = new FormData();
            // We only send fields that are allowed in CustomerUpdateSerializer
            const updateFields = ['full_name', 'phone_number', 'address', 'city', 'gender', 'preferred_clothing_size'];

            updateFields.forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });

            if (formData.profile_image) {
                data.append('profile_image', formData.profile_image);
            }

            await axiosInstance.patch("customers/profile/", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setAlert({ message: "Profile updated successfully!", type: "success" });
            fetchProfile(); // Refresh to get the latest data and reset the file input
        } catch (error) {
            console.error("Error saving profile:", error);
            setAlert({ message: error.response?.data?.message || "Failed to save profile", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex">
                <DashboardSidebar />
                <div className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                                <p className="text-gray-500 mt-1">Manage your personal information and preferences</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-purple-100 disabled:opacity-50"
                            >
                                {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaSave />}
                                Save Changes
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Avatar & Summary */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                                    <div className="relative w-32 h-32 mx-auto mb-4 group">
                                        <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-md relative">
                                            {formData.profile_image_url || formData.profile_image ? (
                                                <img
                                                    src={formData.profile_image ? URL.createObjectURL(formData.profile_image) : formData.profile_image_url}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-purple-50">
                                                    <FaUser size={48} className="text-purple-200" />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute bottom-1 right-1 p-2 bg-purple-600 text-white rounded-full cursor-pointer hover:bg-purple-700 shadow-lg transition-transform hover:scale-110 border-2 border-white">
                                            <FaCamera size={14} />
                                            <input type="file" name="profile_image" className="hidden" onChange={handleChange} accept="image/*" />
                                        </label>
                                    </div>
                                    <h2 className="font-bold text-gray-800 text-xl">{formData.full_name || "User"}</h2>
                                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-1">
                                        <FaEnvelope className="text-xs" />
                                        <span>{formData.email}</span>
                                    </div>
                                    <div className="mt-4 inline-block px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Customer
                                    </div>
                                </div>

                                {/* Quick view of preferences */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                    <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-2 flex items-center gap-2">
                                        <FaRulerCombined className="text-purple-500 text-sm" /> Preferences
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-xl text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Size</p>
                                            <p className="text-sm font-bold text-gray-700">{formData.preferred_clothing_size || "N/A"}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Gender</p>
                                            <p className="text-sm font-bold text-gray-700">{formData.gender || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Detailed Info Form */}
                            <div className="lg:col-span-2">
                                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                                    <form onSubmit={handleSave} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                    <FaUser className="text-purple-500" /> Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="full_name"
                                                    value={formData.full_name}
                                                    onChange={handleChange}
                                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                    <FaPhone className="text-purple-500" /> Phone Number
                                                </label>
                                                <input
                                                    type="text"
                                                    name="phone_number"
                                                    value={formData.phone_number}
                                                    onChange={handleChange}
                                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                    <FaVenusMars className="text-purple-500" /> Gender
                                                </label>
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition appearance-none"
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                    <FaRulerCombined className="text-purple-500" /> Preferred Size
                                                </label>
                                                <select
                                                    name="preferred_clothing_size"
                                                    value={formData.preferred_clothing_size}
                                                    onChange={handleChange}
                                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition appearance-none"
                                                >
                                                    <option value="">Select Size</option>
                                                    <option value="XS">XS</option>
                                                    <option value="S">S</option>
                                                    <option value="M">M</option>
                                                    <option value="L">L</option>
                                                    <option value="XL">XL</option>
                                                    <option value="XXL">XXL</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-purple-500" /> City
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                                placeholder="e.g. Kathmandu"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-purple-500" /> Full Address
                                            </label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                rows="3"
                                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                                placeholder="e.g. New Road, Sector 4"
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-gray-50 text-xs text-gray-400 italic">
                                            * Email address cannot be changed for security reasons.
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ message: "", type: "" })}
            />
        </>
    );
};

export default UserProfile;
