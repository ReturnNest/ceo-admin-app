import React, { useEffect, useState } from 'react';
import { 
    CreditCard, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Search,
    Filter,
    Download,
    Eye,
    TrendingUp,
    Wallet,
    Shield
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Transaction {
    id: string;
    wallet_id: string;
    transaction_type: string;
    amount: number;
    status: string;
    reference: string;
    created_at: string;
    profiles: {
        full_name: string;
        email: string;
    };
    metadata?: any;
}

export const BillingManagement: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchTransactions();
    }, []);

    async function fetchTransactions() {
        try {
            // Note: We join with profiles through wallets if needed, 
            // but let's see if we can get user info directly if it's in the metadata or join.
            // Based on marketplace schema, transactions belong to wallets, wallets belong to users.
            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    wallets (
                        user_id
                    ),
                    investments (
                        listing_id,
                        listings (
                            title
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch profiles for these users
            const userIds = data?.map(t => t.wallets?.user_id).filter(Boolean) || [];
            if (userIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .in('id', userIds);
                
                const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p]) || []);
                
                const enriched = data.map(t => ({
                    ...t,
                    profiles: profileMap[t.wallets?.user_id] || { full_name: 'Unknown User', email: 'N/A' }
                }));
                setTransactions(enriched);
            } else {
                setTransactions([]);
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    }

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             t.reference?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.transaction_type === filterType;
        return matchesSearch && matchesType;
    });

    const stats = [
        { label: 'Total Volume', value: `$${transactions.reduce((acc, t) => acc + (t.status === 'completed' ? t.amount : 0), 0).toLocaleString()}`, icon: TrendingUp, color: 'text-blue-400' },
        { label: 'Active Escrows', value: transactions.filter(t => t.status === 'pending').length, icon: Shield, color: 'text-amber-400' },
        { label: 'Total Users', value: new Set(transactions.map(t => t.profiles.email)).size, icon: Wallet, color: 'text-emerald-400' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Billing & Transactions</h2>
                    <p className="text-slate-400 mt-1">Monitor all financial activity across the platform.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={cn("p-3 rounded-xl bg-slate-800 group-hover:scale-110 transition-transform", stat.color)}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <stat.icon className="h-24 w-24" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50 p-4 border border-slate-800 rounded-2xl">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by user or reference..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 w-full"
                    />
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-sm text-slate-400 min-w-fit">
                        <Filter className="h-4 w-4" />
                        Filter By:
                    </div>
                    <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 w-full md:w-auto"
                    >
                        <option value="all">All Types</option>
                        <option value="deposit">Deposits</option>
                        <option value="investment">Investments</option>
                        <option value="withdrawal">Withdrawals</option>
                        <option value="profit">Profits</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-800/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-4 h-16 bg-slate-900/50"></td>
                                    </tr>
                                ))
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-slate-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-lg",
                                                    t.transaction_type === 'deposit' ? "bg-emerald-500/10 text-emerald-400" :
                                                    t.transaction_type === 'investment' ? "bg-blue-500/10 text-blue-400" :
                                                    "bg-slate-500/10 text-slate-400"
                                                )}>
                                                    {t.transaction_type === 'deposit' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white truncate max-w-[150px]">{(t as any).item_name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Ref: {t.reference || t.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-white">{t.profiles.full_name}</p>
                                                <p className="text-xs text-slate-500">{t.profiles.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                {t.transaction_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-sm font-bold",
                                                t.transaction_type === 'deposit' ? "text-emerald-400" : "text-white"
                                            )}>
                                                {t.transaction_type === 'deposit' ? '+' : '-'}${t.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                                t.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" :
                                                t.status === 'pending' ? "bg-amber-500/10 text-amber-400" :
                                                "bg-red-500/10 text-red-400"
                                            )}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(t.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
