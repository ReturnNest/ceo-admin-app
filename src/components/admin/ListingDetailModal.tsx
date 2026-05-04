import React from 'react';
import { X, CheckCircle, XCircle, Trash2, MapPin, DollarSign, Calendar, User } from 'lucide-react';

interface ListingDetailModalProps {
    listing: any;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onDelete: (id: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
    listing,
    isOpen,
    onClose,
    onApprove,
    onReject,
    onDelete
}) => {
    if (!isOpen || !listing) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div>
                        <h3 className="text-xl font-bold text-white">{listing.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">ID: {listing.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                <DollarSign className="h-4 w-4" />
                                Valuation
                            </div>
                            <div className="text-lg font-bold text-white">
                                ${listing.valuation?.toLocaleString() || '0'}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                                <Calendar className="h-4 w-4" />
                                Created
                            </div>
                            <div className="text-lg font-bold text-white">
                                {new Date(listing.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400">Description</label>
                        <p className="text-slate-200 text-sm leading-relaxed">
                            {listing.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Location */}
                    {listing.location && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400">Location</label>
                            <div className="flex items-start gap-2 text-slate-200 text-sm">
                                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                {listing.location}
                            </div>
                        </div>
                    )}

                    {/* Seller Info */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400">Seller</label>
                        <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl">
                            <div className="h-8 w-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-400" />
                            </div>
                            <span className="text-sm text-white">{listing.user_email || 'Unknown Seller'}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-800 flex gap-3">
                    <button
                        onClick={() => onDelete(listing.id)}
                        className="flex-1 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Listing
                    </button>

                    <div className="flex-1 flex gap-3">
                        <button
                            onClick={() => onReject(listing.id)}
                            className="flex-1 px-4 py-3 bg-slate-800 text-white hover:bg-slate-700 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <XCircle className="h-4 w-4" />
                            Reject
                        </button>
                        <button
                            onClick={() => onApprove(listing.id)}
                            className="flex-[2] px-4 py-3 bg-blue-600 text-white hover:bg-blue-500 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Approve & Publish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
