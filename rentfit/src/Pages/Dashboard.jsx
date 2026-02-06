import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import donationAxios from '../services/donationAxios';
import rentalAxiosInstance from '../services/rentalAxiosInstance';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import DashboardSidebar from '../Components/DashboardSidebar';
import {
  FaHeart,
  FaHandHoldingHeart,
  FaMapMarkerAlt,
  FaDollarSign,
  FaShoppingBag,
  FaBox,
  FaBell
} from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        fullName: savedUser.name || "User",
        email: savedUser.email || "",
        phone: savedUser.phone || "",
        profileImage: savedUser.profile_image_url || savedUser.profile_image || "",
        role: localStorage.getItem('role') || "Customer"
      };
    } catch (e) {
      return { fullName: "User", email: "", phone: "", profileImage: "", role: "Customer" };
    }
  });
  const [userName, setUserName] = useState(userInfo.fullName);
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
      const profileData = profileResponse.data?.data || profileResponse.data;
      if (profileData) {
        const name = profileData.full_name || profileData.name || "User";
        setUserName(name);
        setUserInfo({
          fullName: name,
          email: profileData.email || "",
          phone: profileData.phone_number || profileData.phone || "",
          profileImage: profileData.profile_image_url || profileData.profile_image || "",
          role: profileData.role || "Customer"
        });
      }

      // Fetch dashboard statistics
      try {
        const statsResponse = await axiosInstance.get("dashboard/stats/");
        console.log("RAW STATS RESPONSE:", statsResponse.data); // debug - remove after fix confirmed
        const stats = statsResponse.data?.data || statsResponse.data;
        if (stats) {
          setDashboardData(prev => ({
            ...prev,
            activeRentals: stats.active_rentals || 0,
            wishlistItems: stats.wishlist_items || 0,
            totalSpent: stats.total_spent || 0,
            itemsDonated: stats.items_donated || 0
          }));
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }

      // Fetch current rentals (Calls api/rentals/my/)
      try {
        const rentalsResponse = await rentalAxiosInstance.get("my/");
        console.log("RAW RENTALS RESPONSE:", rentalsResponse.data); // debug - remove after fix confirmed
        const rentalsData = rentalsResponse.data?.data || rentalsResponse.data;
        if (rentalsData) {
          const rentals = Array.isArray(rentalsData) ? rentalsData : (rentalsData.results || []);
          // Only show active rentals (pending, approved, rented)
          const activeRentals = rentals.filter(r =>
            ['pending', 'approved', 'rented'].includes(r.status)
          );
          setDashboardData(prev => ({
            ...prev,
            currentRentals: activeRentals
          }));
        }
      } catch (error) {
        console.log("Rentals endpoint error:", error);
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

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Recently';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Helper to format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper to get status badge styles
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'approved':
        return 'bg-green-100 text-green-600';
      case 'rented':
        return 'bg-orange-100 text-orange-600';
      case 'returned_pending':
        return 'bg-blue-100 text-blue-600';
      case 'returned_confirmed':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  // Helper to format status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rented': return 'Rented';
      case 'returned_pending': return 'Return Pending';
      case 'returned_confirmed': return 'Returned';
      default: return status || 'Active';
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
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50 text-gray-800">
        <DashboardSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-8 py-5 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">User Dashboard</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Welcome back, {userInfo.fullName || 'User'}. Manage your rentals and explore new outfits.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <FaBell className="text-lg" />
                  {dashboardData.recentActivity.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 group cursor-pointer border border-gray-100 shadow-sm">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-lg font-bold z-0">
                      {(userInfo.fullName || 'User').charAt(0).toUpperCase()}
                    </div>
                    {userInfo.profileImage && (
                      <img
                        src={userInfo.profileImage}
                        alt="Profile"
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-sm font-medium text-gray-800">{userInfo.fullName || 'User'}</p>
                    <p className="text-xs text-gray-500">{userInfo.role || 'Customer'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <main className="flex-1 p-8 pt-0 overflow-y-auto">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Rentals</p>
                    <p className="text-3xl font-bold text-gray-800">{dashboardData.activeRentals}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaShoppingBag className="text-blue-600 text-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Wishlist Items</p>
                    <p className="text-3xl font-bold text-gray-800">{dashboardData.wishlistItems}</p>
                  </div>
                  <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaHeart className="text-pink-600 text-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                    <p className="text-3xl font-bold text-gray-800">${dashboardData.totalSpent}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaDollarSign className="text-green-600 text-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Items Donated</p>
                    <p className="text-3xl font-bold text-gray-800">{dashboardData.itemsDonated}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaHandHoldingHeart className="text-purple-600 text-lg" />
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
                      onClick={() => navigate('/browseClothes')}
                      className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Browse Clothes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.currentRentals.map((rental, index) => (
                      <div key={rental.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          {/* Image: rental.clothing.image */}
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg overflow-hidden">
                            {rental.clothing?.image && (
                              <img
                                src={rental.clothing.image}
                                alt={rental.clothing?.item_name || 'Item'}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            {/* Name: rental.clothing.item_name */}
                            <h3 className="font-semibold text-gray-800">
                              {rental.clothing?.item_name || 'Item'}
                            </h3>
                            {/* Size: rental.clothing.size */}
                            <p className="text-sm text-gray-600">
                              Size: {rental.clothing?.size || 'N/A'} | From: {formatDate(rental.rent_start_date)}
                            </p>
                            {/* Return due: rental.rent_end_date */}
                            <p className="text-sm text-gray-600">
                              Return due: {formatDate(rental.rent_end_date)}
                            </p>
                          </div>
                        </div>
                        {/* Status badge */}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(rental.status)}`}>
                          {getStatusLabel(rental.status)}
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
                      <FaHandHoldingHeart />
                      <span className="text-sm font-medium">Donate Items</span>
                    </button>
                    <button onClick={() => navigate('/mydonations')} className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                      <FaBox />
                      <span className="text-sm font-medium">View My Donations</span>
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
                      {dashboardData.recentActivity.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'payment' ? 'bg-green-500' :
                            activity.type === 'wishlist' ? 'bg-blue-500' :
                              activity.type === 'donation' ? 'bg-purple-500' :
                                'bg-gray-500'
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
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;