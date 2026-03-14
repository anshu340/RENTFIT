import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverMessage, setServerMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);
    setError("");
    setServerMessage({ text: "", type: "" });

    try {
      const response = await axiosInstance.post("accounts/password/forgot/", {
        email,
      });

      setServerMessage({ text: response.data.message || "OTP sent successfully.", type: "success" });
      
      // Navigate to Reset Password page after a short delay
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 2000);

    } catch (error) {
      console.error("Forgot Password Error:", error);
      const errorData = error.response?.data;
      const message =
        errorData?.error ||
        errorData?.detail ||
        errorData?.message ||
        "Failed to send OTP. Please try again.";

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
              <span className="inline-block px-3 py-1 bg-white/50 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/80">Security First</span>
              <h1 className="text-4xl font-black mb-6 leading-tight tracking-tight text-slate-900 italic">Regain <br />Access.</h1>
              <p className="text-lg text-slate-700 mb-8 font-medium leading-relaxed">It happens to the best of us. We'll send you a recovery code instantly.</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center border border-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Quick Recovery</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center border border-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Secure Process</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-7/12 w-full px-8 py-12 md:px-16 md:py-20 flex flex-col justify-center bg-white/70">
            <div className="max-w-md w-full mx-auto">
              
              <button 
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors mb-8"
              >
                <FaArrowLeft /> Back to Login
              </button>

              <div className="mb-10 text-center md:text-left">
                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Forgot Password</h2>
                <p className="text-slate-500 font-medium text-lg">Enter your email and we'll send you a code.</p>
              </div>

              {serverMessage.text && (
                <div className={`flex items-center gap-3 text-sm mb-8 p-4 rounded-2xl border ${serverMessage.type === 'error' ? 'text-rose-600 bg-rose-50 border-rose-100 animate-shake' : 'text-teal-700 bg-teal-50 border-teal-100'}`}>
                  <p className="font-bold">{serverMessage.text}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      className={`w-full bg-slate-50 border-2 ${error ? 'border-rose-200' : 'border-slate-50'} p-4 rounded-2xl pl-12 focus:outline-none focus:border-blue-200 focus:bg-white transition-all font-medium text-slate-900 text-sm`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                        setServerMessage({ text: "", type: "" });
                      }}
                      autoComplete="email"
                    />
                  </div>
                  {error && <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-100 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden mt-8"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? "Sending Code..." : "Send OTP"}
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

export default ForgotPassword;
