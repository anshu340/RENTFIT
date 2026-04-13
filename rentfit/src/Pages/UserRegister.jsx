import React, { useState, useEffect } from "react";
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
    profile_image: null,
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const handleChange = (e) => {
    if (e.target.name === "profile_image") {
      setFormData({ ...formData, profile_image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

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
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && key !== "confirmPassword") {
          data.append(key, formData[key]);
        }
      });

      const response = await axiosInstance.post("accounts/register/customer/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
      const response = await axiosInstance.post("accounts/verify-otp/", {
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
    if (!canResend) return;

    setIsLoading(true);
    setServerError("");

    try {
      const response = await axiosInstance.post("accounts/resend-otp/", {
        email: formData.email,
      });

      setServerError("");
      setCanResend(false);
      setResendTimer(30);
    } catch (error) {
      console.error("Resend OTP Error:", error);
      const message = error.response?.data?.error || "Failed to resend OTP. Please try again.";
      setServerError(message);

      if (error.response?.status === 429) {
        setCanResend(false);
        setResendTimer(30);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#fdfcfb] relative overflow-hidden px-4 py-12">
        {/* Aesthetic Background Blobs - Soft Pastels */}
        <div className="absolute top-0 -left-4 w-[30rem] h-[30rem] bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-10 -right-4 w-[30rem] h-[30rem] bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-40 w-[30rem] h-[30rem] bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

        <div className="relative w-full max-w-6xl flex flex-col lg:flex-row bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-xl overflow-hidden animate-fade-in">

          {/* Left Side: Aesthetic Branding */}
          <div className="lg:w-5/12 hidden lg:flex flex-col justify-center p-12 lg:p-16 bg-gradient-to-br from-[#f8edeb] via-[#fae1dd] to-[#f8edeb] text-slate-800 relative">
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 bg-white/50 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-white/80">Step {step} of 2</span>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight text-slate-900">
                {step === 1 ? "Start your style journey." : "Secure your account."}
              </h1>
              <p className="text-base lg:text-lg text-slate-600 mb-8 font-medium leading-relaxed">
                {step === 1
                  ? "Join our curated collective where fashion meets sustainability in every thread."
                  : "A secure verification step to ensure your journey remains personal and protected."}
              </p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:w-7/12 w-full px-6 py-12 sm:px-12 lg:px-16 flex flex-col justify-center bg-white/80">
            <div className="max-w-xl w-full mx-auto">

              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Customer Registration</h2>
                <p className="text-slate-500 font-medium text-sm">
                  {step === 1 ? "Create your account to start renting." : "Verify your identity."}
                </p>
              </div>

              {serverError && (
                <div className="flex items-center gap-3 text-rose-600 text-sm mb-6 bg-rose-50 p-4 rounded-xl border border-rose-100">
                  <p className="font-semibold">{serverError}</p>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        placeholder="Alex Doe"
                        value={formData.full_name}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border ${errors.full_name ? 'border-rose-300' : 'border-slate-200'} p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm`}
                      />
                      {errors.full_name && <p className="text-rose-500 text-xs font-medium mt-1">{errors.full_name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        name="phone_number"
                        placeholder="Mobile Number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border ${errors.phone_number ? 'border-rose-300' : 'border-slate-200'} p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm`}
                      />
                      {errors.phone_number && <p className="text-rose-500 text-xs font-medium mt-1">{errors.phone_number}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 border ${errors.email ? 'border-rose-300' : 'border-slate-200'} p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm`}
                    />
                    {errors.email && <p className="text-rose-500 text-xs font-medium mt-1">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="City Name"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border ${errors.city ? 'border-rose-300' : 'border-slate-200'} p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm appearance-none"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Size</label>
                        <select
                          name="preferred_clothing_size"
                          value={formData.preferred_clothing_size}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm appearance-none"
                        >
                          <option value="">Select</option>
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Detailed Address</label>
                    <textarea
                      name="address"
                      placeholder="Full street address"
                      rows="2"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Profile Picture (Optional)</label>
                    <input
                      type="file"
                      name="profile_image"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-200 hover:file:bg-slate-300 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border ${errors.password ? 'border-rose-300' : 'border-slate-200'} p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm`}
                      />
                      {errors.password && <p className="text-rose-500 text-xs font-medium mt-1">{errors.password}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border ${errors.confirmPassword ? 'border-rose-300' : 'border-slate-200'} p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm`}
                      />
                      {errors.confirmPassword && <p className="text-rose-500 text-xs font-medium mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-70 mt-6"
                  >
                    {isLoading ? "Processing..." : "Create Account"}
                  </button>

                  <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="font-semibold text-slate-900 hover:text-slate-700 transition-colors"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                <div className="text-center max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                    <FaEnvelope className="text-2xl" />
                  </div>
                  <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                    We've sent a 6-digit code to <br /><span className="font-semibold text-slate-900">{formData.email}</span>.
                  </p>

                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    <input
                      type="text"
                      name="otp"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-center text-3xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                      maxLength={6}
                    />

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-70"
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </form>

                  <div className="mt-8 space-y-4">
                    <p className="text-sm text-slate-500">
                      Didn't receive the code?{" "}
                      <button
                        onClick={handleResendOtp}
                        disabled={isLoading || !canResend}
                        className={`font-semibold text-slate-900 hover:text-slate-700 transition-colors ${!canResend ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Now"}
                      </button>
                    </p>

                    <button
                      onClick={() => setStep(1)}
                      className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      ← Back to Registration
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserRegister;