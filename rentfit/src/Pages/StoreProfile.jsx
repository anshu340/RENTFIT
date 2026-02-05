import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import StoreSidebar from "../Components/StoreSidebar";
import StoreLocationMap, { searchAddressAndCenter } from "../Components/StoreLocationMap";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Alert from "../Components/Alert";
import { FaStore, FaMapMarkerAlt, FaSave, FaCamera } from "react-icons/fa";

const StoreProfile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [alert, setAlert] = useState({ message: "", type: "" });
    const [locationChanged, setLocationChanged] = useState(false);

    const [formData, setFormData] = useState({
        store_name: "",
        owner_name: "",
        phone_number: "",
        store_address: "",
        city: "",
        store_description: "",
        latitude: null,
        longitude: null,
        store_logo: null,
        store_logo_url: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get("stores/profile/");
            const data = response.data?.data || response.data;
            setFormData({
                store_name: data.store_name || "",
                owner_name: data.owner_name || "",
                phone_number: data.phone_number || "",
                store_address: data.store_address || "",
                city: data.city || "",
                store_description: data.store_description || "",
                latitude: data.latitude,
                longitude: data.longitude,
                store_logo_url: data.store_logo_url || data.store_logo || "",
                store_logo: null
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

    const handleLocationSelect = (lat, lng) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setLocationChanged(true);
    };

    const handleLocateAddress = () => {
        const address = `${formData.city}, ${formData.store_address}`;
        searchAddressAndCenter(address, (coords) => {
            setFormData(prev => ({
                ...prev,
                latitude: coords.lat,
                longitude: coords.lng
            }));
            setLocationChanged(true);
            setAlert({ message: "Location found and marked on map! Remember to Save Changes.", type: "success" });
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'store_logo') {
                    if (formData[key]) data.append(key, formData[key]);
                } else if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });

            await axiosInstance.patch("stores/profile/", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setAlert({ message: "Profile updated successfully!", type: "success" });
            setLocationChanged(false);
            fetchProfile(); // Refresh
        } catch (error) {
            console.error("Error saving profile:", error);
            setAlert({ message: "Failed to save profile", type: "error" });
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
                <StoreSidebar />
                <div className="flex-1 p-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Store Settings</h1>
                                <p className="text-gray-500 mt-1">Manage your shop brand and location</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg disabled:opacity-50 ${locationChanged
                                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100 border-2 border-orange-200 animate-pulse highlight-save"
                                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-100"
                                    }`}
                            >
                                {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaSave />}
                                {locationChanged ? "Save Location Changes" : "Save Changes"}
                            </button>
                        </div>

                        {locationChanged && (
                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                                <p className="text-orange-700 text-sm font-bold">
                                    Location updated! Click "Save Location Changes" above to persist your new shop position.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Profile Info */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                                    <div className="relative w-32 h-32 mx-auto mb-4 group">
                                        <div className="w-full h-full rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-md">
                                            {formData.store_logo_url || formData.store_logo ? (
                                                <img
                                                    src={formData.store_logo ? URL.createObjectURL(formData.store_logo) : formData.store_logo_url}
                                                    alt="Store Logo"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <FaStore size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute bottom-2 right-2 p-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 shadow-lg transition-transform hover:scale-110">
                                            <FaCamera size={14} />
                                            <input type="file" name="store_logo" className="hidden" onChange={handleChange} accept="image/*" />
                                        </label>
                                    </div>
                                    <h2 className="font-bold text-gray-800 text-lg">{formData.store_name || "My Store"}</h2>
                                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest mt-1">Shop Admin</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                    <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-2">Business Details</h3>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Store Name</label>
                                        <input
                                            type="text"
                                            name="store_name"
                                            value={formData.store_name}
                                            onChange={handleChange}
                                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Store Description</label>
                                        <textarea
                                            name="store_description"
                                            value={formData.store_description}
                                            onChange={handleChange}
                                            rows="4"
                                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Location & Contact */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-4 mb-6 flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-purple-500" /> Shop Location
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                                placeholder="e.g. Kathmandu"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Address</label>
                                            <input
                                                type="text"
                                                name="store_address"
                                                value={formData.store_address}
                                                onChange={handleChange}
                                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                                placeholder="e.g. New Road"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <button
                                            type="button"
                                            onClick={handleLocateAddress}
                                            className="w-full bg-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                                        >
                                            <FaMapMarkerAlt size={16} />
                                            Locate Shop on Map
                                        </button>
                                        <p className="text-[10px] text-gray-500 mt-2 text-center italic">
                                            💡 Click this after typing your city/address to automatically find it on the map.
                                        </p>
                                    </div>

                                    <StoreLocationMap
                                        onLocationSelect={handleLocationSelect}
                                        initialLocation={{ lat: formData.latitude, lng: formData.longitude }}
                                        city={formData.city}
                                    />

                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Latitude</span>
                                            <span className="text-sm font-mono text-gray-600">{formData.latitude !== null && formData.latitude !== undefined ? formData.latitude : "Not set"}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase block">Longitude</span>
                                            <span className="text-sm font-mono text-gray-600">{formData.longitude !== null && formData.longitude !== undefined ? formData.longitude : "Not set"}</span>
                                        </div>
                                    </div>
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

export default StoreProfile;

// Add this style to handle the save button highlight
const style = document.createElement("style");
style.innerHTML = `
.highlight-save {
  border: 2px solid #ff9800 !important;
  box-shadow: 0 0 15px rgba(255,152,0,0.6) !important;
  transform: scale(1.02);
}
`;
document.head.appendChild(style);

