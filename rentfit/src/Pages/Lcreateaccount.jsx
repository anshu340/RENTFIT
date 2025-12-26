import React from "react";
import { FaUser, FaStore } from "react-icons/fa6";

const Lcreateaccount = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 px-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg px-16 py-14">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
          <p className="text-sm text-gray-600">Choose your account type to login</p>
          <p className="text-sm text-gray-500 mt-1">or</p>
        </div>

        {/* Account Options */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-14 mb-14">
          {/* Customer */}
          <div className="flex flex-col items-center text-center max-w-xs bg-gray-50 rounded-xl p-8 hover:shadow-lg transition">
            <div className="w-16 h-16 mb-6 rounded-xl bg-purple-500 flex items-center justify-center">
              <FaUser className="text-white text-2xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Customer</h2>
            <p className="text-sm text-gray-600 mb-6">
              Login to find your perfect rental
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-10 py-2.5 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition"
            >
              Login
            </button>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-52 w-px bg-gray-300"></div>

          {/* Store */}
          <div className="flex flex-col items-center text-center max-w-xs bg-gray-50 rounded-xl p-8 hover:shadow-lg transition">
            <div className="w-16 h-16 mb-6 rounded-xl bg-pink-500 flex items-center justify-center">
              <FaStore className="text-white text-2xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Store</h2>
            <p className="text-sm text-gray-600 mb-6">
              Login to list your rental items
            </p>
            <button
              onClick={() => window.location.href = '/storeLogin'}
              className="px-10 py-2.5 rounded-lg bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 transition"
            >
              Login
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <span 
              onClick={() => window.location.href = '/createAccount'}
              className="font-semibold text-purple-600 hover:underline cursor-pointer"
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Lcreateaccount;