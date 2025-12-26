import React from 'react';
import { FaEnvelope, FaLock, FaUser, FaPhone } from 'react-icons/fa';

const UserRegister = () => {
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

        <h1 className="text-4xl font-bold mb-4">Join the Fashion Revolution</h1>
        <p className="text-purple-100 mb-8 max-w-md">
          Create your account and start renting premium outfits, donate unused clothes, and discover sustainable fashion near you.
        </p>

        <ul className="space-y-4 text-sm">
          <li className="flex items-center gap-3">✔ Rent Premium Outfits</li>
          <li className="flex items-center gap-3">✔ Find Nearby Shops with Maps</li>
          <li className="flex items-center gap-3">✔ Donate & Earn Rewards</li>
          <li className="flex items-center gap-3">✔ Track Your Rentals</li>
          <li className="flex items-center gap-3">✔ Secure Payment Gateway</li>
        </ul>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center bg-gray-50 px-6 py-8">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            CREATE ACCOUNT
          </h1>
          <p className="text-sm text-gray-500">
            Choose your company type to get started
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block font-medium">
              Full Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder=""
                className="w-full pl-10 pr-4 py-3 bg-purple-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block font-medium">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="email"
                placeholder=""
                className="w-full pl-10 pr-4 py-3 bg-purple-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block font-medium">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="password"
                placeholder=""
                className="w-full pl-10 pr-4 py-3 bg-purple-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="password"
                placeholder=""
                className="w-full pl-10 pr-4 py-3 bg-purple-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block font-medium">
              Phone Number
            </label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="tel"
                placeholder=""
                className="w-full pl-10 pr-4 py-3 bg-purple-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2 mt-6">
          <input 
            type="checkbox" 
            id="terms" 
            className="mt-1 accent-blue-600"
          />
          <label htmlFor="terms" className="text-xs text-gray-600">
            I agree the{' '}
            <span className="text-blue-600 cursor-pointer hover:underline">
              Terms of Service
            </span>
            {' '}and{' '}
            <span className="text-blue-600 cursor-pointer hover:underline">
              Privacy Policy
            </span>
          </label>
        </div>

        {/* Create Account Button */}
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-6">
          Create Account
        </button>

        {/* Footer */}
        <p className="text-sm text-center text-gray-600 mt-6">
          Already have an account?
          <span className="text-blue-600 font-semibold cursor-pointer hover:underline ml-1">
            Sign in here
          </span>
        </p>

        </div>
      </div>
    </div>
  );
};

export default UserRegister;