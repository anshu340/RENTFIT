import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { 
  FaTachometerAlt, 
  FaTshirt, 
  FaHeart, 
  FaHandHoldingHeart, 
  FaMapMarkerAlt, 
  FaStar, 
  FaUser,
  FaBell,
  FaDollarSign,
  FaShoppingBag,
  FaBox,
  FaStore
} from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    activeRentals: 0,
    wishlistItems: 0,
    totalSpent: 0,
    itemsDonated: 0,
    currentRentals: [],
    recentActivity: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch user profile
      const profileResponse = await axiosInstance.get("customers/profile/");
      if (profileResponse.data) {
        const profileData = profileResponse.data?.data || profileResponse.data;
        if (profileData?.full_name) {
          setUserName(profileData.full_name);
        } else if (profileData?.name) {
          setUserName(profileData.name);
        }
      }

      // Fetch dashboard statistics
      // You'll need to create these endpoints in your backend
      try {
        const statsResponse = await axiosInstance.get("dashboard/stats/");
        if (statsResponse.data) {
          setDashboardData(prev => ({
            ...prev,
            activeRentals: statsResponse.data.active_rentals || 0,
            wishlistItems: statsResponse.data.wishlist_items || 0,
            totalSpent: statsResponse.data.total_spent || 0,
            itemsDonated: statsResponse.data.items_donated || 0
          }));
        }
      } catch (error) {
        console.log("Stats endpoint not available yet");
      }

      // Fetch current rentals
      try {
        const rentalsResponse = await axiosInstance.get("rentals/current/");
        if (rentalsResponse.data) {
          setDashboardData(prev => ({
            ...prev,
            currentRentals: rentalsResponse.data.results || rentalsResponse.data || []
          }));
        }
      } catch (error) {
        console.log("Rentals endpoint not available yet");
      }

      // Fetch recent activity
      try {
        const activityResponse = await axiosInstance.get("activity/recent/");
        if (activityResponse.data) {
          setDashboardData(prev => ({
            ...prev,
            recentActivity: activityResponse.data.results || activityResponse.data || []
          }));
        }
      } catch (error) {
        console.log("Activity endpoint not available yet");
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <span className="text-xl font-bold text-gray-800">RentFit</span>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-purple-600 bg-purple-50 rounded-lg font-medium">
            <FaTachometerAlt className="text-lg" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <FaTshirt className="text-lg" />
            <span>Browse Clothes</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <FaShoppingBag className="text-lg" />
            <span>My Rentals</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <FaHeart className="text-lg" />
            <span>Wishlist</span>
          </a>
          <a href="/donate" onClick={(e) => { e.preventDefault(); navigate('/donate'); }} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <FaHandHoldingHeart className="text-lg" />
            <span>Donate Clothes</span>
          </a>
          <a href="/mydonations" onClick={(e) => { e.preventDefault(); navigate('/mydonations'); }} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <FaBox className="text-lg" />
            <span>My Donations</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <FaMapMarkerAlt className="text-lg" />
            <span>Nearby Shops</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <FaStar className="text-lg" />
            <span>Reviews</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <FaUser className="text-lg" />
            <span>Profile</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {userName}</h1>
            <p className="text-sm text-white/90">Here's what's happening with your rentals today.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-white hover:bg-white/20 rounded-lg relative">
              <FaBell className="text-xl" />
              {dashboardData.recentActivity.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Rentals</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.activeRentals}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FaShoppingBag className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">Wishlist Items</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.wishlistItems}</p>
              </div>
              <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                <FaHeart className="text-pink-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-gray-800">${dashboardData.totalSpent}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FaDollarSign className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">Items Donated</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardData.itemsDonated}</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <FaHandHoldingHeart className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Rentals */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Current Rentals</h2>
            
            {dashboardData.currentRentals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaShoppingBag className="text-4xl mx-auto mb-2 opacity-50" />
                <p>No active rentals yet</p>
                <button 
                  onClick={() => navigate('/browse')}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Browse Clothes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.currentRentals.map((rental, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg overflow-hidden">
                        {rental.image && (
                          <img src={rental.image} alt={rental.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{rental.name || 'Item'}</h3>
                        <p className="text-sm text-gray-600">
                          Size: {rental.size || 'N/A'} | Rented: {rental.rental_period || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">Return due: {rental.return_date || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      rental.status === 'active' ? 'bg-orange-100 text-orange-600' :
                      rental.status === 'upcoming' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {rental.status || 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button onClick={() => navigate('/donate')} className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition">
                  <FaBox />
                  <span className="text-sm font-medium">Donate Items</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition">
                  <FaMapMarkerAlt />
                  <span className="text-sm font-medium">Find Nearby Shops</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
              {dashboardData.recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'payment' ? 'bg-green-500' :
                        activity.type === 'wishlist' ? 'bg-blue-500' :
                        'bg-purple-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;