import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!email) validationErrors.email = "Email is required";
    if (!password) validationErrors.password = "Password is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await axiosInstance.post("login/", { email, password });
      const { user, access_token, refresh_token } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("isLoggedIn", "true");

      toast.success("Login successful!");

      if (user.role === "Customer") navigate("/dashboard");
      else if (user.role === "Store") navigate("/dashboard");
      else navigate("/");
    } catch (err) {
      console.error("Login Error:", err);
      const message = err?.response?.data?.message || "Login failed.";
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
          <div className="md:w-1/2 hidden md:block bg-blue-200"></div>
          <div className="md:w-1/2 w-full px-8 py-10 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-blue-800 mb-2 text-center">Welcome Back</h2>
            <p className="text-gray-600 mb-6 text-center">Login to your account</p>
            {serverError && <div className="text-red-600 text-sm text-center mb-4">{serverError}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="email"
                placeholder="Email"
                className="w-full border p-3 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

              <input
                type="password"
                placeholder="Password"
                className="w-full border p-3 rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}

              <button type="submit" className="w-full bg-blue-800 text-white py-2 rounded-md font-semibold hover:bg-blue-700">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
