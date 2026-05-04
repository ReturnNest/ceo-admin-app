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
                const { data: walletData } = await supabase.from('wallets').select('balance');
                const totalTvl = walletData?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;

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
        { name: 'Total Value Locked', value: `$${stats.tvl.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { name: 'Active Listings', value: stats.activeListings.toString(), icon: Home, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { name: 'KYC Pending', value: stats.kycPending.toString(), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { name: 'Total Investors', value: stats.totalInvestors.toString(), icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">System Overview</h2>
                <p className="text-slate-400 mt-1">Real-time marketplace performance and administrative metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div
                        key={stat.name}
                        onClick={() => {
                            if (stat.name === 'Active Listings') window.location.href = '/admin/moderation';
                            if (stat.name === 'KYC Pending') window.location.href = '/admin/sellers';
                        }}
                        className={cn(
                            "bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-700 transition-colors",
                            (stat.name === 'Active Listings' || stat.name === 'KYC Pending') && "cursor-pointer hover:bg-slate-800/50"
                        )}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-3 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("h-6 w-6", stat.color)} />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                                <ArrowUpRight className="h-3 w-3" />
                                <span>+12.5%</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                            <h3 className="text-2xl font-bold text-white mt-1">
                                {loading ? <div className="h-8 w-24 bg-slate-800 animate-pulse rounded"></div> : stat.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <TrendingUp className="h-12 w-12 text-blue-500/20 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium italic">Growth Visualization - Data Integration Required</p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h4 className="font-bold text-lg mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.href = '/admin/sellers'}
                            className="w-full text-left px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
                        >
                            Approve Pending KYC
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors border border-slate-700">
                            Bulk Export Transactions
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors border border-slate-700">
                            System Health Check
                        </button>
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
