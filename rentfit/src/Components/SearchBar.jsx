import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTshirt, FaStore, FaMapMarkerAlt } from 'react-icons/fa';
import axiosInstance from '../services/axiosInstance';

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState({ clothes: [], stores: [] });
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Handle clicks outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // API Search Logic
    useEffect(() => {
        const trimmedQuery = query.trim();
        if (trimmedQuery.length < 2) {
            setSuggestions({ clothes: [], stores: [] });
            return;
        }

        const controller = new AbortController();
        setIsLoading(true);

        const timer = setTimeout(async () => {
            try {
                const response = await axiosInstance.get(`accounts/search/?q=${trimmedQuery}`, {
                    signal: controller.signal
                });
                
                // Backend returns { clothes: [...], stores: [...] }
                // We map them to ensure consistent field names if necessary
                const clothes = response.data.clothes || [];
                const stores = response.data.stores || [];

                setSuggestions({ clothes, stores });
                setIsLoading(false);
            } catch (error) {
                if (error.name !== 'CanceledError') {
                    console.error("Search API Error:", error);
                    setIsLoading(false);
                }
            }
        }, 500); // 500ms debounce for API calls

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    const handleSelect = (item, type) => {
        setQuery("");
        setShowDropdown(false);

        if (type === "clothing") {
            navigate(`/clothing/${item.id}`);
        } else if (type === "store") {
            // Some stores might not have a public profile yet, but we use the standard route
            navigate(`/storeProfile/${item.id}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            navigate(`/browseClothes?search=${query.trim()}`);
            setShowDropdown(false);
        }
    };

    return (
        <div className="relative w-full max-w-lg mx-4" ref={dropdownRef}>
            {/* Search Input Box */}
            <div className={`flex items-center bg-gray-50 border-2 transition-all duration-300 rounded-2xl px-4 py-2 ${showDropdown ? 'border-purple-300 bg-white shadow-lg shadow-purple-50' : 'border-transparent hover:border-gray-200'}`}>
                <FaSearch className={`text-lg transition-colors duration-300 ${query ? 'text-purple-500' : 'text-gray-400'}`} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search clothes, stores, or locations..."
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 ml-3 text-sm font-medium text-gray-700 placeholder:text-gray-400"
                />
                {isLoading && (
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin ml-2"></div>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && query.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[400px] overflow-y-auto p-2">
                        {isLoading && suggestions.clothes.length === 0 && suggestions.stores.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 italic text-sm flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                Searching...
                            </div>
                        ) : suggestions.clothes.length === 0 && suggestions.stores.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 font-medium text-sm flex flex-col items-center gap-2">
                                <span className="text-xl">🔍</span>
                                No results found for "{query}"
                            </div>
                        ) : (
                            <>
                                {/* Clothes Section */}
                                {suggestions.clothes.length > 0 && (
                                    <div className="mb-2">
                                        <div className="px-3 py-1.5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-50 mb-1 flex items-center gap-2">
                                            <FaTshirt /> Clothes
                                        </div>
                                        {suggestions.clothes.map(item => (
                                            <button
                                                key={`cloth-${item.id}`}
                                                onClick={() => handleSelect(item, "clothing")}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-purple-50 rounded-xl transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {item.image_url || item.images ? (
                                                        <img 
                                                            src={item.image_url || item.images} 
                                                            alt={item.item_name} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-purple-600 bg-purple-100/50">
                                                            <FaTshirt className="text-sm" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 tracking-tight truncate">{item.item_name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest truncate">{item.category} • NPR {item.rental_price}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Stores Section */}
                                {suggestions.stores.length > 0 && (
                                    <div>
                                        <div className="px-3 py-1.5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-50 mb-1 flex items-center gap-2">
                                            <FaStore /> Stores
                                        </div>
                                        {suggestions.stores.map(item => (
                                            <button
                                                key={`store-${item.id}`}
                                                onClick={() => handleSelect(item, "store")}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {item.store_logo_url || item.store_logo ? (
                                                        <img 
                                                            src={item.store_logo_url || item.store_logo} 
                                                            alt={item.store_name} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-blue-600 bg-blue-100/50">
                                                            <FaStore className="text-sm" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 tracking-tight truncate">{item.store_name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest flex items-center gap-1 truncate">
                                                        <FaMapMarkerAlt className="text-[8px]" /> {item.city || item.store_address || "Location not set"}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer / Quick Tip */}
                    <div className="bg-gray-50 p-3 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Press enter for more results</span>
                        <div className="flex gap-1">
                            <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-sm">ESC</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
