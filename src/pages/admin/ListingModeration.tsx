import React, { useEffect, useState } from 'react';
import {
    CheckCircle,
    XCircle,
    Eye,
    Clock,
    Search,
    Building2,
    Map as MapIcon,
    Sprout
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { ListingDetailModal } from '../../components/admin/ListingDetailModal';

interface Listing {
    id: string;
    title: string;
    type: 'land' | 'property' | 'agri-tech' | 'Land' | 'Property' | 'Agri-Tech';
    valuation: number | string;
    status: string;
    created_at: string;
    user_email?: string;
    images?: string[];
    location?: string;
    min_investment?: number;
}

export const ListingModeration: React.FC = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchListings();
    }, []);

    async function fetchListings() {
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*, profiles(email)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setListings(data.map(item => ({
                ...item,
                user_email: item.profiles?.email
            })));
            console.log("Fetched listings:", data); // Debug log
        } catch (err) {
            console.error('Error fetching listings:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
        if (!confirm(`Are you sure you want to ${action} this listing?`)) return;

        try {
            if (action === 'delete') {
                const { error } = await supabase.from('listings').delete().eq('id', id);
                if (error) throw error;
            } else {
                const status = action === 'approve' ? 'active' : 'rejected';
                const { error } = await supabase.from('listings').update({ status }).eq('id', id);
                if (error) throw error;
            }

            // Refresh list
            fetchListings();
            setIsModalOpen(false);
        } catch (err) {
            console.error(`Error performing ${action}:`, err);
            alert(`Failed to ${action} listing.`);
        }
    };

    const openDetail = (listing: Listing) => {
        setSelectedListing(listing);
        setIsModalOpen(true);
    };

    const getIcon = (type: string) => {
        const t = type?.toLowerCase();
        if (t?.includes('land')) return MapIcon;
        if (t?.includes('agri')) return Sprout;
        if (t?.includes('house') || t?.includes('apartment') || t?.includes('estate') || t?.includes('property') || t?.includes('real-estate')) return Building2;
        return Building2;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-emerald-400 bg-emerald-500/10';
            case 'pending': return 'text-amber-400 bg-amber-500/10';
            case 'rejected': return 'text-red-400 bg-red-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Listings Management</h2>
                    <p className="text-slate-400 mt-1">Review, approve, and manage marketplace listings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search listings..."
                            className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-800">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Project</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Location</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Valuation</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Min Inv</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Submitted</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={7} className="px-6 py-8">
                                        <div className="h-4 bg-slate-800 rounded w-full"></div>
                                    </td>
                                </tr>
                            ))
                        ) : listings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-medium">No listings found.</p>
                                </td>
                            </tr>
                        ) : (
                            listings.map((item) => {
                                const Icon = getIcon(item.type);
                                return (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                {item.images && item.images.length > 0 ? (
                                                    <img
                                                        src={item.images[0]}
                                                        alt="Thumbnail"
                                                        className="h-10 w-10 rounded-lg object-cover bg-slate-800 border border-slate-700"
                                                        onError={(e) => {
                                                            console.error("Image failed to load:", item.images?.[0]);
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-800 text-blue-400 border border-slate-700">
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight text-sm">
                                                        {item.title || 'Untitled Project'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{item.user_email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm text-slate-300 max-w-[150px] truncate" title={item.location}>
                                                {item.location || <span className="text-slate-600 italic">No Location</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-white/5 ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-white">
                                                    ${Number(item.valuation).toLocaleString() || '0'}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-mono">Raw: {item.valuation}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-emerald-400">
                                                ${item.min_investment?.toLocaleString() || '1,000'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Clock className="h-3 w-3" />
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openDetail(item)}
                                                    title="View Details"
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(item.id, 'approve')}
                                                    title="Approve"
                                                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(item.id, 'delete')}
                                                    title="Delete"
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <ListingDetailModal
                listing={selectedListing}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onApprove={(id) => handleAction(id, 'approve')}
                onReject={(id) => handleAction(id, 'reject')}
                onDelete={(id) => handleAction(id, 'delete')}
            />
        </div>
    );
};
