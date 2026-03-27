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
    profile_image: null,
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === "profile_image") {
      setFormData({ ...formData, profile_image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

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
    // Note: Resend OTP endpoint may need to be implemented in backend
    setServerError("Please use the OTP sent to your email. If you didn't receive it, try registering again.");
    setOtp("");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 relative bg-[#fdfcfb] overflow-hidden">
        
        {/* Left Section: Aesthetic Branding */}
        <div className="hidden lg:flex flex-col justify-center px-16 xl:px-24 bg-white/30 backdrop-blur-md text-slate-800 relative h-full border-r border-slate-100">
           {/* Aesthetic Blobs */}
          <div className="absolute top-0 -left-10 w-96 h-96 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute top-1/2 -right-10 w-96 h-96 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
          
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/80 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-slate-100 text-slate-400">Step {step} of 2</span>
            <h1 className="text-5xl font-black mb-8 leading-tight tracking-tight text-slate-900 italic">
              {step === 1 ? "The Beginnings of Style." : "Finalize your Presence."}
            </h1>
            <p className="text-xl text-slate-500 mb-12 font-medium max-w-md leading-relaxed">
              {step === 1
                ? "Join our curated collective where fashion meets sustainability in every thread."
                : "A secure verification step to ensure your style journey remains personal and protected."}
            </p>
            
            <div className="space-y-6">
               {[
                 { title: "Personalized Feed", color: "rose-400" },
                 { title: "Secure Rentals", color: "teal-400" },
                 { title: "Impact Tracking", color: "amber-400" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full bg-${item.color}`}></div>
                    <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-400">{item.title}</h3>
                 </div>
               ))}
            </div>
          </div>

          <div className="absolute bottom-12 left-16 xl:left-24 text-slate-300 text-[10px] font-black tracking-[0.3em] uppercase">
            RentFit / Aesthetic Collective
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="flex items-center justify-center bg-white/50 backdrop-blur-sm px-6 py-12 lg:py-20 overflow-y-auto">
          <div className="w-full max-w-lg animate-fade-in">
            {step === 1 ? (
              <div>
                <div className="mb-10">
                  <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter italic">Create Identity</h2>
                  <p className="text-slate-500 font-medium uppercase text-[11px] tracking-widest">Customer Registration</p>
                </div>

                {serverError && (
                  <div className="flex items-center gap-3 text-rose-600 text-[11px] font-black uppercase tracking-widest mb-8 bg-rose-50 p-4 rounded-2xl border border-rose-100">
                    <p>{serverError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        placeholder="ALEX DOE"
                        value={formData.full_name}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border-2 ${errors.full_name ? 'border-rose-100' : 'border-slate-50'} p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider`}
                      />
                      {errors.full_name && <p className="text-rose-400 text-[9px] font-black mt-2 ml-1 uppercase tracking-widest">{errors.full_name}</p>}
                    </div>

                    <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contact</label>
                      <input
                        type="tel"
                        name="phone_number"
                        placeholder="MOBILE"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border-2 ${errors.phone_number ? 'border-rose-100' : 'border-slate-50'} p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider`}
                      />
                      {errors.phone_number && <p className="text-rose-400 text-[9px] font-black mt-2 ml-1 uppercase tracking-widest">{errors.phone_number}</p>}
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Work Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="EMAIL@EXAMPLE.COM"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 border-2 ${errors.email ? 'border-rose-100' : 'border-slate-50'} p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider`}
                    />
                    {errors.email && <p className="text-rose-400 text-[9px] font-black mt-2 ml-1 uppercase tracking-widest">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Location</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="CITY"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border-2 ${errors.city ? 'border-rose-100' : 'border-slate-50'} p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border-2 border-slate-50 p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-600 text-xs uppercase tracking-widest appearance-none cursor-pointer"
                        >
                          <option value="">SELECT</option>
                          <option value="Male">MALE</option>
                          <option value="Female">FEMALE</option>
                          <option value="Other">OTHER</option>
                        </select>
                      </div>

                      <div className="group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Clothing Size</label>
                        <select
                          name="preferred_clothing_size"
                          value={formData.preferred_clothing_size}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border-2 border-slate-50 p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-600 text-xs uppercase tracking-widest appearance-none cursor-pointer"
                        >
                          <option value="">SELECT SIZE</option>
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

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Address Detail</label>
                    <textarea
                      name="address"
                      placeholder="DETAILED ADDRESS"
                      rows="2"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider"
                    ></textarea>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Profile Picture (Optional)</label>
                    <input
                      type="file"
                      name="profile_image"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-2 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-600 text-[11px] uppercase tracking-wider file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Security</label>
                      <input
                        type="password"
                        name="password"
                        placeholder="PASSWORD"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border-2 ${errors.password ? 'border-rose-100' : 'border-slate-50'} p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider`}
                      />
                    </div>

                    <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="REPEAT"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full bg-slate-50 border-2 ${errors.confirmPassword ? 'border-rose-100' : 'border-slate-50'} p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-100 group relative overflow-hidden"
                    >
                      <span className="relative z-10">{isLoading ? "Processing..." : "Continue"}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-200 to-amber-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                    
                    <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Already registered?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-slate-900 hover:text-rose-400 transition-colors underline underline-offset-4"
                      >
                        Sign In Here
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center max-w-sm mx-auto">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-teal-100">
                   <FaEnvelope className="text-teal-400 text-2xl" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter italic">Confirm Identity</h2>
                <p className="text-slate-500 font-medium mb-12 leading-relaxed text-sm">
                  We've shared a unique 6-digit code to <span className="text-slate-900 font-black">{formData.email}</span>.
                </p>

                {serverError && (
                   <div className="text-rose-400 text-[10px] font-black uppercase tracking-widest mb-8 animate-shake">
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="space-y-10">
                  <div className="flex justify-center">
                    <input
                      type="text"
                      name="otp"
                      placeholder="0 0 0 0 0 0"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-6 rounded-3xl text-center text-4xl font-black tracking-[0.6em] focus:outline-none focus:border-teal-100 focus:bg-white transition-all shadow-inner text-slate-900 placeholder:text-slate-200"
                      maxLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 disabled:opacity-50"
                  >
                    {isLoading ? "Verifying..." : "Verify & Enter"}
                  </button>
                </form>

                <div className="mt-12 flex flex-col gap-8">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Code not received?{" "}
                    <button
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-slate-900 hover:text-rose-400 transition-colors"
                    >
                      Resend Now
                    </button>
                  </p>
                  
                  <button
                    onClick={() => setStep(1)}
                    className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2 hover:text-slate-600 transition-colors"
                  >
                    <span>←</span> Edit Identity
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserRegister;