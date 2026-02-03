import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import donationAxios from "../services/donationAxios";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaTshirt, FaStore, FaImage } from "react-icons/fa";

const DonateClothing = () => {
  const navigate = useNavigate();
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
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role === "Store") {
      alert("Store accounts cannot make donations.");
      navigate("/storeDashboard");
      return;
    }

    fetchStores();
  }, [navigate]);

  const fetchStores = async () => {
    try {
      setIsLoadingStores(true);
      const response = await donationAxios.get("donations/stores/");
      if (response.data && response.data.stores) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setMessage({ type: "error", text: "You must be logged in as a customer to donate." });
      } else {
        setMessage({ type: "error", text: "Failed to load stores. Please try again." });
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaTshirt className="text-purple-600 text-xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Donate Clothing</h1>
            </div>
            <p className="text-gray-600 mb-8">
              Select a store and provide details about the clothing item you want to donate.
            </p>

            {/* Message Display */}
            {message.text && (
              <div
                className={`mb-6 p-4 rounded-lg ${message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                  }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Store Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaStore className="inline mr-2" />
                  Select Store *
                </label>
                {isLoadingStores ? (
                  <div className="p-3 border rounded-lg bg-gray-50 text-gray-500">
                    Loading stores...
                  </div>
                ) : (
                  <select
                    name="store_id"
                    value={formData.store_id}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.store_id ? "border-red-500" : ""
                      }`}
                  >
                    <option value="">-- Select a store --</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.store_name} {store.city ? `- ${store.city}` : ""}
                      </option>
                    ))}
                  </select>
                )}
                {errors.store_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.store_id}</p>
                )}
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="item_name"
                  placeholder="e.g., Blue Denim Jacket"
                  value={formData.item_name}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.item_name ? "border-red-500" : ""
                    }`}
                />
                {errors.item_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.item_name}</p>
                )}
              </div>

              {/* Category and Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.category ? "border-red-500" : ""
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
                    <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.gender ? "border-red-500" : ""
                      }`}
                  >
                    <option value="">-- Select gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                  )}
                </div>
              </div>

              {/* Size and Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size *
                  </label>
                  <input
                    type="text"
                    name="size"
                    placeholder="e.g., M, L, 42, etc."
                    value={formData.size}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.size ? "border-red-500" : ""
                      }`}
                  />
                  {errors.size && (
                    <p className="text-red-500 text-xs mt-1">{errors.size}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.condition ? "border-red-500" : ""
                      }`}
                  >
                    <option value="">-- Select condition --</option>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Used">Used</option>
                  </select>
                  {errors.condition && (
                    <p className="text-red-500 text-xs mt-1">{errors.condition}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  placeholder="Add any additional details about the item..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaImage className="inline mr-2" />
                  Item Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition">
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full"
                    id="donation_image"
                  />
                  <label htmlFor="donation_image" className="text-sm text-gray-500 cursor-pointer">
                    {formData.images ? formData.images.name : "Click to upload image"}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading || isLoadingStores}
                  className="flex-1 bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Submitting..." : "Submit Donation"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/mydonations")}
                  className="px-6 bg-gray-200 text-gray-700 p-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DonateClothing;