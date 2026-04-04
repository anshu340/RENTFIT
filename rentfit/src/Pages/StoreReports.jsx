import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { formatPrice } from "../services/axiosInstance";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import StoreSidebar from "../Components/StoreSidebar";
import {
    FaDollarSign,
    FaShoppingBag,
    FaCheckCircle,
    FaBox,
    FaTimesCircle,
    FaCalendarAlt,
    FaTshirt,
    FaUser,
    FaInfoCircle
} from "react-icons/fa";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const StatCard = ({ icon: Icon, label, value, color, description }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center`}>
                <Icon className={`text-${color}-500 text-xl`} />
            </div>
        </div>
        <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <span className="text-2xl font-black text-gray-900 mt-1">{value}</span>
            {description && <span className="text-xs text-gray-400 mt-1">{description}</span>}
        </div>
    </div>
);

const StoreReports = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        earningsHistory: [],
        recentTransactions: []
    });
    const [rentals, setRentals] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [statsRes, rentalsRes] = await Promise.all([
                axiosInstance.get("accounts/dashboard/store/stats/"),
                axiosInstance.get("rentals/store/")
            ]);

            const statsData = statsRes.data.data;
            setStats({
                totalEarnings: statsData.total_earnings,
                earningsHistory: statsData.earnings_history,
                recentTransactions: statsData.recent_transactions
            });
            setRentals(rentalsRes.data);
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRentalCounts = () => {
        const total = rentals.length;
        const active = rentals.filter(r => r.status === 'rented').length;
        const returned = rentals.filter(r => r.status === 'returned_confirmed').length;
        const cancelled = rentals.filter(r => r.status === 'rejected').length;
        return { total, active, returned, cancelled };
    };

    const counts = getRentalCounts();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">Generating Reports...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex flex-1">
                <StoreSidebar />
                <main className="flex-1 overflow-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Reports</h1>
                            <p className="text-gray-500 mt-1">Detailed analytics and transaction history for your store.</p>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                            <StatCard
                                icon={FaDollarSign}
                                label="Total Revenue"
                                value={formatPrice(stats.totalEarnings)}
                                color="green"
                                description="Verified eSewa earnings"
                            />
                            <StatCard
                                icon={FaShoppingBag}
                                label="Total Rentals"
                                value={counts.total}
                                color="purple"
                                description="Total bookings made"
                            />
                            <StatCard
                                icon={FaBox}
                                label="Active Rentals"
                                value={counts.active}
                                color="blue"
                                description="Currently out with customers"
                            />
                            <StatCard
                                icon={FaCheckCircle}
                                label="Returned Items"
                                value={counts.returned}
                                color="emerald"
                                description="Successfully completed"
                            />
                            <StatCard
                                icon={FaTimesCircle}
                                label="Cancelled"
                                value={counts.cancelled}
                                color="red"
                                description="Rejected or failed"
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Earnings Trend</h2>
                                    <p className="text-sm text-gray-500">Revenue history for the last 30 days</p>
                                </div>
                                <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                    <span className="text-green-700 font-black text-lg">{formatPrice(stats.totalEarnings)}</span>
                                </div>
                            </div>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.earningsHistory}>
                                        <defs>
                                            <linearGradient id="colorEarningsReport" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }}
                                            dy={10}
                                            tickFormatter={(str) => {
                                                const date = new Date(str);
                                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }}
                                            tickFormatter={(val) => `Rs. ${val}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '20px',
                                                border: 'none',
                                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                                padding: '16px'
                                            }}
                                            itemStyle={{ fontWeight: 'black', color: '#059669' }}
                                            labelStyle={{ marginBottom: '8px', fontWeight: 'black', color: '#111827' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="earnings"
                                            stroke="#10b981"
                                            strokeWidth={5}
                                            fillOpacity={1}
                                            fill="url(#colorEarningsReport)"
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Showing last {stats.recentTransactions.length} payments
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Item</th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Amount</th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Date</th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {stats.recentTransactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors uppercase-none">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm overflow-hidden border-2 border-white shadow-sm">
                                                            {tx.customer_image ? (
                                                                <img src={tx.customer_image} alt={tx.customer_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <FaUser />
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-gray-900">{tx.customer_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                                            {tx.item_image ? (
                                                                <img src={tx.item_image} alt={tx.item_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <FaTshirt className="text-gray-300" />
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-gray-800">{tx.item_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-black text-green-600">{formatPrice(tx.amount)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                                                        <FaCalendarAlt className="text-gray-300" />
                                                        {new Date(tx.date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-full border border-green-200">
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {stats.recentTransactions.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <FaInfoCircle className="text-gray-300 text-xl" />
                                                    </div>
                                                    <p className="text-gray-500 font-bold">No transactions recorded yet.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default StoreReports;
