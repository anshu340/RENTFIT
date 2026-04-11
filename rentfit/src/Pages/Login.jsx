import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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

        <div className="relative w-full max-w-5xl flex flex-col md:flex-row bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden animate-fade-in">

          {/* Left Side: Aesthetic Branding */}
          <div className="md:w-5/12 hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-[#f8edeb] via-[#fae1dd] to-[#f8edeb] text-slate-800 relative">
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/50 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-white/80">Sustainable Choice</span>
              <h1 className="text-4xl font-bold mb-6 leading-tight tracking-tight text-slate-900">Style meeting<br />Responsibility.</h1>
              <p className="text-base text-slate-600 mb-8 font-medium leading-relaxed">Curated outfits for those who value elegance and the planet.</p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-7/12 w-full px-8 py-12 md:px-16 md:py-20 flex flex-col justify-center bg-white/80">
            <div className="max-w-md w-full mx-auto">
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Welcome Back</h2>
                <p className="text-slate-500 font-medium text-base">Sign in to your account.</p>
              </div>

              {serverError && (
                <div className="flex items-center gap-3 text-rose-600 text-sm mb-8 bg-rose-50 p-4 rounded-xl border border-rose-100">
                  <p className="font-semibold">{serverError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      className={`w-full bg-slate-50 border ${errors.email ? 'border-rose-300' : 'border-slate-200'} p-3.5 rounded-xl pl-11 focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({});
                        setServerError("");
                      }}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="text-rose-500 text-xs font-medium mt-1">{errors.email}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700">Password</label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">Forgot Password?</Link>
                  </div>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={`w-full bg-slate-50 border ${errors.password ? 'border-rose-300' : 'border-slate-200'} p-3.5 rounded-xl pl-11 focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors({});
                        setServerError("");
                      }}
                      autoComplete="current-password"
                    />
                  </div>
                  {errors.password && <p className="text-rose-500 text-xs font-medium mt-1">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all shadow-md disabled:opacity-70 mt-2"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{" "}
                  <Link to="/createAccount" className="font-semibold text-slate-900 hover:text-slate-700 transition-colors">
                    Sign up now
                  </Link>
                </p>
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