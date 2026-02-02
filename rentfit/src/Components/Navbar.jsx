import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Rentfit Logo.png";
import { IoMdNotifications } from "react-icons/io";
import notificationAxiosInstance from "../services/notificationAxiosInstance";
import NotificationDropdown from "./NotificationDropdown.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token") || localStorage.getItem("authToken");
      const role = localStorage.getItem("role") || localStorage.getItem("userType");
      setIsLoggedIn(!!token);
      // Normalize role names
      if (role === 'Store' || role === 'store') setUserRole('Store');
      else if (role === 'Customer' || role === 'user') setUserRole('Customer');
      else setUserRole('');
    };

    checkAuth();
    window.addEventListener("authChange", checkAuth);
    return () => window.removeEventListener("authChange", checkAuth);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await notificationAxiosInstance.get('unread-count/');
        setUnreadCount(response.data.unread_count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
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

          {/* NAV LINKS */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/browseClothes"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Browse
            </Link>

            {/* Logged Out Links - Locations & About */}
            {!isLoggedIn && (
              <>
                <Link
                  to="/locations"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Locations
                </Link>
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
              <Link
                to="/rentmanagement"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Rental Requests
              </Link>
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
                to={userRole === 'Store' ? "/storeDashboard" : "/dashboard"}
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
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
              >
                Log out
              </button>
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
