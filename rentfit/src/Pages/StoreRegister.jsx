import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaUser, FaMapMarkerAlt, FaPhone, FaBuilding } from 'react-icons/fa';

const StoreRegister = () => {
  const [step, setStep] = useState(1);

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
        <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-10">
          
          {/* Header */}
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Register as Customer
          </h2>
          <p className="text-sm text-gray-500 mb-8 text-center">
            2 easy steps of Registration
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                step === 1 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className="text-xs text-gray-600 ml-2">Personal Info</div>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
            
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                step === 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <div className="text-xs text-gray-600 ml-2">Account Setup</div>
            </div>
          </div>

          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>

              {/* Full Name */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Phone Number</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Location</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="City, State or Zip Code"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50"
                  />
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition mt-6"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Account Setup */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Setup</h3>
              <p className="text-sm text-gray-500 mb-6">Create a secure password for your account</p>

              {/* Password */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Create password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Re-enter Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="text-xs text-gray-500 mt-4">
                By clicking on "Create an Account" below you are agreeing to the terms and Privacy of RentFit
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Back
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-sm text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <span className="text-purple-600 font-semibold cursor-pointer hover:underline">
              Login Here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoreRegister;