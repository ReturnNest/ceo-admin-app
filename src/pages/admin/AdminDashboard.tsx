import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    Home,
    Users,
    DollarSign,
    ArrowUpRight,
    Clock
} from 'lucide-react';
import { supabase } from '../../services/supabase';

interface Stats {
    tvl: number;
    activeListings: number;
    kycPending: number;
    totalInvestors: number;
}

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats>({
        tvl: 0,
        activeListings: 0,
        kycPending: 0,
        totalInvestors: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch TVL from wallets
                const { data: walletData, error: walletError } = await supabase.from('wallets').select('balance');
                
                let totalTvl = 0;
                if (!walletError && walletData) {
                    totalTvl = walletData.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
                } else {
                    // Fallback to profiles.wallet_balance if wallets table doesn't work
                    const { data: profileData } = await supabase.from('profiles').select('wallet_balance');
                    totalTvl = profileData?.reduce((sum, p) => sum + (Number(p.wallet_balance) || 0), 0) || 0;
                }

                // Fetch Active Listings
                const { count: activeCount } = await supabase
                    .from('listings')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'active');

                // Fetch KYC Pending
                const { count: kycCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('kyc_status', 'pending');

                // Fetch Total Investors
                const { count: investorCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'investor');

                setStats({
                    tvl: totalTvl,
                    activeListings: activeCount || 0,
                    kycPending: kycCount || 0,
                    totalInvestors: investorCount || 0,
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const statCards = [
        { name: 'Total Value Locked', value: `$${stats.tvl.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+12.5%' },
        { name: 'Active Listings', value: stats.activeListings.toString(), icon: Home, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+2.4%' },
        { name: 'KYC Pending', value: stats.kycPending.toString(), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: '-14%' },
        { name: 'Total Investors', value: stats.totalInvestors.toString(), icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: '+5.2%' },
    ];

    // Dummy data for the SVG chart
    const chartData = [30, 45, 35, 60, 55, 80, 75, 90, 85, 100];
    const chartPoints = chartData.map((val, i) => `${(i * 100) / (chartData.length - 1)},${100 - val}`).join(' ');

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        System Overview
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm md:text-base">Real-time marketplace performance and administrative metrics.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium bg-slate-900/50 border border-slate-800 rounded-full px-3 py-1.5 text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live System Status
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {statCards.map((stat, i) => (
                    <div
                        key={stat.name}
                        style={{ animationDelay: `${i * 100}ms` }}
                        onClick={() => {
                            if (stat.name === 'Active Listings') window.location.href = '/admin/moderation';
                            if (stat.name === 'KYC Pending') window.location.href = '/admin/sellers';
                        }}
                        className={cn(
                            "group relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-slate-600 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4",
                            (stat.name === 'Active Listings' || stat.name === 'KYC Pending') && "cursor-pointer active:scale-95"
                        )}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon className="h-24 w-24" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={cn("p-3 rounded-xl transition-colors duration-300", stat.bg)}>
                                <stat.icon className={cn("h-6 w-6", stat.color)} />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                                stat.trend.startsWith('+') ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                            )}>
                                {stat.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3 rotate-90" />}
                                <span>{stat.trend}</span>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-slate-500 group-hover:text-slate-400 transition-colors">{stat.name}</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mt-1 tracking-tight">
                                {loading ? <div className="h-9 w-24 bg-slate-800/50 animate-pulse rounded-lg"></div> : stat.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-xl font-bold text-white">Platform Growth</h4>
                            <p className="text-sm text-slate-400">Monthly active users and transaction volume</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5 text-blue-400">
                                <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                Volume
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <span className="h-2 w-2 rounded-full bg-slate-700"></span>
                                Previous
                            </div>
                        </div>
                    </div>

                    <div className="h-[250px] md:h-[300px] w-full relative group/chart">
                        {/* SVG Chart */}
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* Grid Lines */}
                            {[0, 25, 50, 75, 100].map(val => (
                                <line key={val} x1="0" y1={val} x2="100" y2={val} stroke="currentColor" strokeWidth="0.1" className="text-slate-800" />
                            ))}
                            {/* Area */}
                            <polyline
                                points={`0,100 ${chartPoints} 100,100`}
                                fill="url(#chartGradient)"
                                className="transition-all duration-1000"
                            />
                            {/* Line */}
                            <polyline
                                points={chartPoints}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-1000 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                            />
                            {/* Data Points */}
                            {chartData.map((val, i) => (
                                <circle
                                    key={i}
                                    cx={(i * 100) / (chartData.length - 1)}
                                    cy={100 - val}
                                    r="1.5"
                                    fill="#3b82f6"
                                    className="opacity-0 group-hover/chart:opacity-100 transition-opacity duration-300"
                                />
                            ))}
                        </svg>
                        
                        {/* Tooltip Placeholder */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover/chart:opacity-100 transition-opacity">
                            <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xl">
                                Peak Performance: $1.2M
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col h-full">
                    <h4 className="font-bold text-xl mb-6 flex items-center gap-2">
                        Quick Actions
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-medium">Internal</span>
                    </h4>
                    <div className="space-y-4 flex-1">
                        <button
                            onClick={() => window.location.href = '/admin/sellers'}
                            className="group w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <span className="flex items-center gap-3">
                                <Users className="h-5 w-5" />
                                Approve Pending KYC
                            </span>
                            <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </button>
                        
                        <button className="group w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-white text-sm font-bold transition-all border border-slate-700 active:scale-95">
                            <span className="flex items-center gap-3 text-slate-300 group-hover:text-white">
                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                                Bulk Export Transactions
                            </span>
                            <ArrowUpRight className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <div className="mt-6 pt-6 border-t border-slate-800/50">
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">System Health</h5>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Database Connection</span>
                                    <span className="text-emerald-400 font-bold">Stable</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">API Gateway</span>
                                    <span className="text-emerald-400 font-bold">99.9% Up</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Storage Nodes</span>
                                    <span className="text-amber-400 font-bold">84% Capacity</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal utility since cn wasn't exported from Layout
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
