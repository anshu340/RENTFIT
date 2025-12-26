import React from 'react';
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
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <FaHandHoldingHeart className="text-lg" />
            <span>Donate Clothes</span>
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
            <h1 className="text-2xl font-bold text-white">Welcome back, Anshu</h1>
            <p className="text-sm text-white/90">Here's what's happening with your rentals today.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-white hover:bg-white/20 rounded-lg relative">
              <FaBell className="text-xl" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 font-semibold">
              A
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Rentals</p>
                <p className="text-3xl font-bold text-gray-800">3</p>
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
                <p className="text-3xl font-bold text-gray-800">12</p>
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
                <p className="text-3xl font-bold text-gray-800">$248</p>
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
                <p className="text-3xl font-bold text-gray-800">8</p>
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
            
            <div className="space-y-4">
              {/* Rental Item 1 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg"></div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Black Evening Dress</h3>
                    <p className="text-sm text-gray-600">Size: M | Rented: Dec 1-3, 2024</p>
                    <p className="text-sm text-gray-600">Return due: Tomorrow</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>

              {/* Rental Item 2 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg"></div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Navy Business Suit</h3>
                    <p className="text-sm text-gray-600">Size: L | Rented: Dec 5-7, 2024</p>
                    <p className="text-sm text-gray-600">Return due: Dec 7</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>

              {/* Rental Item 3 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-400 rounded-lg"></div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Red Cocktail Dress</h3>
                    <p className="text-sm text-gray-600">Size: S | Rented: Dec 8-10, 2024</p>
                    <p className="text-sm text-gray-600">Return due: Dec 10</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                  Upcoming
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition">
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
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Payment completed</p>
                    <p className="text-xs text-gray-600">for Black Evening Dress</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Item added to wishlist</p>
                    <p className="text-xs text-gray-600">Floral Summer Dress</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Review submitted</p>
                    <p className="text-xs text-gray-600">for Navy Business Dress</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;