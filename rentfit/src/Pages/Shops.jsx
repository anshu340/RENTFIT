import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import DashboardSidebar from '../Components/DashboardSidebar.jsx';
import { FaStore, FaMapMarkerAlt, FaStar, FaSearch, FaFilter, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Shops = () => {
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All Shops");

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
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
            const matchesSearch = 
                store.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (store.city && store.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (store.store_address && store.store_address.toLowerCase().includes(searchQuery.toLowerCase()));

            if (activeFilter === "All Shops") return matchesSearch;
            if (activeFilter === "Verified") return matchesSearch && store.is_verified;
            if (activeFilter === "High Rated") return matchesSearch && (store.rating >= 4);

            return matchesSearch;
        });
    }, [stores, searchQuery, activeFilter]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <div className={`flex flex-1 ${isLoggedIn ? '' : 'max-w-7xl mx-auto px-4 w-full'}`}>
                {isLoggedIn && <DashboardSidebar />}

                <div className="flex-1 p-6 md:p-10 overflow-auto">
                    <div className="max-w-6xl mx-auto">
                        
                        {/* Header Section */}
                        <div className="mb-12 text-center md:text-left">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4 italic">Discover Local Shops.</h1>
                            <p className="text-gray-500 text-lg max-w-2xl">Browse our curated network of premium rental stores and find the perfect outfit for your next event.</p>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
                            <div className="relative w-full md:max-w-md">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search stores, cities, or locations..."
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-800 font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {["All Shops", "Verified", "High Rated"].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeFilter === filter
                                            ? 'bg-purple-600 text-white shadow-xl shadow-purple-200'
                                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 shadow-sm'
                                            }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stores Grid */}
                        {filteredStores.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredStores.map(store => (
                                    <div
                                        key={store.id}
                                        onClick={() => navigate(`/storeProfile/${store.id}`)}
                                        className="bg-white rounded-[2rem] border border-gray-100 p-6 transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden"
                                    >
                                        {/* Subtle Background Accent */}
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shadow-inner">
                                                    {store.store_logo_url ? (
                                                        <img src={store.store_logo_url} alt={store.store_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FaStore className="text-gray-300 text-2xl" />
                                                    )}
                                                </div>
                                                {store.is_verified && (
                                                    <span className="bg-blue-50 text-blue-600 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-blue-100">Verified</span>
                                                )}
                                            </div>

                                            <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-purple-600 transition-colors tracking-tight">{store.store_name}</h3>
                                            
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                                <FaMapMarkerAlt className="text-purple-400" />
                                                <span className="truncate">{store.store_address || store.city || "Location details hidden"}</span>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 text-amber-500 font-black">
                                                        <FaStar size={14} /> {parseFloat(store.rating || 4.5).toFixed(1)}
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-medium">({store.reviews_count || '48'} reviews)</span>
                                                </div>
                                                
                                                <div className="text-purple-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                                    Browse Collection →
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaStore className="text-gray-200 text-3xl" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">No shops found.</h3>
                                <p className="text-gray-500">Try adjusting your search or filters to discover other shops.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {!isLoggedIn && <Footer />}
        </div>
    );
};

export default Shops;
