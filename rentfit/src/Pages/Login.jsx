import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Auto-fill email from registration if passed via state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.message) {
      setServerError(location.state.message);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!email) validationErrors.email = "Email is required";
    if (!password) validationErrors.password = "Password is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerError("");

    try {
      const response = await axiosInstance.post("accounts/login/", {
        email,
        password,
      });

      // Store tokens securely in localStorage
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token || "");
        localStorage.setItem("user", JSON.stringify(response.data.user || {}));
        localStorage.setItem("role", response.data.user?.role || "");
        localStorage.setItem("isLoggedIn", "true");

        // Add these lines for navbar authentication
        localStorage.setItem("authToken", response.data.access_token);
        localStorage.setItem("userType", response.data.user?.role === "Store" ? "store" : "user");

        // Dispatch event to update navbar immediately
        window.dispatchEvent(new Event('authChange'));
      }

      const { user } = response.data;

      // Navigate based on role
      if (user.role === "Customer") {
        navigate("/dashboard");
      } else if (user.role === "Store") {
        navigate("/storeDashboard");
      } else if (user.role === "Admin") {
        navigate("/adminDashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const errorData = error.response?.data;
      const message =
        errorData?.error ||
        errorData?.detail ||
        errorData?.message ||
        "Login failed. Please check your credentials.";

      setServerError(message);
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
          <div className="md:w-5/12 hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-[#f8edeb] via-[#fae1dd] to-[#f8edeb] text-slate-800 relative">
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/50 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/80">Sustainable Choice</span>
              <h1 className="text-4xl font-black mb-6 leading-tight tracking-tight text-slate-900 italic">Style meeting<br />Responsibility.</h1>
              <p className="text-lg text-slate-600 mb-8 font-medium leading-relaxed">Curated premium outfits for those who value elegance and the planet.</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center border border-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Premium Curation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center border border-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Eco-conscious</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-7/12 w-full px-8 py-12 md:px-16 md:py-20 flex flex-col justify-center bg-white/70">
            <div className="max-w-md w-full mx-auto">
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Log In</h2>
                <p className="text-slate-500 font-medium text-lg">Sign in to your style.</p>
              </div>

              {serverError && (
                <div className="flex items-center gap-3 text-rose-600 text-sm mb-8 bg-rose-50 p-4 rounded-2xl border border-rose-100 animate-shake">
                  <p className="font-bold">{serverError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-400 transition-colors" />
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      className={`w-full bg-slate-50 border-2 ${errors.email ? 'border-rose-200' : 'border-slate-50'} p-4 rounded-2xl pl-12 focus:outline-none focus:border-rose-200 focus:bg-white transition-all font-medium text-slate-900 text-sm`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({});
                        setServerError("");
                      }}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.email}</p>}
                </div>

                <div className="group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                    <a href="#" className="text-[10px] font-black text-rose-400 hover:text-rose-500 uppercase tracking-widest transition-colors">Forgot?</a>
                  </div>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-400 transition-colors" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={`w-full bg-slate-50 border-2 ${errors.password ? 'border-rose-200' : 'border-slate-50'} p-4 rounded-2xl pl-12 focus:outline-none focus:border-rose-200 focus:bg-white transition-all font-medium text-slate-900 text-sm`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors({});
                        setServerError("");
                      }}
                      autoComplete="current-password"
                    />
                  </div>
                  {errors.password && <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-100 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? "Authenticating..." : "Enter Shop"}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </form>

              <div className="mt-12 flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-px bg-slate-100 flex-1"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">New Account</span>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                <button
                  onClick={() => navigate("/createAccount")}
                  className="w-full bg-white border-2 border-slate-100 text-slate-900 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  Create Your Identity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;