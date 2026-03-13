import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import DashboardSidebar from '../Components/DashboardSidebar.jsx';
import MapView from "../Components/MapView";
import { FaStore, FaMapMarkerAlt, FaStar, FaSearch, FaFilter, FaDirections, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const isStoreOpen = (opening, closing, now = new Date()) => {
    if (!opening || !closing) return true; // Default to open if no hours set

    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [openHours, openMinutes] = opening.split(':').map(Number);
    const [closeHours, closeMinutes] = closing.split(':').map(Number);

    const openTime = openHours * 60 + openMinutes;
    const closeTime = closeHours * 60 + closeMinutes;

    if (closeTime > openTime) {
        return currentTime >= openTime && currentTime <= closeTime;
    } else {
        // Handle overnight hours (e.g., 22:00 to 02:00)
        return currentTime >= openTime || currentTime <= closeTime;
    }
};

const formatTime12h = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

const NearbyStores = () => {
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All Shops");
    const [currentTime, setCurrentTime] = useState(new Date());

    const defaultCenter = {
        lat: 27.7172,
        lng: 85.324,
    };

    useEffect(() => {
        fetchNearbyStores();

        // Auto-refresh status every minute
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const fetchNearbyStores = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get("accounts/stores/nearby/");
            setStores(response.data.data || []);
        } catch (error) {
            console.error("Error fetching stores:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isLoggedIn = !!localStorage.getItem("access_token");

    const filteredStores = useMemo(() => {
        return stores.filter(store => {
            const matchesSearch = store.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (store.city && store.city.toLowerCase().includes(searchQuery.toLowerCase()));

            const isOpen = isStoreOpen(store.open_time, store.close_time, currentTime);

            if (activeFilter === "All Shops") return matchesSearch;
            if (activeFilter === "Open Now") return matchesSearch && isOpen;
            if (activeFilter === "Verified") return matchesSearch && store.is_verified;
            if (activeFilter === "High Rated") return matchesSearch && (store.rating >= 4);

            return matchesSearch;
        });
    }, [stores, searchQuery, activeFilter, currentTime]);

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
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            <MapView
                height="100%"
                lat={selectedStore?.latitude || defaultCenter.lat}
                lng={selectedStore?.longitude || defaultCenter.lng}
                zoom={selectedStore ? 15 : 12}
                stores={filteredStores}
                readonly={true}
                now={currentTime}
            />
            {/* Overlay Search/Filter for Map */}
            <div className="absolute top-4 left-4 right-4 z-[10] flex flex-col gap-3">
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search location or shop name..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium">
                        <FaFilter /> Filters
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {["All Shops", "Open Now", "Verified", "High Rated"].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === filter
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white border border-gray-100 shadow-sm'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const StoreListSection = () => (
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Nearby Shops <span className="text-sm font-normal text-gray-400">({filteredStores.length})</span>
                </h2>
                <button className="text-sm text-purple-600 font-semibold hover:underline">View All</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[calc(100vh-250px)] scrollbar-thin scrollbar-thumb-gray-200">
                {filteredStores.length > 0 ? (
                    filteredStores.map(store => (
                        <div
                            key={store.id}
                            onClick={() => setSelectedStore(store)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer group ${selectedStore?.id === store.id
                                ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                                : 'border-gray-100 bg-white hover:border-purple-200 hover:shadow-md'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{store.store_name}</h3>
                                        {store.is_verified && (
                                            <span className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Verified</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">{store.store_address || "Downtown Plaza, 2nd Floor"}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isStoreOpen(store.open_time, store.close_time, currentTime) ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {isStoreOpen(store.open_time, store.close_time, currentTime) ? 'Open' : 'Closed'}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs mb-3">
                                <div className="flex items-center gap-1 text-amber-500 font-bold">
                                    <FaStar /> {store.rating || '4.8'} <span className="text-gray-400 font-normal">({store.reviews_count || '234'})</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500">
                                    <FaMapMarkerAlt className="text-purple-400" /> {store.distance || '0.8'} km
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs mb-4 text-gray-600">
                                <FaClock className="text-purple-400" />
                                <span className="font-semibold text-gray-700">Hours:</span>
                                <span>{store.open_time && store.close_time ?
                                    `${formatTime12h(store.open_time)} - ${formatTime12h(store.close_time)}` :
                                    'Open 24/7'}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {(store.categories || ['Formal Wear', 'Party Outfits']).map(cat => (
                                    <span key={cat} className="bg-gray-50 text-gray-500 text-[10px] px-2 py-1 rounded-md font-medium">
                                        {cat}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/storeProfile/${store.id || ''}`);
                                    }}
                                    className="flex-1 text-xs font-bold text-purple-600 hover:bg-purple-100 py-2.5 rounded-xl transition-colors border border-purple-100"
                                >
                                    View Details
                                </button>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 flex items-center justify-center gap-2 text-xs font-bold bg-purple-600 text-white py-2.5 rounded-xl hover:bg-purple-700 transition-all shadow-md shadow-purple-200"
                                >
                                    <FaDirections /> Directions
                                </a>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <FaStore size={48} className="mb-4 opacity-20" />
                        <p>No shops found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <div className={`flex flex-1 ${isLoggedIn ? '' : 'max-w-7xl mx-auto px-4 w-full'}`}>
                {isLoggedIn && <DashboardSidebar />}

                <div className="flex-1 flex flex-col h-[calc(100vh-64px)] p-6 overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-8 h-full">
                        {/* Map on Left (2/3) */}
                        <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0">
                            <MapSection />
                        </div>

                        {/* List on Right (1/3) */}
                        <StoreListSection />
                    </div>
                </div>
            </div>
            {!isLoggedIn && <Footer />}
        </div>
    );
};

export default NearbyStores;
