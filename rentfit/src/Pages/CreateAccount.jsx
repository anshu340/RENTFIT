import React from "react";
import { FaUser, FaStore } from "react-icons/fa6";
import { useNavigate, Link } from "react-router-dom";

const CreateAccount = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb] relative overflow-hidden px-4 py-20">
      {/* Aesthetic Background Blobs - Soft Pastels */}
      <div className="absolute top-0 -left-10 w-[30rem] h-[30rem] bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-10 w-[30rem] h-[30rem] bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-40 w-[30rem] h-[30rem] bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Main Card */}
      <div className="relative bg-white/40 backdrop-blur-xl max-w-5xl w-full rounded-[3rem] border border-white/60 shadow-xl overflow-hidden px-6 py-16 md:px-16 md:py-20 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-white/50 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/80 text-slate-400">Join the Collective</span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter italic">
            Define your Path.
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-md mx-auto">
            Choose how you wish to engage with our sustainable fashion ecosystem.
          </p>
        </div>

        {/* Account Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">

          {/* Customer */}
          <div 
            onClick={() => navigate('/userRegister')}
            className="group relative bg-white/80 rounded-[2.5rem] p-10 text-center cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-rose-100"
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
              <FaUser className="text-rose-500 text-3xl" />
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
              Customer
            </h2>

            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Find and rent outfits for any occasion while supporting zero-waste fashion.
            </p>

            <div className="inline-flex items-center justify-center px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest group-hover:bg-rose-500 transition-colors shadow-lg shadow-slate-200 group-hover:shadow-rose-100">
              Enter as Renter
            </div>
            
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-400">
                  <span className="font-bold">→</span>
               </div>
            </div>
          </div>

          {/* Store */}
          <div 
            onClick={() => navigate('/storeRegister')}
            className="group relative bg-white/80 rounded-[2.5rem] p-10 text-center cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-teal-100"
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
              <FaStore className="text-teal-500 text-3xl" />
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
              Partner
            </h2>

            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Monetize your inventory and grow your business within our rental network.
            </p>

            <div className="inline-flex items-center justify-center px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest group-hover:bg-teal-500 transition-colors shadow-lg shadow-slate-200 group-hover:shadow-teal-100">
              Enter as Store
            </div>

            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-400">
                  <span className="font-bold">→</span>
               </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-slate-100">
          <p className="text-slate-400 font-medium">
            Already have an account?{" "}
            <Link 
              to="/login"
              className="text-slate-900 font-black hover:text-rose-400 underline underline-offset-8 transition-colors uppercase text-[10px] tracking-widest ml-2"
            >
              Sign In Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default CreateAccount;