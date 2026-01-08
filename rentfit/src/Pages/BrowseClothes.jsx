import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaHeart, FaRegHeart, FaTh, FaList, FaStar, FaFilter } from "react-icons/fa";

const BrowseClothes = () => {
  const navigate = useNavigate();
  const [clothes, setClothes] = useState([]);
  const [filteredClothes, setFilteredClothes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); 
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);

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
  }, []);

  useEffect(() => {
    applyFilters();
  }, [clothes, filters, sortBy]);

  const fetchClothes = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("clothing/all/");
      if (response.data) {
        setClothes(response.data);
        setFilteredClothes(response.data);
      }
    } catch (error) {
      console.error("Error fetching clothes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...clothes];

    // Search filter
    if (filters.searchQuery) {
      filtered = filtered.filter(item =>
        item.item_name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(item => filters.category.includes(item.category));
    }

    // Size filter
    if (filters.size.length > 0) {
      filtered = filtered.filter(item => filters.size.includes(item.size));
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(item => {
        const price = parseFloat(item.rental_price);
        return price >= min && price <= max;
      });
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => parseFloat(a.rental_price) - parseFloat(b.rental_price));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => parseFloat(b.rental_price) - parseFloat(a.rental_price));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredClothes(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      if (filterType === 'category' || filterType === 'size') {
        const currentValues = prev[filterType];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...prev, [filterType]: newValues };
      } else {
        return { ...prev, [filterType]: value };
      }
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
  };

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const handleRentNow = (id) => {
    navigate(`/clothing/${id}`);
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FaFilter className="text-purple-600" />
                    Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search clothes..."
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Category */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Category</h4>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <label key={cat} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.category.includes(cat)}
                          onChange={() => handleFilterChange('category', cat)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Size</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => handleFilterChange('size', size)}
                        className={`py-2 px-3 border rounded-lg text-sm font-medium transition-colors ${
                          filters.size.includes(size)
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h4>
                  <div className="space-y-2">
                    {priceRanges.map(range => (
                      <label key={range.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="priceRange"
                          checked={filters.priceRange === range.value}
                          onChange={() => handleFilterChange('priceRange', range.value)}
                          className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Event Type */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Event Type</h4>
                  <select
                    value={filters.eventType}
                    onChange={(e) => handleFilterChange('eventType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
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

            {/* Main Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Browse Clothes</h1>
                    <p className="text-gray-600 text-sm mt-1">
                      Discover your perfect outfit for any occasion
                    </p>
                    <p className="text-purple-600 text-sm mt-2">
                      Showing {filteredClothes.length} of {clothes.length} results
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="popular">Sort by: Popular</option>
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        <FaTh />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        <FaList />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clothes Grid */}
              {filteredClothes.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-600 text-lg">No clothes found matching your filters</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-4'}`}>
                  {filteredClothes.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="relative">
                        {item.images && (
                          <img
                            src={item.images}
                            alt={item.item_name}
                            className="w-full h-64 object-cover cursor-pointer"
                            onClick={() => handleRentNow(item.id)}
                          />
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusBadge(item.clothing_status)}`}>
                            {item.clothing_status}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                        >
                          {favorites.includes(item.id) ? (
                            <FaHeart className="text-red-500" />
                          ) : (
                            <FaRegHeart className="text-gray-600" />
                          )}
                        </button>
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                          {item.item_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.category} • {item.size}
                        </p>

                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className="text-yellow-400 text-xs" />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">(32 reviews)</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-purple-600">
                              ${item.rental_price}
                            </span>
                            <span className="text-sm text-gray-600">/day</span>
                          </div>
                          <button
                            onClick={() => handleRentNow(item.id)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            disabled={item.clothing_status !== 'Available'}
                          >
                            {item.clothing_status === 'Available' ? 'Rent Now' : 'Unavailable'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BrowseClothes;