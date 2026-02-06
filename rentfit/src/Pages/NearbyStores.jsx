import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import DashboardSidebar from '../Components/DashboardSidebar';
import { FaStore, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const containerStyle = {
    width: "100%",
    height: "600px",
};

const defaultCenter = {
    lat: 27.7172,
    lng: 85.324,
};

const NearbyStores = () => {
    const navigate = useNavigate();
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places"],
    });

    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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

    if (!isLoaded || isLoading) {
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

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <div className="flex min-h-screen bg-gray-50 text-gray-800">
                <DashboardSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-screen p-6 md:p-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Nearby Stores</h1>
                            <p className="text-gray-500 mt-1">Found {stores.length} shops near you</p>
                        </div>
                    </div>

                    {/* Content Grid - Stores List and Map */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                        {/* Store List */}
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

                        {/* Map Section */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={selectedStore ? { lat: selectedStore.latitude, lng: selectedStore.longitude } : defaultCenter}
                                zoom={selectedStore ? 15 : 12}
                                options={{
                                    styles: [
                                        { "featureType": "poi", "stylers": [{ "visibility": "off" }] }
                                    ],
                                    disableDefaultUI: false,
                                }}
                            >
                                {stores.map(store => (
                                    <Marker
                                        key={store.id}
                                        position={{ lat: store.latitude, lng: store.longitude }}
                                        onClick={() => setSelectedStore(store)}
                                        label={{
                                            text: store.store_name?.charAt(0),
                                            color: "white",
                                            fontWeight: "bold"
                                        }}
                                    />
                                ))}

                                {selectedStore && (
                                    <InfoWindow
                                        position={{ lat: selectedStore.latitude, lng: selectedStore.longitude }}
                                        onCloseClick={() => setSelectedStore(null)}
                                    >
                                        <div className="p-3 max-w-[200px]">
                                            <h4 className="font-bold text-gray-900">{selectedStore.store_name}</h4>
                                            <p className="text-xs text-gray-600 mt-1 mb-3">{selectedStore.store_address}</p>
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStore.latitude},${selectedStore.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                                            >
                                                🧭 Directions <FaArrowRight size={10} />
                                            </a>
                                        </div>
                                    </InfoWindow>
                                )}
                            </GoogleMap>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default NearbyStores;