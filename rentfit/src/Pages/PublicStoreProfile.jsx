import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaStore, FaMapMarkerAlt, FaStar, FaClock } from "react-icons/fa";

export default function PublicStoreProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [store, setStore] = useState(null);
    const [clothes, setClothes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                setIsLoading(true);
                // Fetch store details
                const storeResponse = await axiosInstance.get(`accounts/stores/${id}/`);
                setStore(storeResponse.data);

                // Fetch store's clothing
                const clothesResponse = await axiosInstance.get(`accounts/clothing/all/?store_id=${id}`);
                setClothes(clothesResponse.data);
            } catch (error) {
                console.error("Error fetching store profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchStoreData();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!store) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex justify-center items-center text-gray-500 font-medium">
                    Store not found.
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            
            <main className="flex-1 p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Store Header Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                        <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-gray-100 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center border-4 border-white">
                            {store.store_logo_url ? (
                                <img src={store.store_logo_url} alt={store.store_name} className="w-full h-full object-cover" />
                            ) : (
                                <FaStore className="text-gray-400 text-5xl" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{store.store_name}</h1>
                            {store.owner_name && <p className="text-sm font-bold text-purple-600 mb-4 uppercase tracking-wider">Owner: {store.owner_name}</p>}
                            <p className="text-gray-600 mb-6 max-w-2xl leading-relaxed">{store.store_description || "Welcome to our rental store! Browse our collection of modern clothing below."}</p>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <span className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-sm font-bold">
                                    <FaMapMarkerAlt /> {store.city ? `${store.store_address}, ${store.city}` : store.store_address || 'Location hidden'}
                                </span>
                                {(store.open_time && store.close_time) && (
                                    <span className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold">
                                        <FaClock /> {store.open_time.slice(0, 5)} - {store.close_time.slice(0, 5)}
                                    </span>
                                )}
                                <span className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-sm font-bold">
                                    <FaStar /> {parseFloat(store.rating || 0).toFixed(1)} Rating
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Store Collection Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <span className="w-8 h-1 bg-purple-600 rounded-full"></span>
                            Store Collection ({clothes.length})
                        </h2>
                        
                        {clothes.length === 0 ? (
                            <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaStore className="text-gray-300 text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No Items Found</h3>
                                <p className="text-gray-500">This store hasn't uploaded any clothing items yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {clothes.map((item) => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => navigate(`/clothing/${item.id}`)}
                                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 group flex flex-col h-full"
                                    >
                                        <div className="aspect-[4/5] relative bg-gray-100 overflow-hidden">
                                            {item.images ? (
                                                <img 
                                                    src={item.images} 
                                                    alt={item.item_name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-800 text-lg truncate pr-2">{item.item_name}</h3>
                                                <p className="font-black text-purple-600 text-lg">Rs.{item.rental_price}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs font-bold text-gray-500 mb-4 uppercase mt-auto">
                                                <span className="bg-gray-100 px-3 py-1 rounded-full">{item.category}</span>
                                                <span className="bg-gray-100 px-3 py-1 rounded-full">{item.size}</span>
                                            </div>
                                            <button className="w-full bg-purple-50 text-purple-700 py-3 rounded-xl font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
