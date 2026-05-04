import React, { useEffect, useState } from 'react';
import {
    Users,
    ChevronRight,
    UserCheck,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { SellerDetailModal } from '../../components/admin/SellerDetailModal';

interface Seller {
    id: string;
    full_name: string;
    email: string;
    kyc_status: string;
    created_at: string;
    listing_count?: number;
}

export const SellerManagement: React.FC = () => {
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchSellers();
    }, []);

    async function fetchSellers() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*, listings(count)')
                .eq('role', 'seller');

            if (error) throw error;

            setSellers(data.map(item => ({
                ...item,
                listing_count: item.listings?.[0]?.count || 0
            })));
        } catch (err) {
            console.error('Error fetching sellers:', err);
        } finally {
            setLoading(false);
        }
    }

    const openDetail = (seller: Seller) => {
        setSelectedSeller(seller);
        setIsModalOpen(true);
    };

    const handleAction = async (id: string, action: 'verify' | 'suspend') => {
        if (!confirm(`Are you sure you want to ${action} this seller?`)) return;

        try {
            // 'verify' sets kyc_status to 'verified'. 'suspend' might set kyc_status to 'suspended' or block access.
            // Assuming kyc_status update for now.
            const kyc_status = action === 'verify' ? 'verified' : 'suspended';

            const { error } = await supabase
                .from('profiles')
                .update({ kyc_status })
                .eq('id', id);

            if (error) throw error;

            // Refresh
            fetchSellers();
            setIsModalOpen(false);
        } catch (err) {
            console.error(`Error performing ${action}:`, err);
            alert(`Failed to ${action} seller.`);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Seller Directory</h2>
                    <p className="text-slate-400 mt-1">Manage institutional and individual marketplace sellers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all">
                        <UserCheck className="h-4 w-4" />
                        Verify New Seller
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-900 rounded-2xl animate-pulse"></div>)
                ) : sellers.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                        <Users className="h-12 w-12 mx-auto mb-4 text-slate-700" />
                        <p className="text-slate-500">No registered sellers found in the directory.</p>
                    </div>
                ) : (
                    sellers.map((seller) => (
                        <div
                            key={seller.id}
                            onClick={() => openDetail(seller)}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 group cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-colors">
                                    <span className="font-bold text-lg uppercase tracking-widest">{seller.full_name?.charAt(0) || 'U'}</span>
                                </div>
                                <div className={cn(
                                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                    seller.kyc_status === 'verified' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                                )}>
                                    {seller.kyc_status || 'Unverified'}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="font-bold text-white truncate">{seller.full_name || 'Anonymous Seller'}</h4>
                                <p className="text-sm text-slate-500 truncate">{seller.email}</p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                    <span className="text-white font-bold">{seller.listing_count}</span> Active Listings
                                </div>
                                <button className="text-blue-500 hover:text-blue-400 transition-colors p-1">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <SellerDetailModal
                seller={selectedSeller}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onVerify={(id) => handleAction(id, 'verify')}
                onSuspend={(id) => handleAction(id, 'suspend')}
            />
        </div>
    );
};

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
