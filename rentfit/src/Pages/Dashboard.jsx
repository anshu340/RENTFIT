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
    suggestedItems: [],
    rentalHistory: []
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

      // Fetch current rentals & recent activity
      let allUserRentals = [];
      try {
        const rentalsResponse = await rentalAxiosInstance.get("my/");
        const rentalsData = rentalsResponse.data?.data || rentalsResponse.data;
        if (rentalsData) {
          allUserRentals = Array.isArray(rentalsData) ? rentalsData : (rentalsData.results || []);

          // Recent Activity: Sort by updated_at (or created_at) DESC and take 5
          const history = [...allUserRentals].sort((a, b) =>
            new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
          ).slice(0, 5);

          setDashboardData(prev => ({
            ...prev,
            rentalHistory: history
          }));
        }
      } catch (error) {
        console.log("Rentals endpoint error:", error);
      }

      // Fetch suggested clothes
      try {
        const clothesResponse = await axiosInstance.get("clothing/all/");
        const clothesData = clothesResponse.data?.data || clothesResponse.data;
        if (clothesData) {
          const clothes = Array.isArray(clothesData) ? clothesData : (clothesData.results || []);

          // Get IDs of items already rented/requested by user
          const rentedClothingIds = new Set(allUserRentals.map(r => r.clothing?.id || r.clothing_id));

          // Suggested: Newest first (created_at DESC), excluding already rented, take 5
          const suggestions = clothes
            .filter(item => !rentedClothingIds.has(item.id))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);

          setDashboardData(prev => ({
            ...prev,
            suggestedItems: suggestions
          }));
        }
      } catch (error) {
        console.log("Clothes endpoint error:", error);
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
              {/* Suggested For You */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Suggested For You</h2>
                    <p className="text-sm text-gray-500">Discover newly added outfits you might like.</p>
                  </div>
                  <button
                    onClick={() => navigate('/browseClothes')}
                    className="text-sm font-bold text-purple-600 hover:text-purple-700"
                  >
                    View All
                  </button>
                </div>

                {dashboardData.suggestedItems.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <FaShoppingBag className="text-4xl mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No new outfits available right now.</p>
                    <button
                      onClick={() => navigate('/browseClothes')}
                      className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md"
                    >
                      Explore Collection
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData.suggestedItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/clothing/${item.id}`)}
                        className="group flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-transparent hover:border-purple-200 hover:bg-white hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="w-20 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.images && (
                            <img
                              src={item.images}
                              alt={item.item_name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 truncate group-hover:text-purple-600 transition-colors">
                            {item.item_name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-gray-900">${item.rental_price}</span>
                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase">New</span>
                          </div>
                        </div>
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
                  {dashboardData.rentalHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                  ) : (
                    <div className="space-y-4">
                      {dashboardData.rentalHistory.map((rental, index) => (
                        <div key={rental.id || index} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                          <div className="w-12 h-14 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            {rental.clothing?.images && (
                              <img
                                src={rental.clothing.images}
                                alt={rental.clothing_name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-bold text-gray-800 truncate">{rental.clothing_name}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(rental.status)}`}>
                                {getStatusLabel(rental.status)}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500">
                              {formatTime(rental.updated_at || rental.created_at)}
                            </p>
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