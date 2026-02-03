import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import donationAxios from "../services/donationAxios";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import DonationSteps from "../Components/DonationSteps";
import { FaTshirt, FaStore, FaImage, FaLock, FaUserPlus, FaSignInAlt } from "react-icons/fa";

const DonateClothing = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState({
    store_id: "",
    item_name: "",
    category: "",
    gender: "",
    size: "",
    condition: "",
    description: "",
    images: null,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (token) {
      setIsAuthenticated(true);
      if (role === "Store") {
        // Store accounts shouldn't be donating, but we'll show them steps
        // Maybe redirect them if they try to access the form section specifically
      } else {
        fetchStores();
      }
    }
  }, []);

  const fetchStores = async () => {
    try {
      setIsLoadingStores(true);
      const response = await donationAxios.get("donations/stores/");
      if (response.data && response.data.stores) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      // Only show error message if user is authenticated and not a store
      const role = localStorage.getItem("role");
      if (role !== "Store") {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Token might be expired
          setIsAuthenticated(false);
        } else {
          setMessage({ type: "error", text: "Failed to load stores. Please try again." });
        }
      }
    } finally {
      setIsLoadingStores(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Safety check for role
    const role = localStorage.getItem("role");
    if (role === "Store") {
      alert("Store accounts cannot make donations.");
      return;
    }

    setErrors({});
    setMessage({ type: "", text: "" });

    // Validation
    const validationErrors = {};
    if (!formData.store_id) validationErrors.store_id = "Please select a store";
    if (!formData.item_name) validationErrors.item_name = "Item name is required";
    if (!formData.category) validationErrors.category = "Category is required";
    if (!formData.gender) validationErrors.gender = "Gender is required";
    if (!formData.size) validationErrors.size = "Size is required";
    if (!formData.condition) validationErrors.condition = "Condition is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("store_id", formData.store_id);
      formDataToSend.append("item_name", formData.item_name);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("size", formData.size);
      formDataToSend.append("condition", formData.condition);
      if (formData.description) formDataToSend.append("description", formData.description);
      if (formData.images) formDataToSend.append("images", formData.images);

      const response = await donationAxios.post("donations/create/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({ type: "success", text: "Donation submitted successfully! The store will review it." });
      setTimeout(() => {
        navigate("/mydonations");
      }, 2000);
    } catch (error) {
      console.error("Donation submission error:", error);
      let errorMessage = "Failed to submit donation. Please try again.";
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.store_id) {
          errorMessage = Array.isArray(errorData.store_id) ? errorData.store_id[0] : errorData.store_id;
        } else if (errorData.item_name) {
          errorMessage = Array.isArray(errorData.item_name) ? errorData.item_name[0] : errorData.item_name;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const userRole = localStorage.getItem("role");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Give Your Clothes a <span className="text-purple-600">New Life</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join RentFit's sustainable fashion movement. Donate your gently used clothes
              and help us reduce textile waste while supporting others.
            </p>
          </div>

          {/* Donation Steps Component - Always Visible */}
          <DonationSteps />

          <div className="max-w-3xl mx-auto">
            {/* Conditional Rendering: Form or CTA */}
            {isAuthenticated && userRole === "Customer" ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-purple-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <FaTshirt className="text-2xl" />
                    <h2 className="text-2xl font-bold">Donation Form</h2>
                  </div>
                  <p className="text-purple-100 mt-1">Provide details of the item you wish to donate.</p>
                </div>

                <div className="p-8">
                  {/* Message Display */}
                  {message.text && (
                    <div
                      className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`} />
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Store Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaStore className="inline mr-2 text-purple-600" />
                        Select Store *
                      </label>
                      {isLoadingStores ? (
                        <div className="p-4 border border-dashed rounded-xl bg-gray-50 text-gray-500 animate-pulse">
                          Finding available stores...
                        </div>
                      ) : (
                        <select
                          name="store_id"
                          value={formData.store_id}
                          onChange={handleChange}
                          className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${errors.store_id ? "border-red-500" : "border-gray-200"
                            }`}
                        >
                          <option value="">-- Select a store near you --</option>
                          {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                              {store.store_name} {store.city ? `- ${store.city}` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.store_id && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.store_id}</p>
                      )}
                    </div>

                    {/* Item Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        name="item_name"
                        placeholder="e.g., Vintage Silk Dress"
                        value={formData.item_name}
                        onChange={handleChange}
                        className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${errors.item_name ? "border-red-500" : "border-gray-200"
                          }`}
                      />
                      {errors.item_name && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.item_name}</p>
                      )}
                    </div>

                    {/* Category and Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${errors.category ? "border-red-500" : "border-gray-200"
                            }`}
                        >
                          <option value="">-- Select category --</option>
                          <option value="Shirt">Shirt</option>
                          <option value="Pants">Pants</option>
                          <option value="Dress">Dress</option>
                          <option value="Jacket">Jacket</option>
                          <option value="Skirt">Skirt</option>
                          <option value="Shoes">Shoes</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.category && (
                          <p className="text-red-500 text-xs mt-1 font-medium">{errors.category}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${errors.gender ? "border-red-500" : "border-gray-200"
                            }`}
                        >
                          <option value="">-- Select gender --</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Unisex">Unisex</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.gender && (
                          <p className="text-red-500 text-xs mt-1 font-medium">{errors.gender}</p>
                        )}
                      </div>
                    </div>

                    {/* Size and Condition */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Size *
                        </label>
                        <input
                          type="text"
                          name="size"
                          placeholder="e.g., M, L, 40 etc."
                          value={formData.size}
                          onChange={handleChange}
                          className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${errors.size ? "border-red-500" : "border-gray-200"
                            }`}
                        />
                        {errors.size && (
                          <p className="text-red-500 text-xs mt-1 font-medium">{errors.size}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Condition *
                        </label>
                        <select
                          name="condition"
                          value={formData.condition}
                          onChange={handleChange}
                          className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${errors.condition ? "border-red-500" : "border-gray-200"
                            }`}
                        >
                          <option value="">-- Select condition --</option>
                          <option value="New">New</option>
                          <option value="Like New">Like New</option>
                          <option value="Good">Good</option>
                          <option value="Used">Used</option>
                        </select>
                        {errors.condition && (
                          <p className="text-red-500 text-xs mt-1 font-medium">{errors.condition}</p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        name="description"
                        placeholder="Briefly describe the item (brand, fabric, etc.)..."
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaImage className="inline mr-2 text-purple-600" />
                        Item Photo
                      </label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FaImage className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 font-medium">
                              {formData.images ? formData.images.name : "Click to upload garment photo"}
                            </p>
                          </div>
                          <input
                            type="file"
                            name="images"
                            accept="image/*"
                            onChange={handleChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={isLoading || isLoadingStores}
                        className="flex-1 bg-purple-600 text-white p-4 rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
                      >
                        {isLoading ? "Submitting Request..." : "Submit Donation Pledge"}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/mydonations")}
                        className="px-8 bg-gray-100 text-gray-700 p-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : userRole === "Store" ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaLock className="text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Store Account Restricted</h2>
                <p className="text-gray-600 mb-6">
                  Only Customer accounts can pledge donations. If you'd like to donate, please use a customer account.
                </p>
                <button
                  onClick={() => navigate("/storeDashboard")}
                  className="bg-amber-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-700 transition"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center shadow-lg">
                <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaLock className="text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Want to donate your clothes?</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Please login or create an account to start your donation journey and help build a sustainable future.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition transform hover:-translate-y-1 shadow-md shadow-purple-200"
                  >
                    <FaSignInAlt /> Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 bg-white text-purple-600 border-2 border-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-purple-50 transition transform hover:-translate-y-1 shadow-sm"
                  >
                    <FaUserPlus /> Join RentFit
                  </Link>
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

export default DonateClothing;
