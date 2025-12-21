import React from "react";
import { FaEnvelope, FaLock } from "react-icons/fa6";

const Login = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* Left Section */}
      <div className="hidden lg:flex flex-col justify-center px-20 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white">
        <div className="mb-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-purple-600 font-bold">
            R
          </div>
          <span className="text-xl font-semibold">RentFit</span>
        </div>

        <h1 className="text-4xl font-bold mb-4">Sustainable Fashion Starts Here</h1>
        <p className="text-purple-100 mb-8 max-w-md">
          Rent premium outfits for any occasion, donate your unused clothes, and discover nearby rental shops.
          Join the fashion revolution today.
        </p>

        <ul className="space-y-4 text-sm">
          <li className="flex items-center gap-3">✔ Find Nearby Rental Shops</li>
          <li className="flex items-center gap-3">✔ Easy Booking & Tracking</li>
          <li className="flex items-center gap-3">✔ Donate & Earn Rewards</li>
        </ul>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center bg-gray-50 px-6">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-10">

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
          <p className="text-sm text-gray-500 mb-8">
            Sign in to continue your fashion journey
          </p>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-sm mb-6">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="accent-purple-500" />
              Remember me
            </label>
            <span className="text-purple-600 cursor-pointer hover:underline">Forgot Password?</span>
          </div>

          {/* Sign In */}
          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition">
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
            Don’t have an account?{" "}
            <span className="text-purple-600 font-semibold cursor-pointer hover:underline">Sign up</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
