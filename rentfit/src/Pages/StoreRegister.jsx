import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { FaEnvelope, FaLock, FaUser, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const StoreRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    owner_name: "",
    email: "",
    phone_number: "",
    store_name: "",
    store_address: "",
    city: "",
    store_description: "",
    store_logo: null,
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
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
    // Client-side validation
    if (!formData.store_name) {
      setError("Store name is required");
      return;
    }
    if (!formData.owner_name) {
      setError("Owner name is required");
      return;
    }
    if (!formData.email) {
      setError("Email is required");
      return;
    }
    if (!formData.password) {
      setError("Password is required");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("store_name", formData.store_name);
      formDataToSend.append("owner_name", formData.owner_name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("phone_number", formData.phone_number || "");
      formDataToSend.append("store_address", formData.store_address);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("store_description", formData.store_description || "");
      if (formData.store_logo) {
        formDataToSend.append("store_logo", formData.store_logo);
      }

      const response = await axiosInstance.post("accounts/register/store/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const successMsg = "Store registered! Please verify OTP.";
      setMessage(successMsg);
      setStep(3); // Move to OTP verification step
    } catch (error) {
      console.error("Network Error:", error);
      let errorMsg = "Registration failed. Please try again.";
      const errorData = error.response?.data;

      if (errorData) {
        if (errorData.email) {
          errorMsg = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
        } else if (errorData.phone_number) {
          errorMsg = Array.isArray(errorData.phone_number) ? errorData.phone_number[0] : errorData.phone_number;
        } else if (errorData.store_name) {
          errorMsg = Array.isArray(errorData.store_name) ? errorData.store_name[0] : errorData.store_name;
        } else if (errorData.password) {
          errorMsg = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.error) {
          errorMsg = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
      }

      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axiosInstance.post("accounts/verify-otp/", {
        email: formData.email,
        otp: otp,
      });

      // Add authentication for navbar
      if (response.data.access_token) {
        localStorage.setItem("authToken", response.data.access_token);
        localStorage.setItem("userType", "store");
        window.dispatchEvent(new Event('authChange'));
      }

      setMessage("Account verified successfully! Redirecting to login...");
      // Redirect to login page
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("OTP Verification Error:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Invalid OTP. Please try again.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    // Note: Resend OTP endpoint may need to be implemented in backend
    setError("Please use the OTP sent to your email. If you didn't receive it, try registering again.");
    setOtp("");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 relative bg-[#fdfcfb] overflow-hidden">
        
        {/* Left Section: Aesthetic Branding & Progress */}
        <div className="hidden lg:flex flex-col justify-center px-16 xl:px-24 bg-white/30 backdrop-blur-md text-slate-800 relative h-full border-r border-slate-100">
           {/* Aesthetic Blobs */}
          <div className="absolute top-0 -left-10 w-96 h-96 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute bottom-0 -right-10 w-96 h-96 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
          
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/80 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-slate-100 text-slate-400">Merchant Portal</span>
            <h1 className="text-5xl font-black mb-8 leading-tight tracking-tight text-slate-900 italic">
              Empower your<br />Inventory.
            </h1>
            <p className="text-xl text-slate-500 mb-12 font-medium max-w-md leading-relaxed">
              Join the future of circular fashion as a premium partner store.
            </p>
            
            {/* Progress Indicator */}
            <div className="space-y-10">
               {[
                 { s: 1, title: "Store Identity", desc: "Basic details & location" },
                 { s: 2, title: "Security", desc: "Access credentials" },
                 { s: 3, title: "Verification", desc: "OTP authentication" }
               ].map((item) => (
                 <div key={item.s} className={`flex items-start gap-4 transition-all duration-500 ${step >= item.s ? 'opacity-100 translate-x-2' : 'opacity-30'}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border-2 ${step >= item.s ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-400'}`}>
                       {step > item.s ? '✓' : `0${item.s}`}
                    </div>
                    <div>
                       <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-900">{item.title}</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="absolute bottom-12 left-16 xl:left-24 text-slate-300 text-[10px] font-black tracking-[0.3em] uppercase">
            RentFit / Partner Network
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="flex items-center justify-center bg-white/50 backdrop-blur-sm px-6 py-12 lg:py-20 overflow-y-auto">
          <div className="w-full max-w-lg animate-fade-in">
            
            {message && (
              <div className="flex items-center gap-3 text-emerald-600 text-[11px] font-black uppercase tracking-widest mb-8 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <p>{message}</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 text-rose-600 text-[11px] font-black uppercase tracking-widest mb-8 bg-rose-50 p-4 rounded-2xl border border-rose-100 animate-shake">
                <p>{error}</p>
              </div>
            )}

            {step === 1 && (
              <div>
                <div className="mb-10">
                  <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter italic">Store Persona</h2>
                  <p className="text-slate-500 font-medium uppercase text-[11px] tracking-widest">Partner Registration</p>
                </div>

                <form className="space-y-5">
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Founder Name</label>
                    <input
                      type="text"
                      name="owner_name"
                      placeholder="NAME"
                      value={formData.owner_name}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Store Name</label>
                    <input
                      type="text"
                      name="store_name"
                      placeholder="LUXE RENTALS"
                      value={formData.store_name}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Official Email</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="STORE@EXAMPLE.COM"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border-2 border-slate-50 p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider"
                      />
                    </div>

                    <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Business Line</label>
                      <input
                        type="tel"
                        name="phone_number"
                        placeholder="OFFICE"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border-2 border-slate-50 p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">HQ Location / City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="CITY"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Store Address Detail</label>
                    <textarea
                      name="store_address"
                      placeholder="HQ STREET ADDRESS"
                      rows="2"
                      value={formData.store_address}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider"
                    ></textarea>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Brand Narrative</label>
                    <textarea
                      name="store_description"
                      placeholder="A SHORT STORY OF YOUR COLLECTION..."
                      rows="2"
                      value={formData.store_description}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-3 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-xs uppercase tracking-wider"
                    ></textarea>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Store Logo (Optional)</label>
                    <input
                      type="file"
                      name="store_logo"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-2 rounded-xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-600 text-[11px] uppercase tracking-wider file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-100 group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">Next Step <span className="text-lg">→</span></span>
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-200 to-amber-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="w-full mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                      Cancel / Sign In
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <div className="mb-10">
                  <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter italic">Vault Access</h2>
                  <p className="text-slate-500 font-medium uppercase text-[11px] tracking-widest">Establish Security</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-8">
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-sm"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Identity</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:outline-none focus:border-rose-100 focus:bg-white transition-all font-medium text-slate-900 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-4 pt-8">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 group relative overflow-hidden"
                    >
                      <span className="relative z-10">{isLoading ? "Deploying..." : "Finalize Infrastructure"}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-200 to-amber-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mt-4 flex items-center justify-center gap-2 hover:text-slate-600 transition-colors"
                    >
                      <span>←</span> Return to Details
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="text-center max-w-sm mx-auto animate-fade-in">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-teal-100">
                   <FaEnvelope className="text-teal-400 text-2xl" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter italic">Verify Partner</h2>
                <p className="text-slate-500 font-medium mb-12 leading-relaxed text-sm">
                  Identity link shared to <span className="text-slate-900 font-black">{formData.email}</span>.
                </p>

                {error && (
                  <div className="text-rose-400 text-[10px] font-black uppercase tracking-widest mb-8 animate-shake">
                    {error}
                  </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }} className="space-y-10">
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
                    {isLoading ? "Validating..." : "Synchronize & Launch"}
                  </button>
                </form>

                <div className="mt-12 flex flex-col gap-8">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Link expired?{" "}
                    <button
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-slate-900 hover:text-rose-400 transition-colors"
                    >
                      Refresh Link
                    </button>
                  </p>
                  
                  <button
                    onClick={() => setStep(2)}
                    className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2 hover:text-slate-600 transition-colors"
                  >
                    <span>←</span> Edit Security Settings
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

export default StoreRegister;