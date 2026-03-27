import React, { useState, useEffect } from "react";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import DashboardSidebar from '../Components/DashboardSidebar.jsx';
import StoreSidebar from '../Components/StoreSidebar';
import { FaLock, FaUserShield, FaMapMarkerAlt, FaBell, FaSignOutAlt, FaTrashAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PrivacySecurity = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [alert, setAlert] = useState({ message: "", type: "" });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Password State
    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: ""
    });

    // Privacy Settings State
    const [privacySettings, setPrivacySettings] = useState({
        profile_visibility: true,
        location_sharing: true,
        recommendations_enabled: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get("accounts/profile/");
            const data = response.data?.data || response.data;
            setPrivacySettings({
                profile_visibility: data.profile_visibility ?? true,
                location_sharing: data.location_sharing ?? true,
                recommendations_enabled: data.recommendations_enabled ?? true
            });
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setAlert({ message: "New passwords do not match", type: "error" });
            return;
        }

        setIsSaving(true);
        try {
            await axiosInstance.post("accounts/user/change-password/", passwordData);
            setAlert({ message: "Password updated successfully!", type: "success" });
            setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Failed to update password";
            setAlert({ message: errorMsg, type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrivacyToggle = async (key) => {
        const updatedSettings = { ...privacySettings, [key]: !privacySettings[key] };
        setPrivacySettings(updatedSettings);

        try {
            await axiosInstance.put("accounts/user/privacy/", updatedSettings);
            // Subtle feedback could be added here
        } catch (error) {
            console.error("Error updating privacy:", error);
            // Rollback on error
            setPrivacySettings(privacySettings);
            setAlert({ message: "Failed to update privacy settings", type: "error" });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await axiosInstance.delete("accounts/user/delete-account/");
            localStorage.clear();
            navigate("/login");
        } catch (error) {
            setAlert({ message: "Failed to delete account", type: "error" });
            setShowDeleteModal(false);
        }
    };

    const handleLogoutAll = async () => {
        // Implement logout all if supported by backend, otherwise just local logout
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex">
                {role === "Store" ? <StoreSidebar /> : <DashboardSidebar />}
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy & Security</h1>
                            <p className="text-gray-500">Manage your account security and control your privacy preferences.</p>
                        </header>

                        {alert.message && (
                            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-slideDown ${alert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {alert.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                <span className="font-medium">{alert.message}</span>
                                <button onClick={() => setAlert({ message: "", type: "" })} className="ml-auto hover:opacity-70">&times;</button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                            {/* Change Password Card */}
                            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm shadow-purple-50">
                                        <FaLock size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Security Credentials</h2>
                                        <p className="text-sm text-gray-500">Update your account password regularly to stay safe.</p>
                                    </div>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Current Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                                                placeholder="••••••••"
                                                value={passwordData.old_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">New Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                                                placeholder="••••••••"
                                                value={passwordData.new_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                                                placeholder="••••••••"
                                                value={passwordData.confirm_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-8 py-3 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-50"
                                        >
                                            {isSaving ? "Updating..." : "Update Password"}
                                        </button>
                                    </div>
                                </form>
                            </section>

                            {/* Privacy Controls Card */}
                            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shadow-blue-50">
                                        <FaUserShield size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Privacy Preferences</h2>
                                        <p className="text-sm text-gray-500">Control how your information is shared and used.</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                                <FaUserShield />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">Profile Visibility</h3>
                                                <p className="text-xs text-gray-500">Make your profile discoverable to other users and stores.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handlePrivacyToggle('profile_visibility')}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${privacySettings.profile_visibility ? 'bg-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${privacySettings.profile_visibility ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                                                <FaMapMarkerAlt />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">Location Sharing</h3>
                                                <p className="text-xs text-gray-500">Allow location access to show stores near you in the "Nearby Shops" map.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handlePrivacyToggle('location_sharing')}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${privacySettings.location_sharing ? 'bg-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${privacySettings.location_sharing ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-amber-500 transition-colors">
                                                <FaBell />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">Store Recommendations</h3>
                                                <p className="text-xs text-gray-500">Receive personalized clothing and store recommendations based on your activity.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handlePrivacyToggle('recommendations_enabled')}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${privacySettings.recommendations_enabled ? 'bg-purple-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${privacySettings.recommendations_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Account Actions Section */}
                            <section className="bg-red-50/30 rounded-3xl p-8 border border-red-50 transition-all hover:bg-red-50/50">
                                <div className="flex items-center gap-3 mb-6 font-bold text-red-600">
                                    <FaExclamationTriangle />
                                    <h2>Advanced Account Actions</h2>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={handleLogoutAll}
                                        className="flex items-center gap-2 px-6 py-3 bg-white border border-red-100 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all shadow-sm"
                                    >
                                        <FaSignOutAlt /> Logout from all devices
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                                    >
                                        <FaTrashAlt /> Delete Account
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="relative bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-scaleIn">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6 drop-shadow-sm">
                                <FaExclamationTriangle size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Are you sure?</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                This action is permanent and cannot be undone. All your data, rentals, and profile information will be deleted.
                            </p>
                            <div className="flex w-full gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-slideDown { animation: slideDown 0.4s ease-out; }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
            `}} />
        </div>
    );
};

export default PrivacySecurity;
