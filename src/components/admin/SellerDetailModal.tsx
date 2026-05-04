import React from 'react';
import { X, ShieldAlert, Mail, Calendar, FileText, UserCheck } from 'lucide-react';

interface SellerDetailModalProps {
    seller: any;
    isOpen: boolean;
    onClose: () => void;
    onVerify: (id: string) => void;
    onSuspend: (id: string) => void;
}

export const SellerDetailModal: React.FC<SellerDetailModalProps> = ({
    seller,
    isOpen,
    onClose,
    onVerify,
    onSuspend
}) => {
    if (!isOpen || !seller) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div>
                        <h3 className="text-xl font-bold text-white">{seller.full_name || 'Unknown Seller'}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Status: <span className={`font-bold uppercase ${seller.kyc_status === 'verified' ? 'text-emerald-400' : 'text-amber-400'}`}>{seller.kyc_status || 'Pending'}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Contact Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Mail className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Email Address</p>
                                <p className="text-sm font-medium text-white">{seller.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Calendar className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Joined Date</p>
                                <p className="text-sm font-medium text-white">{new Date(seller.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* KYC Section (Placeholder for documents) */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">KYC Documentation</h4>
                        <div className="p-4 border border-dashed border-slate-700 rounded-xl bg-slate-800/30 flex items-center justify-center flex-col gap-2">
                            <FileText className="h-8 w-8 text-slate-600" />
                            <p className="text-sm text-slate-500">No documents uploaded yet.</p>
                            <p className="text-xs text-slate-600">(This feature requires storage integration)</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-800 flex gap-3">
                    <button
                        onClick={() => onSuspend(seller.id)}
                        className="flex-1 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                    >
                        <ShieldAlert className="h-4 w-4" />
                        Suspend
                    </button>

                    <button
                        onClick={() => onVerify(seller.id)}
                        disabled={seller.kyc_status === 'verified'}
                        className="flex-[2] px-4 py-3 bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        <UserCheck className="h-4 w-4" />
                        {seller.kyc_status === 'verified' ? 'Verified' : 'Approve KYC'}
                    </button>
                </div>
            </div>
        </div>
    );
};
