import React, { useState, useEffect } from 'react';
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineLoading3Quarters,
  AiOutlineWarning
} from 'react-icons/ai';
import Navbar from '../Components/Navbar';
import Footer from "../Components/Footer";
import DashboardSidebar from '../Components/DashboardSidebar';
import { BsGrid3X3Gap, BsList } from 'react-icons/bs';
import axiosInstance from "../services/axiosInstance";

const Wishlist = () => {
  const [currentPage, setCurrentPage] = useState('wishlist');
  const [wishlist, setWishlist] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: [],
    size: [],
    priceRange: null,
    search: ''
  });

  // Fetch all clothing items from API
  const fetchClothingItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('clothing/all/');
      setAllItems(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load clothing items. Please try again.');
      setLoading(false);
      console.error('Error fetching clothing:', err);
    }
  };

  // Fetch wishlist from API
  const fetchWishlist = async () => {
    try {
      const response = await axiosInstance.get('wishlist/');
      // Extract clothing IDs from wishlist items
      const wishlistIds = response.data.data.map(item => item.clothing.id);
      setWishlist(wishlistIds);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      // Don't show error for wishlist fetch failure (user might not be logged in)
    }
  };

  // Add item to wishlist via API
  const addToWishlist = async (itemId) => {
    try {
      await axiosInstance.post('wishlist/add/', { clothing_id: itemId });
      setWishlist(prev => [...prev, itemId]);
      console.log('Added to wishlist:', itemId);
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      const errorMsg = err.response?.data?.details || err.response?.data?.error || 'Failed to add item to wishlist';
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Remove item from wishlist via API
  const removeFromWishlist = async (itemId) => {
    try {
      await axiosInstance.delete(`wishlist/remove-by-clothing/${itemId}/`);
      setWishlist(prev => prev.filter(id => id !== itemId));
      console.log('Removed from wishlist:', itemId);
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      const errorMsg = err.response?.data?.error || 'Failed to remove item from wishlist';
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Clear entire wishlist via API
  const clearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      const response = await axiosInstance.delete('wishlist/clear/');
      setWishlist([]);
      alert(response.data.message || 'Wishlist cleared successfully!');
    } catch (err) {
      console.error('Failed to clear wishlist:', err);
      const errorMsg = err.response?.data?.error || 'Failed to clear wishlist';
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Create rental booking via API
  const createRental = async (itemId) => {
    try {
      // This would be your rental creation endpoint
      // const response = await axiosInstance.post('rentals/create/', { clothing_id: itemId });
      alert(`Rental booking created for item ${itemId}! (API endpoint to be implemented)`);
    } catch (err) {
      console.error('Failed to create rental:', err);
      alert('Failed to create rental booking. Please try again.');
    }
  };

  // Toggle wishlist with API calls
  const toggleWishlist = async (itemId) => {
    if (wishlist.includes(itemId)) {
      await removeFromWishlist(itemId);
    } else {
      await addToWishlist(itemId);
    }
  };

  const isInWishlist = (itemId) => wishlist.includes(itemId);

  // Load data on mount
  useEffect(() => {
    fetchClothingItems();
    fetchWishlist();
  }, []);

  const wishlistItems = allItems.filter(item => wishlist.includes(item.id));

  const ItemCard = ({ item, compact = false }) => (
    <div className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${compact ? 'flex flex-col h-full' : ''}`}>
      <div className="relative">
        <img
          src={item.image_url || item.images || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop'}
          alt={item.item_name}
          className={`w-full object-cover ${compact ? 'h-48' : 'h-64'}`}
        />
        {item.clothing_status === 'Available' && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
            Available
          </span>
        )}
        {item.clothing_status !== 'Available' && (
          <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-medium">
            {item.clothing_status}
          </span>
        )}
        <button
          onClick={() => toggleWishlist(item.id)}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
        >
          {isInWishlist(item.id) ? (
            <AiFillHeart className="w-5 h-5 text-red-500" />
          ) : (
            <AiOutlineHeart className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-1">{item.item_name}</h3>
        <p className="text-sm text-gray-600 mb-2">
          Size: {item.size} | Category: {item.category}
        </p>
        {item.store_name && (
          <p className="text-xs text-gray-500 mb-2">
            Store: {item.store_name} {item.store_city && `• ${item.store_city}`}
          </p>
        )}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-sm text-yellow-400">★</span>
          ))}
          <span className="text-xs text-gray-600 ml-1">(New)</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-2xl font-bold text-purple-600">${item.rental_price}</span>
            <span className="text-sm text-gray-500">/day</span>
          </div>
          <button
            onClick={() => createRental(item.id)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={item.clothing_status !== 'Available'}
          >
            {item.clothing_status === 'Available' ? 'Rent Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <AiOutlineLoading3Quarters className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading clothing items...</p>
      </div>
    </div>
  );

  const ErrorMessage = ({ message }) => (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in">
      <AiOutlineWarning className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );



  const WishlistPage = () => (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-gray-600">Save your favorite items for later</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
              <option>All Categories</option>
              <option>Shirt</option>
              <option>Pants</option>
              <option>Dress</option>
              <option>Jacket</option>
              <option>Skirt</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
              <option>Sort by: Recently Added</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{wishlistItems.length} items</span>
            {wishlistItems.length > 0 && (
              <button
                onClick={clearWishlist}
                className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear All
              </button>
            )}
            <button className="p-2 rounded-lg bg-purple-600 text-white">
              <BsGrid3X3Gap className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
              <BsList className="w-5 h-5" />
            </button>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <AiOutlineHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-4">Start adding items you love!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map(item => (
              <ItemCard key={item.id} item={item} compact={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 text-gray-800">
        <DashboardSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Error Message */}
          {error && <ErrorMessage message={error} />}

          {/* Page Content */}
          <WishlistPage />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;