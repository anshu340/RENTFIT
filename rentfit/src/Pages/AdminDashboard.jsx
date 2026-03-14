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
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_users: 0,
        total_customers: 0,
        total_stores: 0,
        total_revenue: 0,
        total_donations: 0,
        collected_donations: 0,
        revenue_history: [],
        user_distribution: []
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

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 shadow-xl rounded-2xl border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase mb-1">{label}</p>
                    <p className="text-lg font-black text-indigo-600">${payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

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

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[30rem] flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                        <FaChartLine className="text-indigo-500" /> Revenue Growth
                                    </h2>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        All Time
                                    </div>
                                </div>
                                <div className="relative w-full h-80 min-h-[320px]">
                                    {isLoading ? (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold">Loading chart...</div>
                                    ) : (
                                        <div className="absolute inset-0">
                                            <ResponsiveContainer width="99%" height="100%">
                                                <AreaChart data={stats.revenue_history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis
                                                        dataKey="date"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                                        minTickGap={30}
                                                        tickFormatter={(str) => {
                                                            const date = new Date(str);
                                                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                        }}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                                        tickFormatter={(val) => `$${val}`}
                                                    />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="revenue"
                                                        stroke="#6366f1"
                                                        strokeWidth={4}
                                                        fillOpacity={1}
                                                        fill="url(#colorRevenue)"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[30rem]">
                                <h2 className="text-xl font-black text-slate-900 mb-6">User Distribution</h2>
                                <div className="flex-1 w-full h-full flex flex-col">
                                    {isLoading ? (
                                        <div className="flex-1 flex items-center justify-center text-slate-400 font-bold">Loading...</div>
                                    ) : (
                                        <>
                                            <div className="flex-1 relative min-h-[250px]">
                                                <div className="absolute inset-0">
                                                    <ResponsiveContainer width="99%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={stats.user_distribution}
                                                                innerRadius={60}
                                                                outerRadius={100}
                                                                paddingAngle={8}
                                                                dataKey="value"
                                                            >
                                                                {stats.user_distribution.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={10} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip
                                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                                                itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                                                            />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                            <div className="mt-4 space-y-3">
                                                {stats.user_distribution.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                            <span className="text-sm font-bold text-slate-600">{item.name}</span>
                                                        </div>
                                                        <span className="text-sm font-black text-slate-900">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
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
