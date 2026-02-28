import React, { useState, useEffect } from "react";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import DashboardSidebar from '../Components/DashboardSidebar';
import MapView from "../Components/MapView";
import { FaStore, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const NearbyStores = () => {
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const defaultCenter = {
        lat: 27.7172,
        lng: 85.324,
    };

    useEffect(() => {
        fetchNearbyStores();
    }, []);

    const fetchNearbyStores = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get("stores/nearby/");
            setStores(response.data.data || []);
        } catch (error) {
            console.error("Error fetching stores:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isLoggedIn = !!localStorage.getItem("access_token");

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        );
    }

    const MapSection = () => (
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <MapView
                height="600px"
                lat={selectedStore?.latitude || defaultCenter.lat}
                lng={selectedStore?.longitude || defaultCenter.lng}
                zoom={selectedStore ? 15 : 12}
                stores={stores}
                readonly={true}
            />
        </div>
    );

    const StoreListSection = () => (
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col max-h-[600px]">
            <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">Our Stores</h2>
                <p className="text-sm text-gray-500 mt-1">{stores.length} locations available</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {stores.map(store => (
                    <div
                        key={store.id}
                        onClick={() => setSelectedStore(store)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedStore?.id === store.id
                            ? 'border-purple-500 bg-purple-50 shadow-md transform scale-[1.02]'
                            : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                {store.store_logo_url || store.store_logo ? (
                                    <img src={store.store_logo_url || store.store_logo} alt={store.store_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FaStore />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-800 truncate text-sm">{store.store_name}</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                                    <FaMapMarkerAlt className="text-purple-400" /> {store.city || "Unknown City"}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className={`${isLoggedIn ? 'flex flex-1 min-h-screen' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}`}>
                {isLoggedIn && <DashboardSidebar />}

                <div className={`flex-1 flex flex-col min-h-screen ${isLoggedIn ? 'p-6 md:p-8' : ''} space-y-6`}>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Nearby Stores</h1>
                            <p className="text-gray-500 mt-1">Found {stores.length} shops near you</p>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                        <StoreListSection />
                        <MapSection />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default NearbyStores;