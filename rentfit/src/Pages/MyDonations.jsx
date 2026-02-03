import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import donationAxios from "../services/donationAxios";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaTshirt, FaStore, FaTrash, FaEdit, FaEye, FaCheckCircle, FaTimesCircle, FaClock, FaBox } from "react-icons/fa";

const MyDonations = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      const response = await donationAxios.get("donations/my/");
      if (response.data) {
        setDonations(response.data);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      setMessage({ type: "error", text: "Failed to load donations. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const response = await donationAxios.get(`donations/${id}/`);
      if (response.data) {
        setSelectedDonation(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error fetching donation detail:", error);
      setMessage({ type: "error", text: "Failed to load donation details." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) {
      return;
    }

    try {
      const response = await donationAxios.delete(`donations/${id}/delete/`);
      setMessage({ type: "success", text: "Donation deleted successfully" });
      fetchDonations(); // Refresh list
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error deleting donation:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to delete donation";
      setMessage({ type: "error", text: errorMessage });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleEdit = (id) => {
    navigate(`/donate?edit=${id}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { color: "bg-yellow-100 text-yellow-800", icon: FaClock },
      Approved: { color: "bg-green-100 text-green-800", icon: FaCheckCircle },
      Rejected: { color: "bg-red-100 text-red-800", icon: FaTimesCircle },
      Collected: { color: "bg-blue-100 text-blue-800", icon: FaBox },
    };

    const config = statusConfig[status] || statusConfig.Pending;
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
            <p className="text-gray-600">Loading donations...</p>
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
              <h1 className="text-3xl font-bold text-gray-800">My Donations</h1>
            </div>
            <button
              onClick={() => navigate("/donate")}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              + New Donation
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

          {donations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <FaTshirt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Donations Yet</h2>
              <p className="text-gray-600 mb-6">Start donating your clothing items to stores!</p>
              <button
                onClick={() => navigate("/donate")}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Donate Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {donation.image_url && (
                    <img
                      src={donation.image_url}
                      alt={donation.item_name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800 truncate">
                        {donation.item_name}
                      </h3>
                      {getStatusBadge(donation.donation_status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaStore className="text-purple-600" />
                        <span className="truncate">{donation.store_name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Category:</span> {donation.category}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Size:</span> {donation.size} |{" "}
                        <span className="font-medium">Condition:</span> {donation.condition}
                      </div>
                      <div className="text-xs text-gray-500">
                        Donated: {formatDate(donation.created_at)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(donation.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100 transition text-sm font-medium"
                      >
                        <FaEye />
                        View
                      </button>
                      {donation.donation_status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleEdit(donation.id)}
                            className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(donation.id)}
                            className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Donation Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {selectedDonation.image_url && (
                <img
                  src={selectedDonation.image_url}
                  alt={selectedDonation.item_name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedDonation.item_name}
                  </h3>
                  {getStatusBadge(selectedDonation.donation_status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium">{selectedDonation.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium">{selectedDonation.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Size</p>
                    <p className="font-medium">{selectedDonation.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Condition</p>
                    <p className="font-medium">{selectedDonation.condition}</p>
                  </div>
                </div>

                {selectedDonation.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-800">{selectedDonation.description}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Store Information</p>
                  <p className="font-medium">{selectedDonation.store_name}</p>
                  {selectedDonation.store_email && (
                    <p className="text-sm text-gray-600">{selectedDonation.store_email}</p>
                  )}
                  {selectedDonation.store_phone && (
                    <p className="text-sm text-gray-600">{selectedDonation.store_phone}</p>
                  )}
                </div>

                <div className="border-t pt-4 text-sm text-gray-600">
                  <p>Created: {formatDate(selectedDonation.created_at)}</p>
                  <p>Updated: {formatDate(selectedDonation.updated_at)}</p>
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

export default MyDonations;