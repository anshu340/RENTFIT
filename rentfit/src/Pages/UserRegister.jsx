import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaEnvelope, FaLock, FaUser, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const UserRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    gender: "",
    preferred_clothing_size: "",
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
    if (!formData.full_name) validationErrors.full_name = "Full name is required";
    if (!formData.email) validationErrors.email = "Email is required";
    if (!formData.phone_number) validationErrors.phone_number = "Phone number is required";
    if (!formData.password) validationErrors.password = "Password is required";
    if (formData.password.length < 8) validationErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      validationErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post("register/customer/", {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        address: formData.address,
        city: formData.city,
        gender: formData.gender,
        preferred_clothing_size: formData.preferred_clothing_size,
      });
      
      setServerError("");
      setStep(2);
    } catch (error) {
      console.error("Registration Error:", error);
      let message = "Registration failed. Please try again.";
      const errorData = error.response?.data;
      
      if (errorData) {
        if (errorData.email) {
          message = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
        } else if (errorData.phone_number) {
          message = Array.isArray(errorData.phone_number) ? errorData.phone_number[0] : errorData.phone_number;
        } else if (errorData.full_name) {
          message = Array.isArray(errorData.full_name) ? errorData.full_name[0] : errorData.full_name;
        } else if (errorData.password) {
          message = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password;
        } else if (errorData.message) {
          message = errorData.message;
        } else if (errorData.error) {
          message = errorData.error;
        } else if (typeof errorData === 'string') {
          message = errorData;
        }
      }
      
      setServerError(message);
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
      const response = await axiosInstance.post("verify-otp/", {
        email: formData.email,
        otp: otp,
      });
      
      // Add authentication for navbar
      if (response.data.access_token) {
        localStorage.setItem("authToken", response.data.access_token);
        localStorage.setItem("userType", "user");
        window.dispatchEvent(new Event('authChange'));
      }
      
      setServerError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("OTP Verification Error:", error);
      const message = error.response?.data?.message || error.response?.data?.error || "Invalid or expired OTP. Please try again.";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    // Note: Resend OTP endpoint may need to be implemented in backend
    setServerError("Please use the OTP sent to your email. If you didn't receive it, try registering again.");
    setOtp("");
  };

  return (
    <>
      <Navbar />
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
                      name="full_name"
                      placeholder="Full Name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
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
                      name="phone_number"
                      placeholder="Phone Number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoComplete="tel"
                    />
                    {errors.phone_number && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>
                    )}
                  </div>

                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                    )}
                  </div>

                  <div>
                    <select
                      name="preferred_clothing_size"
                      value={formData.preferred_clothing_size}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Preferred Clothing Size</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                    {errors.preferred_clothing_size && (
                      <p className="text-red-500 text-xs mt-1">{errors.preferred_clothing_size}</p>
                    )}
                  </div>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password (min. 8 characters)"
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