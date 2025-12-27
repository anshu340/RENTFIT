import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaEnvelope, FaLock, FaUser, FaPhone } from "react-icons/fa";

const UserRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    // Client-side validation
    const validationErrors = {};
    if (!formData.name) validationErrors.name = "Name is required";
    if (!formData.email) validationErrors.email = "Email is required";
    if (!formData.phone) validationErrors.phone = "Phone is required";
    if (!formData.password) validationErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      validationErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        "register/customer/",
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }
      );

      toast.success("Registration successful! Please verify your email with OTP.");
      setStep(2);
    } catch (err) {
      console.error("Registration Error:", err);
      console.error("Error Response:", err?.response?.data);
      
      // Extract error message from various possible response formats
      let message = "Registration failed. Try again.";
      
      if (err?.response?.data) {
        const errorData = err.response.data;
        
        // Check for different error formats
        if (errorData.message) {
          message = errorData.message;
        } else if (errorData.error) {
          message = errorData.error;
        } else if (errorData.email) {
          message = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
        } else if (errorData.phone) {
          message = Array.isArray(errorData.phone) ? errorData.phone[0] : errorData.phone;
        } else if (errorData.name) {
          message = Array.isArray(errorData.name) ? errorData.name[0] : errorData.name;
        } else if (errorData.password) {
          message = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password;
        } else if (typeof errorData === 'string') {
          message = errorData;
        }
      }
      
      setServerError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!otp || otp.length !== 6) {
      setServerError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        "verify-otp/",
        {
          email: formData.email,
          otp: otp,
        }
      );

      toast.success("Email verified successfully! You can now login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("OTP Verification Error:", err);
      console.error("Error Response:", err?.response?.data);
      
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid or expired OTP. Please try again.";
      setServerError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.post("resend-otp/", {
        email: formData.email,
      });
      toast.success("OTP resent successfully!");
      setOtp("");
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
          <h1 className="text-4xl font-bold mb-4">Join RentFit Today</h1>
          <p className="text-purple-100 mb-8 max-w-md">
            {step === 1
              ? "Register as a customer to explore online clothes rental, browse outfits, and rent your favorite fashion easily."
              : "We've sent a verification code to your email. Please enter it below to complete your registration."}
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-center bg-gray-50 px-6 py-8">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-10">
            {step === 1 ? (
              <>
                <h2 className="text-2xl font-bold mb-4 text-center">
                  Register as Customer
                </h2>

                {serverError && (
                  <p className="text-red-500 text-center mb-4 bg-red-50 p-3 rounded-lg">{serverError}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
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
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
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
                      autoComplete="tel"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoComplete="new-password"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
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
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Registering..." : "Register"}
                  </button>
                </form>

                <p className="text-sm text-center text-gray-600 mt-4">
                  Already have an account?{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="text-purple-600 font-semibold cursor-pointer hover:underline"
                  >
                    Login here
                  </span>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4 text-center">
                  Verify Your Email
                </h2>
                <p className="text-sm text-gray-600 text-center mb-6">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-semibold">{formData.email}</span>
                </p>

                {serverError && (
                  <p className="text-red-500 text-center mb-4 bg-red-50 p-3 rounded-lg">{serverError}</p>
                )}

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full p-3 border rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                </form>

                <div className="text-center mt-4">
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
                  onClick={() => setStep(1)}
                  className="w-full mt-4 text-gray-600 text-sm hover:underline"
                >
                  ← Back to Registration
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserRegister;