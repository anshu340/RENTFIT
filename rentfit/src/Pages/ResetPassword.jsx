import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaLock, FaKey } from "react-icons/fa";

const ResetPassword = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    // If user tries to access this page without coming from Forgot Password, redirect
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

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

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setServerMessage({ text: "", type: "" });

    try {
      const response = await axiosInstance.post("accounts/resend-otp/", {
        email,
      });

      setServerMessage({ text: response.data.message || "OTP resent successfully.", type: "success" });
      setCanResend(false);
      setResendTimer(30);
    } catch (error) {
      console.error("Resend OTP Error:", error);
      const errorData = error.response?.data;
      const message =
        errorData?.error ||
        "Failed to resend OTP. Please try again.";

      setServerMessage({ text: message, type: "error" });

      // If backend says wait, start timer anyway
      if (error.response?.status === 429) {
        setCanResend(false);
        setResendTimer(30);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!otp) validationErrors.otp = "OTP is required";
    if (!newPassword) validationErrors.newPassword = "New Password is required";
    if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerMessage({ text: "", type: "" });

    try {
      const response = await axiosInstance.post("accounts/password/reset/", {
        email,
        otp,
        new_password: newPassword,
      });

      setServerMessage({ text: response.data.message || "Password reset successfully.", type: "success" });

      // Navigate to Login page after a short delay
      setTimeout(() => {
        navigate("/login", { state: { message: "Password updated successfully. Please login." } });
      }, 2000);

    } catch (error) {
      console.error("Reset Password Error:", error);
      const errorData = error.response?.data;
      const message =
        errorData?.error ||
        errorData?.detail ||
        errorData?.message ||
        "Failed to reset password. Please check your OTP.";

      setServerMessage({ text: message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#fdfcfb] relative overflow-hidden px-4 py-12">
        {/* Aesthetic Background Blobs - Soft Pastels */}
        <div className="absolute top-0 -left-4 w-80 h-80 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-10 -right-4 w-80 h-80 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-40 w-80 h-80 bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

        <div className="relative w-full max-w-5xl flex flex-col md:flex-row bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-xl overflow-hidden animate-fade-in">

          {/* Left Side: Aesthetic Branding */}
          <div className="md:w-5/12 hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-[#e0eafc] via-[#cfdef3] to-[#e0eafc] text-slate-800 relative">
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay grayscale"></div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/50 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/80">Verification</span>
              <h1 className="text-4xl font-black mb-6 leading-tight tracking-tight text-slate-900 italic">Secure <br />Identity.</h1>
              <p className="text-lg text-slate-700 mb-8 font-medium leading-relaxed">Check your inbox. We've sent a 6-digit code to {email}.</p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-7/12 w-full px-8 py-12 md:px-16 md:py-20 flex flex-col justify-center bg-white/70">
            <div className="max-w-md w-full mx-auto">

              <div className="mb-10 text-center md:text-left">
                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Set New Password</h2>
                <p className="text-slate-500 font-medium text-lg">Enter the OTP and your new password.</p>
              </div>

              {serverMessage.text && (
                <div className={`flex items-center gap-3 text-sm mb-8 p-4 rounded-2xl border ${serverMessage.type === 'error' ? 'text-rose-600 bg-rose-50 border-rose-100 animate-shake' : 'text-teal-700 bg-teal-50 border-teal-100'}`}>
                  <p className="font-bold">{serverMessage.text}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* OTP Field */}
                <div className="group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">6-Digit Code</label>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={!canResend || isLoading}
                      className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code?"}
                    </button>
                  </div>
                  <div className="relative">
                    <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="123456"
                      maxLength="6"
                      className={`w-full bg-slate-50 border-2 ${errors.otp ? 'border-rose-200' : 'border-slate-50'} p-4 rounded-2xl pl-12 focus:outline-none focus:border-blue-200 focus:bg-white transition-all font-medium text-slate-900 text-sm tracking-widest`}
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, ''));
                        setErrors({ ...errors, otp: "" });
                        setServerMessage({ text: "", type: "" });
                      }}
                    />
                  </div>
                  {errors.otp && <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.otp}</p>}
                </div>

                {/* New Password Field */}
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">New Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={`w-full bg-slate-50 border-2 ${errors.newPassword ? 'border-rose-200' : 'border-slate-50'} p-4 rounded-2xl pl-12 focus:outline-none focus:border-blue-200 focus:bg-white transition-all font-medium text-slate-900 text-sm`}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setErrors({ ...errors, newPassword: "" });
                      }}
                    />
                  </div>
                  {errors.newPassword && <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.newPassword}</p>}
                </div>

                {/* Confirm Password Field */}
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Confirm Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={`w-full bg-slate-50 border-2 ${errors.confirmPassword ? 'border-rose-200' : 'border-slate-50'} p-4 rounded-2xl pl-12 focus:outline-none focus:border-blue-200 focus:bg-white transition-all font-medium text-slate-900 text-sm`}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors({ ...errors, confirmPassword: "" });
                      }}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-100 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden mt-8"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? "Verifying..." : "Reset Password"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;
