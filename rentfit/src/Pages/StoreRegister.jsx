import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUser, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const StoreRegister = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/accounts/register/store/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          password: formData.password,
          is_store: true,
        }),
      });

      const data = await res.json();
      setMessage(data.message || "Store registered! Please verify OTP.");
    } catch (err) {
      console.error(err);
      setMessage("Registration failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Section */}
      <div className="hidden lg:flex flex-col justify-center px-20 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white">
        <h1 className="text-4xl font-bold mb-4">Join the Fashion Revolution</h1>
        <p className="text-purple-100 mb-8 max-w-md">
          Create your store account, list outfits, and reach customers nearby.
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center bg-gray-50 px-6 py-8">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-10">
          <h2 className="text-2xl font-bold mb-4 text-center">Register as Store</h2>
          {message && <p className="text-red-500 text-center mb-4">{message}</p>}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="text"
                  name="name"
                  placeholder="Store Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg pl-10"
                />
              </div>

              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg pl-10"
                />
              </div>

              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg pl-10"
                />
              </div>

              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg pl-10"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:opacity-90"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg pl-10"
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg pl-10"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:opacity-90"
              >
                Create Account
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreRegister;
