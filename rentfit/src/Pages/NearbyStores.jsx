import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaStore, FaMapMarkerAlt, FaPhone, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const containerStyle = {
    width: "100%",
    height: "calc(100vh - 200px)",
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

            <div className="flex-1 relative flex flex-col lg:flex-row">
                {/* Sidebar - Store List */}
                <div className="w-full lg:w-96 bg-white border-r border-gray-100 flex flex-col h-[40vh] lg:h-auto overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h1 className="text-2xl font-bold text-gray-800">Our Stores</h1>
                        <p className="text-sm text-gray-500 mt-1">Found {stores.length} shops near you</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {stores.map(store => (
                            <div
                                key={store.id}
                                onClick={() => setSelectedStore(store)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedStore?.id === store.id
                                        ? 'border-purple-500 bg-purple-50 shadow-md transform scale-[1.02]'
                                        : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                                        {store.store_logo_url || store.store_logo ? (
                                            <img src={store.store_logo_url || store.store_logo} alt={store.store_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><FaStore /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 truncate">{store.store_name}</h3>
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
                <div className="flex-1 relative">
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

            <Footer />
        </div>
    );
};

export default NearbyStores;
