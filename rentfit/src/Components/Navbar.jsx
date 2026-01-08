import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Rentfit Logo.png";

const Navbar = () => {
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
              to="/browse"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Browse
            </Link>
            <Link
              to="/donate"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Donate
            </Link>
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
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center space-x-4">
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

            {/* LOGIN */}
            <Link
              to="/login"
              className="px-6 py-2 text-purple-600 border border-purple-600 text-sm font-medium rounded-md hover:bg-purple-50 transition-colors"
            >
              Log in
            </Link>

            {/* SIGN UP */}
            <Link
              to="/createAccount"
              className="px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;