import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import Alert from '../Components/Alert';
import { FaExclamationTriangle, FaCheck, FaTimes, FaImage, FaUser, FaBox, FaDollarSign } from 'react-icons/fa';

const DamageReports = () => {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({ message: '', type: '' });
    const [actionModal, setActionModal] = useState({ show: false, reportId: null, status: '', extraCharge: '0' });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get("rentals/damage-report/store/");
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching damage reports:', error);
            showAlert('Failed to load damage reports.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async () => {
        try {
            await axiosInstance.post(`rentals/damage-report/${actionModal.reportId}/action/`, {
                status: actionModal.status,
                extra_charge: actionModal.extraCharge
            });
            showAlert(`Report ${actionModal.status} successfully.`, 'success');
            setActionModal({ show: false, reportId: null, status: '', extraCharge: '0' });
            fetchReports();
        } catch (error) {
            showAlert('Failed to update report.', 'error');
        }
    };

    const showAlert = (message, type) => {
        setAlert({ message, type });
        setTimeout(() => setAlert({ message: '', type: '' }), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
                        <FaExclamationTriangle className="text-amber-500" />
                        Damage Reports
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Review and manage damage claims for your rental items.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaCheck className="text-4xl text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">No Pending Reports</h3>
                        <p className="text-gray-500 mt-2">All damage claims have been handled. Great job!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map((report) => (
                            <div key={report.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col">
                                <div className="h-56 bg-gray-200 relative group">
                                    {report.image ? (
                                        <img src={report.image} alt="Damage" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
                                            <FaImage className="text-4xl mb-2" />
                                            <span className="text-sm font-medium">No Image Uploaded</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 capitalize px-4 py-1.5 rounded-full text-xs font-black shadow-lg bg-white/90 backdrop-blur-sm border border-gray-100">
                                        {report.status}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{report.clothing_name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <FaUser className="text-purple-500" />
                                            <span>{report.user_email}</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Customer Description</p>
                                        <p className="text-gray-700 text-sm leading-relaxed">{report.description}</p>
                                    </div>

                                    {report.status === 'pending' && (
                                        <div className="grid grid-cols-2 gap-3 mt-auto">
                                            <button
                                                onClick={() => setActionModal({ show: true, reportId: report.id, status: 'accepted', extraCharge: '0' })}
                                                className="px-4 py-3 bg-purple-600 text-white rounded-2xl font-bold text-sm hover:bg-purple-700 transition shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                                            >
                                                <FaCheck /> Accept
                                            </button>
                                            <button
                                                onClick={() => setActionModal({ show: true, reportId: report.id, status: 'rejected', extraCharge: '0' })}
                                                className="px-4 py-3 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
                                            >
                                                <FaTimes /> Reject
                                            </button>
                                        </div>
                                    )}

                                    {report.status !== 'pending' && (
                                        <div className="mt-auto py-3 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-500">Extra Charge:</span>
                                            <span className="text-lg font-black text-purple-600">${report.extra_charge}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {actionModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                        <h2 className="text-2xl font-black text-gray-900 mb-2 capitalize">
                            {actionModal.status} Report
                        </h2>
                        <p className="text-gray-500 mb-6">You are marking this damage report as <span className="font-bold text-purple-600">{actionModal.status}</span>.</p>

                        {actionModal.status === 'accepted' && (
                            <div className="mb-6">
                                <label className="block text-sm font-black text-gray-700 mb-2">Extra Charge ($)</label>
                                <div className="relative">
                                    <FaDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 focus:outline-none font-bold text-lg"
                                        value={actionModal.extraCharge}
                                        onChange={(e) => setActionModal({ ...actionModal, extraCharge: e.target.value })}
                                        min="0"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Enter the amount the customer needs to pay for the damage.</p>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={handleAction}
                                className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black text-lg hover:bg-purple-700 transition shadow-xl shadow-purple-200"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setActionModal({ show: false, reportId: null, status: '', extraCharge: '0' })}
                                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-lg hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
            <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: '', type: '' })} />
        </div>
    );
};

export default DamageReports;
