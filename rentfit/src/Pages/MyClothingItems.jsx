import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaTshirt, FaStore, FaTrash, FaEdit, FaEye, FaCheckCircle, FaTimesCircle, FaClock, FaDollarSign, FaBox } from "react-icons/fa";

const MyClothingItems = () => {
  const navigate = useNavigate();
  const [clothingItems, setClothingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchClothingItems();
  }, []);

  const fetchClothingItems = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("clothing/my/");
      if (response.data) {
        setClothingItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching clothing items:", error);
      setMessage({ type: "error", text: "Failed to load clothing items. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const response = await axiosInstance.get(`clothing/${id}/`);
      if (response.data) {
        setSelectedItem(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error fetching clothing item detail:", error);
      setMessage({ type: "error", text: "Failed to load item details." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this clothing item?")) {
      return;
    }

    try {
      await axiosInstance.delete(`clothing/${id}/delete/`);
      setMessage({ type: "success", text: "Clothing item deleted successfully" });
      fetchClothingItems(); // Refresh list
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error deleting clothing item:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to delete item";
      setMessage({ type: "error", text: errorMessage });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleEdit = (id) => {
    navigate(`/add-clothing?edit=${id}`);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axiosInstance.patch(`clothing/${id}/status/`, { clothing_status: newStatus });
      setMessage({ type: "success", text: "Status updated successfully" });
      fetchClothingItems(); // Refresh list
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error updating status:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to update status";
      setMessage({ type: "error", text: errorMessage });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Available: { color: "bg-green-100 text-green-800", icon: FaCheckCircle },
      Rented: { color: "bg-blue-100 text-blue-800", icon: FaClock },
      Unavailable: { color: "bg-red-100 text-red-800", icon: FaTimesCircle },
    };

    const config = statusConfig[status] || statusConfig.Available;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="text-xs" />
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clothing items...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaTshirt className="text-purple-600 text-xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">My Clothing Items</h1>
            </div>
            <button
              onClick={() => navigate("/add-clothing")}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              + Add New Item
            </button>
          </div>

          {/* Message Display */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {clothingItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <FaTshirt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Clothing Items Yet</h2>
              <p className="text-gray-600 mb-6">Start adding your clothing items to the rental platform!</p>
              <button
                onClick={() => navigate("/add-clothing")}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Add Your First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clothingItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {item.images && (
                    <img
                      src={item.images}
                      alt={item.item_name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800 truncate">
                        {item.item_name}
                      </h3>
                      {getStatusBadge(item.clothing_status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <FaDollarSign className="text-purple-600" />
                        <span className="font-semibold text-purple-600">${item.rental_price}/day</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Category:</span> {item.category}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Size:</span> {item.size} |{" "}
                        <span className="font-medium">Condition:</span> {item.condition}
                      </div>
                      <div className="text-xs text-gray-500">
                        Added: {formatDate(item.created_at)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(item.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100 transition text-sm font-medium"
                      >
                        <FaEye />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    {/* Status Update Buttons */}
                    {item.clothing_status !== 'Rented' && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-600 mb-2">Change Status:</p>
                        <div className="flex gap-2">
                          {item.clothing_status !== 'Available' && (
                            <button
                              onClick={() => handleStatusUpdate(item.id, 'Available')}
                              className="flex-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition"
                            >
                              Available
                            </button>
                          )}
                          {item.clothing_status !== 'Unavailable' && (
                            <button
                              onClick={() => handleStatusUpdate(item.id, 'Unavailable')}
                              className="flex-1 text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition"
                            >
                              Unavailable
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Item Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {selectedItem.images && (
                <img
                  src={selectedItem.images}
                  alt={selectedItem.item_name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedItem.item_name}
                  </h3>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedItem.clothing_status)}
                    <span className="text-lg font-bold text-purple-600">
                      ${selectedItem.rental_price}/day
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium">{selectedItem.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium">{selectedItem.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Size</p>
                    <p className="font-medium">{selectedItem.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Condition</p>
                    <p className="font-medium">{selectedItem.condition}</p>
                  </div>
                </div>

                {selectedItem.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-800">{selectedItem.description}</p>
                  </div>
                )}

                <div className="border-t pt-4 text-sm text-gray-600">
                  <p>Created: {formatDate(selectedItem.created_at)}</p>
                  <p>Updated: {formatDate(selectedItem.updated_at)}</p>
                </div>

                {/* Action Buttons in Modal */}
                <div className="border-t pt-4 flex gap-3">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEdit(selectedItem.id);
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Edit Item
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleDelete(selectedItem.id);
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Delete Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default MyClothingItems;