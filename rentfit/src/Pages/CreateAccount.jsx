import React from "react";
import { FaUser, FaStore } from "react-icons/fa6";

const CreateAccount = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 px-4">
      
      {/* Main Card */}
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-lg px-16 py-14">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-3xl font-bold text-gray-800">
            Create Account
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Choose your account type to get started
          </p>
          <p className="text-sm text-gray-500 mt-1">or</p>
        </div>

        {/* Account Options */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-14 mb-14">

          {/* Customer */}
          <div className="bg-gray-50 p-8 rounded-xl text-center max-w-xs hover:shadow-lg transition">
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-purple-500 flex items-center justify-center">
              <FaUser className="text-white text-2xl" />
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Customer
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Register to find your perfect rental
            </p>

            <button 
              onClick={() => window.location.href = '/userRegister'}
              className="bg-purple-500 text-white px-10 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-600 transition"
            >
              Register
            </button>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-52 w-px bg-gray-300"></div>

          {/* Store */}
          <div className="bg-gray-50 p-8 rounded-xl text-center max-w-xs hover:shadow-lg transition">
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-pink-500 flex items-center justify-center">
              <FaStore className="text-white text-2xl" />
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Store
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Register to list your rental items
            </p>

            <button 
              onClick={() => window.location.href = '/storeRegister'}
              className="bg-pink-500 text-white px-10 py-2.5 rounded-lg text-sm font-medium hover:bg-pink-600 transition"
            >
              Register
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <span 
              onClick={() => window.location.href = '/login'}
              className="text-purple-600 font-semibold cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default CreateAccount;