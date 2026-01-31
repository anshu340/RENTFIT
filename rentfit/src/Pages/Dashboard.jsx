import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import donationAxios from '../services/donationAxios';
import Navbar from '../Components/Navbar';
import DashboardSidebar from '../Components/DashboardSidebar';
import DashboardHeader from '../Components/DashboardHeader';
import {
  FaHeart,
  FaHandHoldingHeart,
  FaMapMarkerAlt,
  FaDollarSign,
  FaShoppingBag,
  FaBox
} from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [userInfo, setUserInfo] = useState({
    fullName: "User",
    email: "",
    phone: "",
    profileImage: ""
  });
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
      const profileResponse = await axiosInstance.get("accounts/customers/profile/");
      const profileData = profileResponse.data?.data || profileResponse.data;
      if (profileData) {
        const name = profileData.full_name || profileData.name || "User";
        setUserName(name);
        setUserInfo({
          fullName: name,
          email: profileData.email || "",
          phone: profileData.phone_number || profileData.phone || "",
          profileImage: profileData.profile_image_url || profileData.profile_image || ""
        });
      }

      // Fetch donations count
      try {
        const donationsResponse = await donationAxios.get("donations/my/");
        console.log("My donations response:", donationsResponse.data);
        const donations = donationsResponse.data || [];
        const donationCount = Array.isArray(donations) ? donations.length : 0;

        setDashboardData(prev => ({
          ...prev,
          itemsDonated: donationCount
        }));

        // Add recent donation activities
        if (donations.length > 0) {
          const recentDonations = donations
            .slice(0, 3)
            .map(d => ({
              type: 'donation',
              title: 'Donation Submitted',
              description: `${d.item_name} to ${d.store_name} - Status: ${d.donation_status}`,
              time: formatTime(d.created_at)
            }));

          setDashboardData(prev => ({
            ...prev,
            recentActivity: [...recentDonations, ...prev.recentActivity]
          }));
        }
      } catch (error) {
        console.error("Error fetching donations:", error);
      }

      // Fetch wishlist count
      try {
        const wishlistResponse = await axiosInstance.get("accounts/wishlist/");
        const wishlistCount = wishlistResponse.data?.data?.length || 0;
        setDashboardData(prev => ({
          ...prev,
          wishlistItems: wishlistCount
        }));
      } catch (error) {
        console.log("Error fetching wishlist:", error);
      }

      // Fetch dashboard statistics
      try {
        const statsResponse = await axiosInstance.get("accounts/dashboard/stats/");
        if (statsResponse.data) {
          setDashboardData(prev => ({
            ...prev,
            activeRentals: statsResponse.data.active_rentals || 0,
            totalSpent: statsResponse.data.total_spent || 0
          }));
        }
      } catch (error) {
        console.log("Stats endpoint not available yet");
      }

      // Fetch current rentals
      try {
        const rentalsResponse = await axiosInstance.get("accounts/rentals/current/");
        if (rentalsResponse.data) {
          setDashboardData(prev => ({
            ...prev,
            currentRentals: rentalsResponse.data.results || rentalsResponse.data || []
          }));
        }
      } catch (error) {
        console.log("Rentals endpoint not available yet");
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
      <div className="flex min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
        <DashboardSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <DashboardHeader
            userInfo={userInfo}
            notificationCount={dashboardData.recentActivity.length}
          />

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
                    onClick={() => navigate('/browseClothes')}
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
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${rental.status === 'active' ? 'bg-orange-100 text-orange-600' :
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
    </>
  );
};

export default Dashboard;