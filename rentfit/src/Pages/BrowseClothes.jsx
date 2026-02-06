import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import DashboardSidebar from '../Components/DashboardSidebar';
import Alert from "../Components/Alert";
import RentalModal from "../Components/RentalModal";
import { FaHeart, FaRegHeart, FaTh, FaList, FaStar, FaFilter, FaSearch, FaChevronDown, FaChevronRight } from "react-icons/fa";

const BrowseClothes = () => {
  const navigate = useNavigate();
  const [clothes, setClothes] = useState([]);
  const [filteredClothes, setFilteredClothes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Rental states
  const [selectedClothing, setSelectedClothing] = useState(null);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });

  // Filter states
  const [filters, setFilters] = useState({
    category: [],
    size: [],
    priceRange: '',
    eventType: 'All Events',
    searchQuery: ''
  });

  const categories = ['Formal Wear', 'Casual', 'Party Wear', 'Traditional', 'Sports Wear'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const priceRanges = [
    { label: 'Under $20', value: '0-20' },
    { label: '$20 - $50', value: '20-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: 'Over $100', value: '100-1000' }
  ];

  useEffect(() => {
    fetchClothes();
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await axiosInstance.get("wishlist/");

      let wishlistData = [];
      if (Array.isArray(response.data)) {
        wishlistData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Fix: Backend returns { data: [...] } structure
        wishlistData = response.data.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        wishlistData = response.data.results;
      }

      if (wishlistData) {
        // Map wishlist items to just clothing IDs
        const wishlistedIds = wishlistData.map(item => item.clothing?.id || item.clothing_id);
        setFavorites(wishlistedIds);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const fetchClothes = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("clothing/all/");

      let clothingData = [];
      if (Array.isArray(response.data)) {
        clothingData = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        clothingData = response.data.results;
      }

      setClothes(clothingData);
      setFilteredClothes(clothingData);
    } catch (error) {
      console.error("Error fetching clothes:", error);
      // Initialize with empty array on error to prevent crashes in render
      setClothes([]);
      setFilteredClothes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [clothes, filters, sortBy]);

  const applyFilters = () => {
    let result = [...clothes];

    // Search Query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(item =>
        item.item_name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Category
    if (filters.category.length > 0) {
      result = result.filter(item =>
        filters.category.includes(item.category)
      );
    }

    // Size
    if (filters.size.length > 0) {
      result = result.filter(item =>
        filters.size.includes(item.size)
      );
    }

    // Price Range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      result = result.filter(item => {
        const price = parseFloat(item.rental_price);
        return price >= min && price <= max;
      });
    }

    // Event Type (loose match as requested)
    if (filters.eventType && filters.eventType !== 'All Events') {
      // Assuming eventType might map to category or just text match
      result = result.filter(item =>
        item.category.includes(filters.eventType) ||
        item.description?.includes(filters.eventType)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => parseFloat(a.rental_price) - parseFloat(b.rental_price));
        break;
      case 'price-high':
        result.sort((a, b) => parseFloat(b.rental_price) - parseFloat(a.rental_price));
        break;
      case 'newest':
        // Assuming there's a date or ID to sort by, fallback to ID if no date
        result.sort((a, b) => b.id - a.id);
        break;
      case 'popular':
      default:
        // Keep default order (or implement popularity logic)
        break;
    }

    setFilteredClothes(result);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      // For arrays (Category, Size)
      if (Array.isArray(prev[key])) {
        if (prev[key].includes(value)) {
          return { ...prev, [key]: prev[key].filter(item => item !== value) };
        } else {
          return { ...prev, [key]: [...prev[key], value] };
        }
      }
      // For single values (Search, Price, Event)
      return { ...prev, [key]: value };
    });
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      size: [],
      priceRange: '',
      eventType: 'All Events',
      searchQuery: ''
    });
    setSortBy('popular');
  };

  const toggleFavorite = async (id) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login", { state: { message: "Please login to use wishlist" } });
      return;
    }

    // Optimistic Update
    const isAdding = !favorites.includes(id);
    setFavorites(prev =>
      isAdding ? [...prev, id] : prev.filter(fav => fav !== id)
    );

    try {
      if (isAdding) {
        await axiosInstance.post("wishlist/add/", { clothing_id: id });
        showAlert("Added to wishlist", "success");
      } else {
        await axiosInstance.delete(`wishlist/remove-by-clothing/${id}/`);
        showAlert("Removed from wishlist", "success");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      // Revert if error
      setFavorites(prev =>
        isAdding ? prev.filter(fav => fav !== id) : [...prev, id]
      );
      showAlert("Failed to update wishlist", "error");
    }
  };

  const handleRentNow = (item) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login", { state: { message: "Please login to continue renting" } });
      return;
    }

    // If not a customer, you might want to redirect or show alert
    const userRole = localStorage.getItem('role');
    if (userRole !== 'Customer') {
      showAlert('Only customers can rent items.', 'error');
      return;
    }
    setSelectedClothing(item);
    setIsRentalModalOpen(true);
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      Available: 'bg-green-500',
      Rented: 'bg-blue-500',
      Unavailable: 'bg-red-500'
    };
    return statusColors[status] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clothes...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />

        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-24">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors uppercase tracking-widest"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Search */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Search</label>
                      <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search items..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Category</label>
                      <div className="grid grid-cols-1 gap-2">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => handleFilterChange('category', cat)}
                            className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${filters.category === cat
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-100'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Size</label>
                      <div className="flex flex-wrap gap-2">
                        {['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                          <button
                            key={size}
                            onClick={() => handleFilterChange('size', size)}
                            className={`w-12 h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${filters.size === size
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-100 scale-105'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Price Range</label>
                      <div className="space-y-2">
                        {priceRanges.map(range => (
                          <label key={range.value} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="priceRange"
                              checked={filters.priceRange === range.value}
                              onChange={() => handleFilterChange('priceRange', range.value)}
                              className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer"
                            />
                            <span className={`text-sm transition-colors ${filters.priceRange === range.value ? 'text-purple-600 font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                              {range.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Event Type */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Event Type</label>
                      <select
                        value={filters.eventType}
                        onChange={(e) => handleFilterChange('eventType', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-medium appearance-none"
                      >
                        <option>All Events</option>
                        <option>Wedding</option>
                        <option>Party</option>
                        <option>Formal</option>
                        <option>Casual</option>
                      </select>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">Browse Clothes</h1>
                    <p className="text-gray-500 mt-1">Discover your perfect outfit for any occasion</p>
                    <div className="flex items-center gap-2 mt-4">
                      <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold border border-purple-100 uppercase tracking-wider">
                        {filteredClothes.length} Results
                      </span>
                      <span className="text-xs text-gray-400 font-medium">Out of {clothes.length} items</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="pl-4 pr-10 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium transition-all cursor-pointer appearance-none"
                      >
                        <option value="popular">Sort by: Popular</option>
                        <option value="newest">Newest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <FaChevronDown size={10} />
                      </div>
                    </div>
                    <div className="flex p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Grid View"
                      >
                        <FaTh size={14} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        title="List View"
                      >
                        <FaList size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Clothes Grid */}
                {filteredClothes.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaSearch className="text-gray-300 text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No clothes found</h3>
                    <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                    <button
                      onClick={clearFilters}
                      className="mt-6 px-8 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-100 hover:bg-purple-700 transition"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-6'}`}>
                    {filteredClothes.map((item) => (
                      <div
                        key={item.id}
                        className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row'}`}
                      >
                        <div className={`relative ${viewMode === 'grid' ? 'w-full' : 'w-72 flex-shrink-0'}`}>
                          {item.images && (
                            <img
                              src={item.images}
                              alt={item.item_name}
                              className={`w-full h-full object-cover cursor-pointer hover:opacity-95 transition-all duration-500 ${viewMode === 'grid' ? 'aspect-[4/5]' : 'h-full aspect-square'}`}
                              onClick={() => navigate(`/clothing/${item.id}`)}
                            />
                          )}
                          <div className="absolute top-4 left-4">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${getStatusBadge(item.clothing_status)}`}>
                              {item.clothing_status}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleFavorite(item.id)}
                            className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110"
                          >
                            {favorites.includes(item.id) ? (
                              <FaHeart className="text-red-500 transition-transform active:scale-125" />
                            ) : (
                              <FaRegHeart className="text-gray-600" />
                            )}
                          </button>
                        </div>

                        <div className="p-6 flex flex-col justify-between flex-1">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h3
                                className="text-xl font-bold text-gray-900 leading-tight cursor-pointer hover:text-purple-600 transition-colors"
                                onClick={() => navigate(`/clothing/${item.id}`)}
                              >
                                {item.item_name}
                              </h3>
                              <div className="text-right">
                                <p className="text-2xl font-black text-gray-900 leading-none">${item.rental_price}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">per day</p>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-gray-500 mb-4 bg-gray-50 inline-block px-3 py-1 rounded-lg">
                              {item.category} • {item.size}
                            </p>

                            <div className="flex items-center gap-1 mb-6">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className={`text-xs ${i < Math.round(item.average_rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`} />
                              ))}
                              <span className="text-[10px] font-bold text-gray-400 ml-2">({item.review_count || 0} reviews)</span>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/clothing/${item.id}`)}
                            className="w-full py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-purple-600 transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-purple-100 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                          >
                            <span>Rent Now</span>
                            <FaChevronRight size={8} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {filteredClothes.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    &lt;
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">1</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">2</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">3</button>
                  <span className="px-3 py-2">...</span>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">7</button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />

      <RentalModal
        isOpen={isRentalModalOpen}
        onClose={() => setIsRentalModalOpen(false)}
        clothing={selectedClothing || {}}
        onRentalCreated={showAlert}
      />

      <Alert
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: '', type: '' })}
      />
    </>
  );
};

export default BrowseClothes;
