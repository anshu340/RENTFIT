import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
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

    try {
      console.log("Attempting login with:", { email }); // Debug log
      
      const response = await axiosInstance.post("login/", { 
        email, 
        password 
      });
      
      console.log("Login response:", response.data); // Debug log
      const { user, access_token, refresh_token } = response.data;

      // Store tokens and user info
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("isLoggedIn", "true");

      toast.success("Login successful!");

      // Navigate based on role
      if (user.role === "Customer") {
        navigate("/dashboard");
      } else if (user.role === "Store") {
        navigate("/storeDashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login Error:", err);
      console.error("Error response:", err?.response?.data);
      
      // Django returns "error" field, not "message"
      const message = 
        err?.response?.data?.error || 
        err?.response?.data?.detail || 
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      
      setServerError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
          <div className="md:w-1/2 hidden md:block bg-gradient-to-br from-blue-500 to-blue-700"></div>
          <div className="md:w-1/2 w-full px-8 py-10 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-blue-800 mb-2 text-center">Welcome Back</h2>
            <p className="text-gray-600 mb-6 text-center">Login to your account</p>
            
            {serverError && (
              <div className="text-red-600 text-sm text-center mb-4 bg-red-50 p-3 rounded-lg">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border p-3 rounded-md pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({});
                    setServerError("");
                  }}
                  autoComplete="email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border p-3 rounded-md pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({});
                    setServerError("");
                  }}
                  autoComplete="current-password"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-800 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-sm text-center text-gray-600 mt-6">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-blue-800 font-semibold cursor-pointer hover:underline"
              >
                Register here
              </span>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;