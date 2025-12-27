import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEnvelope, FaLock, FaUser, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const StoreRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    store_name: "",
    store_address: "",
    city: "",
    store_description: "",
    store_logo: null,
    password: "",
    confirmPassword: "",
    otp: "",
  });
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
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("store_name", formData.store_name);
    data.append("store_address", formData.store_address);
    data.append("city", formData.city);
    data.append("store_description", formData.store_description);
    if (formData.store_logo) {
      data.append("store_logo", formData.store_logo);
    }

    try {
      const res = await fetch("/api/accounts/register/store/", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      
      if (res.ok) {
        const successMsg = result.message || "Store registered! Please verify OTP.";
        setMessage(successMsg);
        toast.success(successMsg);
        setStep(3); // Move to OTP verification step
      } else {
        console.error("Registration Error:", result);
        const errorMsg = result.message || result.error || "Registration failed. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Network Error:", err);
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/accounts/verify-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
        }),
      });

      const result = await res.json();
      
      if (res.ok) {
        setMessage("Account verified successfully! Redirecting to login...");
        toast.success("Account verified successfully! Redirecting to login...");
        // Redirect to login page
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        console.error("OTP Verification Error:", result);
        const errorMsg = result.message || result.error || "Invalid OTP. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Network Error:", err);
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/accounts/resend-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      if (res.ok) {
        toast.success("OTP resent successfully!");
        setFormData({ ...formData, otp: "" });
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      console.error("Resend OTP Error:", err);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
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
                    name="name"
                    placeholder="Owner Name"
                    value={formData.name}
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
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
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
                  className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                    value={formData.otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setFormData({ ...formData, otp: value });
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