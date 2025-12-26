import React from "react";
import { FaEnvelope, FaLock, FaStore } from "react-icons/fa6";

const StoreLogin = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* Left Section */}
      <div className="hidden lg:flex flex-col justify-center px-20 bg-gradient-to-br from-pink-600 via-pink-500 to-purple-500 text-white">
        <div className="mb-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-pink-600 font-bold">
            R
          </div>
          <span className="text-xl font-semibold">RentFit</span>
        </div>

        <h1 className="text-4xl font-bold mb-4">Grow Your Rental Business</h1>
        <p className="text-pink-100 mb-8 max-w-md">
          Manage your rental inventory, track bookings, connect with customers, and grow your sustainable fashion business.
        </p>

        <ul className="space-y-4 text-sm">
          <li className="flex items-center gap-3">✔ Manage Your Inventory</li>
          <li className="flex items-center gap-3">✔ Track Orders & Bookings</li>
          <li className="flex items-center gap-3">✔ Connect with Customers</li>
          <li className="flex items-center gap-3">✔ Analytics & Insights</li>
        </ul>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center bg-gray-50 px-6">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-10">

          {/* Store Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-pink-500 flex items-center justify-center">
            <FaStore className="text-white text-2xl" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">Store Login</h2>
          <p className="text-sm text-gray-500 mb-8 text-center">
            Sign in to manage your rental business
          </p>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="store@email.com"
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-sm mb-6">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="accent-pink-500" />
              Remember me
            </label>
            <span className="text-pink-600 cursor-pointer hover:underline">Forgot Password?</span>
          </div>

          {/* Sign In */}
          <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition">
            Sign In
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-400">Or continue with</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Social Login */}
          <div className="flex gap-4">
            <button className="flex-1 border py-2 rounded-lg text-sm font-medium hover:bg-gray-50">G</button>
            <button className="flex-1 border py-2 rounded-lg text-sm font-medium hover:bg-gray-50">f</button>
          </div>

          {/* Footer */}
          <p className="text-sm text-center text-gray-600 mt-6">
            Don't have a store account?{" "}
            <span 
              onClick={() => window.location.href = '/storeRegister'}
              className="text-pink-600 font-semibold cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>

          {/* Customer Login Link */}
          <p className="text-xs text-center text-gray-500 mt-4">
            Are you a customer?{" "}
            <span 
              onClick={() => window.location.href = '/login'}
              className="text-purple-600 font-medium cursor-pointer hover:underline"
            >
              Login as Customer
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoreLogin;