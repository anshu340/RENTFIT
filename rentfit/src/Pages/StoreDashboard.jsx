import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import donationAxios from "../services/donationAxios";
import { 
  FaBell, FaHome, FaBox, FaHeart, FaMapMarkerAlt, FaQuestionCircle, 
  FaFileAlt, FaChevronRight, FaCheckCircle, FaClock, FaExclamationCircle, 
  FaStore, FaTshirt, FaSignOutAlt, FaCog
} from 'react-icons/fa';

const InfoCard = ({ icon: Icon, label, value, color = "gray", trend }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <div className={`w-10 h-10 rounded-full bg-${color}-50 flex items-center justify-center`}>
        <Icon className={`text-${color}-500 text-lg`} />
      </div>
    </div>
    <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
    {trend && <div className="text-xs text-gray-500">{trend}</div>}
  </div>
);

const ActivityItem = ({ icon: Icon, color, title, desc, time }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0 mt-1`}>
      <Icon className="text-sm" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      <p className="text-xs text-gray-400 mt-1">{time}</p>
    </div>
  </div>
);

const QuickActionButton = ({ label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full py-3 px-4 bg-${color}-500 hover:bg-${color}-600 text-white rounded-lg font-medium transition-colors flex items-center justify-between`}
  >
    <span>{label}</span>
    <FaChevronRight className="text-sm" />
  </button>
);

const StoreDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  
  const [storeInfo, setStoreInfo] = useState({
    storeName: "",
    ownerName: "",
    email: "",
    phone: "",
    location: "",
    description: "",
    storeImage: "",
  });

  const [recentActivities, setRecentActivities] = useState([]);
  
  const [stats, setStats] = useState({
    approvedDonations: 0,
    pendingDonations: 0,
    rejectedDonations: 0,
    collectedDonations: 0,
    availableClothes: 0,
    unavailableClothes: 0,
    totalClothes: 0,
  });

  const menuItems = [
    { name: 'Dashboard', icon: FaHome, path: null },
    { name: 'Verify Listings', icon: FaCheckCircle, path: '/myClothingItems' },
    { name: 'List Clothes', icon: FaTshirt, path: '/addClothingItem'},
    { name: 'Rental Management', icon: FaBox, path: null },
    { name: 'Donations', icon: FaHeart, path: '/storedonations' },
    { name: 'Shop Locations', icon: FaMapMarkerAlt, path: null },
    { name: 'User Support', icon: FaQuestionCircle, path: null },
    { name: 'Reports', icon: FaFileAlt, path: null },
  ];

  useEffect(() => {
    fetchDashboardData();
    fetchDonationsData();
    fetchClothingItemsData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axiosInstance.get("stores/profile/");
      const profileData = response.data?.data || response.data;
      
      if (profileData) {
        const storeName = profileData.store_name || "My Store";
        const ownerName = profileData.owner_name || profileData.name || "Store Owner";
        const location = profileData.store_address || "";
        const description = profileData.store_description || "No description available";
        const storeImage = profileData.store_logo_url || profileData.store_logo || "";
        
        setStoreInfo({
          storeName,
          ownerName,
          email: profileData.email || "",
          phone: profileData.phone_number || profileData.phone || "",
          location,
          description,
          storeImage,
        });
        
        if (storeImage) {
          setProfileImage(storeImage);
        }
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDonationsData = async () => {
    try {
      const response = await donationAxios.get("donations/store/");
      console.log("Donations response:", response.data);
      
      const donations = response.data || [];
      
      const approved = donations.filter(d => d.donation_status === 'Approved').length;
      const pending = donations.filter(d => d.donation_status === 'Pending').length;
      const rejected = donations.filter(d => d.donation_status === 'Rejected').length;
      const collected = donations.filter(d => d.donation_status === 'Collected').length;
      
      console.log("Donations - Approved:", approved, "Pending:", pending, "Rejected:", rejected, "Collected:", collected);
      
      setStats(prev => ({
        ...prev,
        approvedDonations: approved,
        pendingDonations: pending,
        rejectedDonations: rejected,
        collectedDonations: collected,
      }));
      
      const recentDonations = donations
        .filter(d => d.donation_status === 'Approved' || d.donation_status === 'Collected')
        .slice(0, 3)
        .map(d => ({
          icon: FaHeart,
          color: 'bg-blue-100 text-blue-600',
          title: `Donation ${d.donation_status}`,
          desc: `${d.item_name || 'Item'} from ${d.customer_name || 'Donor'}`,
          time: formatTime(d.created_at),
          type: 'donation'
        }));
      
      setRecentActivities(prev => [...prev, ...recentDonations]);
    } catch (error) {
      console.error("Error fetching donations:", error);
      console.error("Error response:", error.response?.data);
    }
  };

  const fetchClothingItemsData = async () => {
    try {
      const response = await axiosInstance.get("clothing/my/");
      console.log("Clothing items response:", response.data);
      
      let items = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data?.results) {
        items = response.data.results;
      } else if (response.data?.data) {
        items = response.data.data;
      }
      
      console.log("Total items found:", items.length);
      
      const available = items.filter(item => 
        item.clothing_status?.toLowerCase() === 'available'
      ).length;
      const unavailable = items.filter(item => 
        item.clothing_status?.toLowerCase() === 'unavailable'
      ).length;
      
      console.log("Available:", available, "Unavailable:", unavailable);
      
      setStats(prev => ({
        ...prev,
        availableClothes: available,
        unavailableClothes: unavailable,
        totalClothes: items.length,
      }));
      
      const recentItems = items
        .slice(0, 3)
        .map(item => ({
          icon: FaTshirt,
          color: 'bg-purple-100 text-purple-600',
          title: `${item.item_name || 'Item'} - ${item.clothing_status || 'Listed'}`,
          desc: `${item.category || 'Category'} - Size ${item.size || 'N/A'}`,
          time: formatTime(item.created_at),
          type: 'rental'
        }));
      
      setRecentActivities(prev => [...prev, ...recentItems]);
    } catch (error) {
      console.error("Error fetching clothing items:", error);
      console.error("Error response:", error.response?.data);
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                {storeInfo.storeImage ? (
                  <img src={storeInfo.storeImage} alt="Store Logo" className="w-full h-full object-cover" />
                ) : (
                  <FaStore className="text-white text-xl" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-800 truncate">{storeInfo.storeName || "Store Name"}</h1>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveMenu(item.name);
                    if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-purple-50 text-purple-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="text-base" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-gray-100 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm">
              <FaCog className="text-base" />
              <span>Settings</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <FaSignOutAlt className="text-base" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-8 py-5 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">{storeInfo.storeName || "Store Dashboard"}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {storeInfo.description || "Monitor and manage rental operations"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <FaBell className="text-lg" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 group cursor-pointer">
                    {storeInfo.storeImage ? (
                      <img src={storeInfo.storeImage} alt="Store Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-bold">
                        {storeInfo.ownerName?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{storeInfo.ownerName || "Store Owner"}</p>
                    <p className="text-xs text-gray-500">Sub-Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-8">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <InfoCard
                icon={FaTshirt}
                label="Total Listings"
                value={stats.totalClothes}
                color="purple"
                trend={`${stats.availableClothes} available`}
              />
              <InfoCard
                icon={FaBox}
                label="Currently Rented"
                value={stats.unavailableClothes}
                color="orange"
                trend={`${stats.totalClothes - stats.unavailableClothes} ready to rent`}
              />
              <InfoCard
                icon={FaHeart}
                label="Total Donations"
                value={stats.approvedDonations + stats.collectedDonations}
                color="blue"
                trend={`${stats.collectedDonations} collected`}
              />
              <InfoCard
                icon={FaClock}
                label="Pending Reviews"
                value={stats.pendingDonations}
                color="green"
                trend="Needs attention"
              />
            </div>

            {/* Detailed Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FaTshirt className="text-purple-500" />
                  Clothing Items Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Available for Rent</span>
                    <span className="text-lg font-bold text-green-600">{stats.availableClothes}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${stats.totalClothes > 0 ? (stats.availableClothes / stats.totalClothes) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Currently Rented</span>
                    <span className="text-lg font-bold text-orange-600">{stats.unavailableClothes}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${stats.totalClothes > 0 ? (stats.unavailableClothes / stats.totalClothes) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FaHeart className="text-blue-500" />
                  Donations Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Approved</span>
                    <span className="text-lg font-bold text-green-600">{stats.approvedDonations}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Collected</span>
                    <span className="text-lg font-bold text-blue-600">{stats.collectedDonations}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="text-lg font-bold text-orange-600">{stats.pendingDonations}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rejected</span>
                    <span className="text-lg font-bold text-red-600">{stats.rejectedDonations}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Quick Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Items</span>
                    <span className="text-lg font-bold text-gray-800">{stats.totalClothes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Donations</span>
                    <span className="text-lg font-bold text-gray-800">
                      {stats.approvedDonations + stats.collectedDonations + stats.pendingDonations + stats.rejectedDonations}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Utilization Rate</span>
                    <span className="text-lg font-bold text-purple-600">
                      {stats.totalClothes > 0 ? Math.round((stats.unavailableClothes / stats.totalClothes) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Donation Status Chart */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Donation Status</h3>
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    {(() => {
                      const total = Math.max(stats.approvedDonations + stats.pendingDonations + stats.rejectedDonations + stats.collectedDonations, 1);
                      const circumference = 220;
                      const approvedPercent = stats.approvedDonations / total;
                      const collectedPercent = stats.collectedDonations / total;
                      const pendingPercent = stats.pendingDonations / total;
                      
                      return (
                        <>
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - (circumference * approvedPercent)}
                            strokeLinecap="round"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - (circumference * (approvedPercent + collectedPercent))}
                            strokeLinecap="round"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - (circumference * (approvedPercent + collectedPercent + pendingPercent))}
                            strokeLinecap="round"
                          />
                        </>
                      );
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800">
                        {stats.approvedDonations + stats.collectedDonations + stats.pendingDonations + stats.rejectedDonations}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Total Donations</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Approved ({stats.approvedDonations})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">Collected ({stats.collectedDonations})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-600">Pending ({stats.pendingDonations})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-600">Rejected ({stats.rejectedDonations})</span>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
                  <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {recentActivities.length > 0 ? (
                    recentActivities.slice(0, 6).map((activity, index) => (
                      <ActivityItem key={index} {...activity} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No recent activities
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <QuickActionButton 
                    label="Verify Listings" 
                    color="purple" 
                    onClick={() => navigate('/myClothingItems')} 
                  />
                  <QuickActionButton 
                    label="List New Items" 
                    color="green" 
                    onClick={() => navigate('/addClothingItem')} 
                  />
                  <QuickActionButton 
                    label="Handle Donations" 
                    color="blue" 
                    onClick={() => navigate('/storedonations')} 
                  />
                  <QuickActionButton 
                    label="View Reports" 
                    color="cyan" 
                    onClick={() => setActiveMenu('Reports')} 
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Items Available</span>
                      <span className="font-semibold text-green-600">{stats.availableClothes}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Items Rented</span>
                      <span className="font-semibold text-orange-600">{stats.unavailableClothes}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Approved Donations</span>
                      <span className="font-semibold text-blue-600">{stats.approvedDonations}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Pending Reviews</span>
                      <span className="font-semibold text-yellow-600">{stats.pendingDonations}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreDashboard;