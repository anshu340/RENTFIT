import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import AdminSidebar from '../Components/AdminSidebar';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import {
    FaUsers,
    FaMoneyBillWave,
    FaHandHoldingHeart,
    FaChartLine,
    FaStore
} from 'react-icons/fa';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_users: 0,
        total_customers: 0,
        total_stores: 0,
        total_revenue: 0,
        total_donations: 0,
        collected_donations: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosInstance.get('accounts/admin/stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { title: 'Total Revenue', value: `$${stats.total_revenue.toLocaleString()}`, icon: FaMoneyBillWave, color: 'bg-emerald-500', trend: '+12.5%' },
        { title: 'Total Users', value: stats.total_users, icon: FaUsers, color: 'bg-indigo-500', trend: '+8.2%' },
        { title: 'Registered Stores', value: stats.total_stores, icon: FaStore, color: 'bg-amber-500', trend: '+4.1%' },
        { title: 'Donations Processed', value: stats.total_donations, icon: FaHandHoldingHeart, color: 'bg-rose-500', trend: '+15.3%' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
                                <p className="text-slate-500 font-medium">Real-time platform performance and user metrics.</p>
                            </div>
                            <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Live System Status: Operational
                            </div>
                        </div>

                        {/* Stat Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statCards.map((card, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl ${card.color} text-white shadow-lg`}>
                                            <card.icon size={20} />
                                        </div>
                                        <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                                            {card.trend}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{card.title}</p>
                                    <h3 className="text-3xl font-black text-slate-900 mt-1">{isLoading ? '...' : card.value}</h3>
                                </div>
                            ))}
                        </div>

                        {/* Charts Area (Placeholders) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-96 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                        <FaChartLine className="text-indigo-500" /> Revenue Growth
                                    </h2>
                                    <select className="bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-500 px-4 py-2 focus:ring-0">
                                        <option>Last 7 Days</option>
                                        <option>Last 30 Days</option>
                                    </select>
                                </div>
                                <div className="flex-1 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold">
                                    Chart Visualization Placeholder
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
                                <h2 className="text-xl font-black text-slate-900 mb-6">User Distribution</h2>
                                <div className="flex-1 space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold text-slate-600">
                                            <span>Customers</span>
                                            <span>{Math.round((stats.total_customers / stats.total_users) * 100 || 0)}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${(stats.total_customers / stats.total_users) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold text-slate-600">
                                            <span>Stores</span>
                                            <span>{Math.round((stats.total_stores / stats.total_users) * 100 || 0)}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500" style={{ width: `${(stats.total_stores / stats.total_users) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminDashboard;
