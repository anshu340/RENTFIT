import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { FaEnvelope, FaLock, FaUser, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const StoreRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    owner_name: "",
    email: "",
    phone_number: "",
    store_name: "",
    store_address: "",
    city: "",
    store_description: "",
    store_logo: null,
    business_registration_number: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
    setError("");
    setMessage("");
  };

  // Step 2: Submit registration and get OTP
  const handleRegister = async () => {
    // Client-side validation
    if (!formData.store_name) {
      setError("Store name is required");
      return;
    }
    if (!formData.owner_name) {
      setError("Owner name is required");
      return;
    }
    if (!formData.email) {
      setError("Email is required");
      return;
    }
    if (!formData.password) {
      setError("Password is required");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("store_name", formData.store_name);
      formDataToSend.append("owner_name", formData.owner_name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("phone_number", formData.phone_number || "");
      formDataToSend.append("store_address", formData.store_address);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("store_description", formData.store_description || "");
      if (formData.store_logo) {
        formDataToSend.append("store_logo", formData.store_logo);
      }

      const response = await axiosInstance.post("register/store/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      const successMsg = "Store registered! Please verify OTP.";
      setMessage(successMsg);
      setStep(3); // Move to OTP verification step
    } catch (error) {
      console.error("Network Error:", error);
      let errorMsg = "Registration failed. Please try again.";
      const errorData = error.response?.data;
      
      if (errorData) {
        if (errorData.email) {
          errorMsg = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
        } else if (errorData.phone_number) {
          errorMsg = Array.isArray(errorData.phone_number) ? errorData.phone_number[0] : errorData.phone_number;
        } else if (errorData.store_name) {
          errorMsg = Array.isArray(errorData.store_name) ? errorData.store_name[0] : errorData.store_name;
        } else if (errorData.password) {
          errorMsg = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.error) {
          errorMsg = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
      }
      
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axiosInstance.post("verify-otp/", {
        email: formData.email,
        otp: otp,
      });
      
      setMessage("Account verified successfully! Redirecting to login...");
      // Redirect to login page
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("OTP Verification Error:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Invalid OTP. Please try again.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    // Note: Resend OTP endpoint may need to be implemented in backend
    setError("Please use the OTP sent to your email. If you didn't receive it, try registering again.");
    setOtp("");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Section */}
        <div className="hidden lg:flex flex-col justify-center px-20 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white">
          <h1 className="text-4xl font-bold mb-4">Join the Fashion Revolution</h1>
          <p className="text-purple-100 mb-8 max-w-md">
            {step === 1 || step === 2
              ? "Create your store account, list outfits, and reach customers nearby."
              : "We've sent a verification code to your email. Please enter it below to complete your registration."}
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-center bg-gray-50 px-6 py-8">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-10">
            <h2 className="text-2xl font-bold mb-4 text-center">Register as Store</h2>
            
            {message && (
              <p className="text-green-600 text-center mb-4 bg-green-50 p-3 rounded-lg">
                {message}
              </p>
            )}
            
            {error && (
              <p className="text-red-500 text-center mb-4 bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="owner_name"
                    placeholder="Owner Name"
                    value={formData.owner_name}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone_number"
                    placeholder="Phone Number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <input
                  type="text"
                  name="store_name"
                  placeholder="Store Name"
                  value={formData.store_name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />

                <input
                  type="text"
                  name="store_address"
                  placeholder="Store Address"
                  value={formData.store_address}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />

                <textarea
                  name="store_description"
                  placeholder="Store Description"
                  value={formData.store_description}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                />

                <input
                  type="text"
                  name="business_registration_number"
                  placeholder="Business Registration Number (Optional)"
                  value={formData.business_registration_number}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500">Note: This field is for reference only and is not stored in the backend yet.</p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition">
                  <input
                    type="file"
                    name="store_logo"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full"
                    id="store_logo"
                  />
                  <label htmlFor="store_logo" className="text-sm text-gray-500 cursor-pointer">
                    Upload Store Logo (Optional)
                  </label>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Continue
                </button>

                <p className="text-sm text-center text-gray-600 mt-4">
                  Already have an account?{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="text-purple-600 font-semibold cursor-pointer hover:underline"
                  >
                    Login here
                  </span>
                </p>
              </div>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 "
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>

                <button
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Back
                </button>
              </div>
            )}

            {/* Step 3: OTP Verification */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold mb-2">Verify Your Email</h3>
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-semibold">{formData.email}</span>
                  </p>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(value);
                      setError("");
                    }}
                    maxLength="6"
                    className="w-full p-3 border rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading}
                  className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Didn't receive the code?{" "}
                    <button
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-purple-600 font-semibold hover:underline disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                  className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Back
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StoreRegister;