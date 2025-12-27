import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="text-2xl font-bold text-purple-600">
                RentFit
              </a>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/browse" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Browse
              </a>
              <a href="/donate" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Donate
              </a>
              <a href="/locations" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Locations
              </a>
              <a href="/about" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                About
              </a>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Heart Icon */}
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </button>

              {/* Log in Button */}
              <button 
                onClick={() => window.location.href = '/login'}
                className="px-6 py-2 text-purple-600 border border-purple-600 text-sm font-medium rounded-md hover:bg-purple-50 transition-colors"
              >
                Log in
              </button>

              {/* Sign up Button */}
              <button 
                onClick={() => window.location.href = '/createAccount'}
                className="px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

export default Navbar;