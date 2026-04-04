import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Rentfit Logo.png";
import { IoMdNotifications } from "react-icons/io";
import axiosInstance from "../services/axiosInstance";
import NotificationDropdown from "./NotificationDropdown.jsx";
import SearchBar from "./SearchBar.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    profileImage: "",
    role: "",
  });

  const checkAuth = React.useCallback(() => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("authToken");
    const role = localStorage.getItem("role") || localStorage.getItem("userType");
    setIsLoggedIn(!!token);
    // Normalize role names
    if (role === 'Store' || role === 'store') setUserRole('Store');
    else if (role === 'Customer' || role === 'user') setUserRole('Customer');
    else if (role === 'Admin' || role === 'admin') setUserRole('Admin');
    else setUserRole('');
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener("authChange", checkAuth);
    return () => window.removeEventListener("authChange", checkAuth);
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await axiosInstance.get('notifications/unread-count/');
        setUnreadCount(response.data.unread_count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const role = localStorage.getItem("role") || localStorage.getItem("userType");
        let endpoint = "accounts/customers/profile/";
        if (role === 'Store' || role === 'store') endpoint = "accounts/stores/profile/";
        else if (role === 'Admin' || role === 'admin') endpoint = "accounts/admin/profile/";

        const response = await axiosInstance.get(endpoint);
        const profileData = response.data?.data || response.data;

        if (profileData) {
          const name = profileData.full_name || profileData.owner_name || profileData.name || "User";
          const profileImage = profileData.profile_image_url || profileData.profile_image || profileData.store_logo_url || profileData.store_logo || "";

          setUserInfo({
            name,
            profileImage,
            role: role || profileData.role || "Customer"
          });

          // Also update local storage so it stays somewhat fresh
          const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...savedUser, name, profile_image: profileImage }));
        }
      } catch (error) {
        console.error("Error fetching user profile for navbar:", error);
        // Fallback to local storage
        try {
          const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
          setUserInfo({
            name: savedUser.name || savedUser.full_name || savedUser.owner_name || "User",
            profileImage: savedUser.profile_image_url || savedUser.profile_image || savedUser.store_logo_url || savedUser.store_logo || "",
            role: localStorage.getItem('role') || "Customer"
          });
        } catch (e) { }
      }
    };

    fetchUnreadCount();
    fetchUserProfile();
    const interval = setInterval(fetchUnreadCount, 15000); // Poll every 15s

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole("");
    navigate("/login");
  };
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="RentFit Logo"
              className="h-16 w-auto"
            />
            <span className="text-2xl font-bold text-gray-900">Rentfit</span>
          </Link>

          {/* SEARCH BAR - Center */}
          <div className="flex-1 max-w-2xl px-6 hidden md:block">
            <SearchBar />
          </div>

          {/* NAV LINKS */}
          <div className="hidden lg:flex items-center space-x-8">
            {(!isLoggedIn || userRole === 'Customer') && (
              <Link
                to="/browseClothes"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Browse
              </Link>
            )}

            {/* Logged Out Links - Locations & About */}
            {(!isLoggedIn || userRole === 'Customer') && (
              <Link
                to="/nearbyStores"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Nearby Stores
              </Link>
            )}
            {!isLoggedIn && (
              <>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/donate"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Donation
                </Link>
              </>
            )}

            {/* Logged In Links */}
            {isLoggedIn && userRole === 'Customer' && (
              <Link
                to="/myrentals"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                My Rentals
              </Link>
            )}
            {isLoggedIn && userRole === 'Store' && (
              <>
                <Link
                  to="/rentmanagement"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Rental Requests
                </Link>
                <Link
                  to="/addClothingItem"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  List Clothes
                </Link>
                <Link
                  to="/storedonations"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Donations
                </Link>
              </>
            )}
            {isLoggedIn && userRole === 'Customer' && (
              <Link
                to="/donate"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Donate
              </Link>
            )}

            {/* Dashboard - Logged In Only */}
            {isLoggedIn && (
              <Link
                to={userRole === 'Store' ? "/storeDashboard" : userRole === 'Admin' ? "/adminDashboard" : "/dashboard"}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center space-x-4">
            {/* NOTIFICATION BELL */}
            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative"
                >
                  <IoMdNotifications className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <NotificationDropdown onClose={() => setShowNotifications(false)} />
                )}
              </div>
            )}

            {/* HEART ICON */}
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link to={userRole === 'Store' ? "/storeDashboard" : userRole === 'Admin' ? "/adminDashboard" : "/dashboard"} className="flex items-center gap-2 group cursor-pointer">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                    {userInfo.profileImage ? (
                      <img src={userInfo.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold uppercase">
                        {(userInfo.name && userInfo.name !== "User") ? userInfo.name.charAt(0) : (userRole ? userRole.charAt(0) : 'U')}
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:block flex-col items-start leading-tight">
                    <p className="text-sm font-semibold text-gray-800">{userInfo.name || "User"}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{userRole || "User"}</p>
                  </div>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 text-purple-600 border border-purple-600 text-sm font-medium rounded-md hover:bg-purple-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/createAccount"
                  className="px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
