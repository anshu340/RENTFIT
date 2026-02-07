import React, { useState, useEffect } from "react";
import donationAxios from "../services/donationAxios";
import { FaTshirt, FaCheckCircle, FaTimesCircle, FaBox, FaEye, FaBoxOpen } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import StoreSidebar from "../Components/StoreSidebar";

const StoreDonations = () => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      const response = await donationAxios.get("donations/store/");
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

  const handleApprove = async (id) => {
    try {
      const response = await donationAxios.patch(`donations/store/${id}/status/`, {
        donation_status: "Approved",
      });
      setMessage({ type: "success", text: "Donation approved successfully!" });
      fetchDonations(); // Refresh list
      if (showDetailModal && selectedDonation?.id === id) {
        setSelectedDonation(response.data.data);
      }
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error approving donation:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to approve donation";
      setMessage({ type: "error", text: errorMessage });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this donation?")) {
      return;
    }

    try {
      const response = await donationAxios.patch(`donations/store/${id}/status/`, {
        donation_status: "Rejected",
      });
      setMessage({ type: "success", text: "Donation rejected." });
      fetchDonations(); // Refresh list
      if (showDetailModal && selectedDonation?.id === id) {
        setSelectedDonation(response.data.data);
      }
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error rejecting donation:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to reject donation";
      setMessage({ type: "error", text: errorMessage });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleCollect = async (id) => {
    if (!window.confirm("Mark this donation as collected?")) {
      return;
    }

    try {
      const response = await donationAxios.patch(`donations/store/${id}/collect/`);
      setMessage({ type: "success", text: "Donation marked as collected!" });
      fetchDonations(); // Refresh list
      if (showDetailModal && selectedDonation?.id === id) {
        setSelectedDonation(response.data.data);
      }
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error collecting donation:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to mark as collected";
      setMessage({ type: "error", text: errorMessage });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { color: "bg-yellow-100 text-yellow-800", icon: FaEye },
      Approved: { color: "bg-green-100 text-green-800", icon: FaCheckCircle },
      Rejected: { color: "bg-red-100 text-red-800", icon: FaTimesCircle },
      Collected: { color: "bg-blue-100 text-blue-800", icon: FaBoxOpen },
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

  const filteredDonations = filterStatus === "All"
    ? donations
    : donations.filter(d => d.donation_status === filterStatus);

  const isLoggedIn = !!localStorage.getItem("access_token");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading donations...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col uppercase-none">
      <Navbar />

      {isLoggedIn ? (
        <div className="flex flex-1 min-h-screen">
          <StoreSidebar />
          <main className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FaTshirt className="text-purple-600 text-xl" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800">Donation Management</h1>
                </div>
              </div>

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

              {/* Filter Tabs */}
              <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                <div className="flex gap-2 overflow-x-auto">
                  {["All", "Pending", "Approved", "Rejected", "Collected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${filterStatus === status
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {status}
                      {status !== "All" && (
                        <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                          {donations.filter(d => d.donation_status === status).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {filteredDonations.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <FaTshirt className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">No Donations</h2>
                  <p className="text-gray-600">
                    {filterStatus === "All"
                      ? "No donations have been submitted to your store yet."
                      : `No ${filterStatus.toLowerCase()} donations.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDonations.map((donation) => (
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
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">From:</span> {donation.customer_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Category:</span> {donation.category}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Size:</span> {donation.size} |{" "}
                            <span className="font-medium">Condition:</span> {donation.condition}
                          </div>
                          <div className="text-xs text-gray-500">
                            Received: {formatDate(donation.created_at)}
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
                                onClick={() => handleApprove(donation.id)}
                                className="flex items-center justify-center gap-2 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                                title="Approve"
                              >
                                <FaCheckCircle />
                              </button>
                              <button
                                onClick={() => handleReject(donation.id)}
                                className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                                title="Reject"
                              >
                                <FaTimesCircle />
                              </button>
                            </>
                          )}
                          {donation.donation_status === "Approved" && (
                            <button
                              onClick={() => handleCollect(donation.id)}
                              className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                              title="Mark as Collected"
                            >
                              <FaBoxOpen />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1 flex flex-col items-center justify-center text-center">
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 shadow-lg max-w-2xl">
            <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBox className="text-3xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Store Access Required</h2>
            <p className="text-gray-600 mb-8 text-lg">
              This page is reserved for RentFit store partners to manage incoming clothing donations.
              Please log in with your store account to view and manage donations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => (window.location.href = "/login")}
                className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition transform hover:-translate-y-1 shadow-md shadow-purple-200"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />

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
                  <p className="text-sm text-gray-600 mb-2">Customer Information</p>
                  <p className="font-medium">{selectedDonation.customer_name}</p>
                  {selectedDonation.customer_email && (
                    <p className="text-sm text-gray-600">{selectedDonation.customer_email}</p>
                  )}
                </div>

                <div className="border-t pt-4 text-sm text-gray-600">
                  <p>Created: {formatDate(selectedDonation.created_at)}</p>
                  <p>Updated: {formatDate(selectedDonation.updated_at)}</p>
                </div>

                {/* Action Buttons */}
                {selectedDonation.donation_status === "Pending" && (
                  <div className="border-t pt-4 flex gap-3">
                    <button
                      onClick={() => {
                        handleApprove(selectedDonation.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      <FaCheckCircle />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedDonation.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      <FaTimesCircle />
                      Reject
                    </button>
                  </div>
                )}

                {selectedDonation.donation_status === "Approved" && (
                  <div className="border-t pt-4">
                    <button
                      onClick={() => {
                        handleCollect(selectedDonation.id);
                        setShowDetailModal(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      <FaBoxOpen />
                      Mark as Collected
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDonations;