import React, { useState, useEffect } from "react";
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
    citizenship_image: null,
    business_card_image: null,
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
    setError("");
    setMessage("");
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

  // Step 2: Submit registration and get OTP
  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (!formData.citizenship_image || !formData.business_card_image) {
      setError("Citizenship Image and Business Card are required.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "confirmPassword" && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      await axiosInstance.post("accounts/register/store/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStep(3);
    } catch (err) {
      const errorMsg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.error ||
        "Registration failed. Please check your details.";
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

    try {
      await axiosInstance.post("accounts/verify-otp/", {
        email: formData.email,
        otp: otp,
      });

      setMessage("Account registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Invalid OTP. Please try again.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("accounts/resend-otp/", {
        email: formData.email,
      });

      setMessage("OTP resent successfully!");
      setCanResend(false);
      setResendTimer(30);
    } catch (error) {
      console.error("Resend OTP Error:", error);
      const message = error.response?.data?.error || "Failed to resend OTP. Please try again.";
      setError(message);

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
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 bg-white/50 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-white/80">Step {step} of 3</span>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight text-slate-900">
                {step === 1 && "Start your store journey."}
                {step === 2 && "Secure your store."}
                {step === 3 && "Verify your identity."}
              </h2>
              <p className="text-base lg:text-lg text-slate-600 mb-8 font-medium leading-relaxed">
                Join the future of circular fashion. Monetize your wardrobe as a premium partner in our trusted network.
              </p>
            </div>
          </div>

          {/* Right Section: Form */}
          <div className="lg:w-7/12 w-full px-6 py-12 sm:px-12 lg:px-16 flex flex-col justify-center bg-white/80">
            <div className="max-w-xl w-full mx-auto">
              
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Partner Registration</h2>
                <p className="text-slate-500 font-medium text-sm">
                  {step === 1 && "Complete your store details to begin."}
                  {step === 2 && "Setup your access credentials."}
                  {step === 3 && "Final verification step."}
                </p>
              </div>

              {message && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-3">
                  {message}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 text-rose-600 text-sm mb-6 bg-rose-50 p-4 rounded-xl border border-rose-100">
                  <p className="font-semibold">{error}</p>
                </div>
              )}

              {step === 1 && (
                <form className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Founder Name</label>
                      <input
                        type="text"
                        name="owner_name"
                        placeholder="Alex Doe"
                        value={formData.owner_name}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Store Name</label>
                      <input
                        type="text"
                        name="store_name"
                        placeholder="Luxe Rentals"
                        value={formData.store_name}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Official Email</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="store@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business Phone</label>
                      <input
                        type="tel"
                        name="phone_number"
                        placeholder="000-000-0000"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="City / Region"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Store Address Detail</label>
                      <input
                        type="text"
                        name="store_address"
                        placeholder="Street Address"
                        value={formData.store_address}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Store Description (Optional)</label>
                    <textarea
                      name="store_description"
                      placeholder="A short description of your store and what you sell..."
                      rows="2"
                      value={formData.store_description}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm"
                    ></textarea>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Verification Documents</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Citizenship Copy *</label>
                      <input
                        type="file"
                        name="citizenship_image"
                        accept="image/*"
                        required
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-slate-200 hover:file:bg-slate-300 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Business Reg. Document *</label>
                      <input
                        type="file"
                        name="business_card_image"
                        accept="image/*"
                        required
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-slate-200 hover:file:bg-slate-300 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Store Logo (Optional)</label>
                      <input
                        type="file"
                        name="store_logo"
                        accept="image/*"
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-slate-200 hover:file:bg-slate-300 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-all font-medium disabled:opacity-70"
                    >
                      Continue to Security
                    </button>
                    <div className="text-center mt-6">
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        Cancel / Log In
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {step === 2 && (
                <div className="animate-fade-in">
                  <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-900 text-sm"
                      />
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-200 text-center">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-70"
                      >
                        {isLoading ? "Registering..." : "Complete Registration"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mt-6 block w-full"
                      >
                        ← Back to Details
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {step === 3 && (
                <div className="text-center max-w-sm mx-auto animate-fade-in">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                    <FaEnvelope className="text-2xl" />
                  </div>
                  <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                    We've sent a 6-digit verification code to <br /><span className="font-semibold text-slate-900">{formData.email}</span>.
                  </p>

                  <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }} className="space-y-6">
                    <input
                      type="text"
                      name="otp"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-center text-3xl font-bold tracking-[0.5em] focus:outline-none focus:border-slate-900 transition-all"
                      maxLength={6}
                    />

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-70"
                    >
                      {isLoading ? "Verifying..." : "Verify Identity"}
                    </button>
                  </form>

                  <div className="mt-8 space-y-4">
                    <p className="text-sm text-slate-500">
                      Didn't receive code?{" "}
                      <button
                        onClick={handleResendOtp}
                        disabled={isLoading || !canResend}
                        className={`font-semibold text-slate-900 hover:text-slate-700 transition-colors ${!canResend ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Now"}
                      </button>
                    </p>

                    <button
                      onClick={() => setStep(2)}
                      className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors block w-full mt-2"
                    >
                      ← Back to Security
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

export default StoreRegister;