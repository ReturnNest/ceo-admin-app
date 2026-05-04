import React, { useEffect, useState } from 'react';
import { 
    ShieldCheck, 
    Building2, 
    User, 
    Phone, 
    Search,
    ChevronRight,
    ClipboardList
} from 'lucide-react';
import { supabase } from '../../services/supabase';

interface PrivateListing {
    id: string;
    title: string;
    type: string;
    category: string;
    real_estate_name: string;
    real_estate_contact: string;
    real_estate_agent: string;
    internal_notes: string;
    created_at: string;
}

export const AdminPrivateListings: React.FC = () => {
    const [listings, setListings] = useState<PrivateListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPrivateListings();
    }, []);

    const fetchPrivateListings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('id, title, type, category, real_estate_name, real_estate_contact, real_estate_agent, internal_notes, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data || []);
        } catch (error) {
            console.error('Error fetching private listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredListings = listings.filter(l => 
        l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.real_estate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.real_estate_agent?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-purple-400" />
                        Private Vendor Records
                    </h2>
                    <p className="text-slate-400 mt-1">Confidential database of real estate partners and internal notes.</p>
                </div>
                
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input 
                        type="text"
                        placeholder="Search company, agent, or title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder:text-slate-600"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-64 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                        <div 
                            key={listing.id}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
                                        {listing.category || listing.type || 'Property'}
                                    </span>
                                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                                        {listing.title}
                                    </h3>
                                </div>
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <Building2 className="h-5 w-5 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-800">
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <Building2 className="h-4 w-4 text-slate-500" />
                                    <span className="font-medium">{listing.real_estate_name || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <User className="h-4 w-4 text-slate-500" />
                                    <span>Agent: {listing.real_estate_agent || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <Phone className="h-4 w-4 text-slate-500" />
                                    <span className="truncate">{listing.real_estate_contact || 'No contact info'}</span>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                                <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1 uppercase tracking-wider">
                                    <ClipboardList className="h-3 w-3" />
                                    Internal Notes
                                </p>
                                <p className="text-sm text-slate-400 italic line-clamp-3">
                                    {listing.internal_notes || "No internal notes provided for this project."}
                                </p>
                            </div>
                            
                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">
                                    Created {new Date(listing.created_at).toLocaleDateString()}
                                </span>
                                <button className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300">
                                    Details <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl">
                    <ShieldCheck className="h-16 w-16 text-slate-800 mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">No records found</h3>
                    <p className="text-slate-500 mt-1">Try adjusting your search or add a new listing.</p>
                </div>
            )}
        </div>
    );
};
