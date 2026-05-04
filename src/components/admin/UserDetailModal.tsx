import React from 'react';
import {
    X,
    User,
    Phone,
    Shield,
    Heart,
    CreditCard,
    TrendingUp,
    ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UserDetail {
    id: string;
    full_name: string;
    email: string;
    role: string;
    kyc_status: string;
    created_at: string;
    // Identity Node Data
    title?: string;
    phone_number?: string;
    gender?: string;
    nin?: string;
    marital_status?: string;
    dob?: string;
    occupation?: string;
    position?: string;
    nationality?: string;
    work_address?: string;
    work_phone?: string;
    home_address?: string;
    // Next of Kin
    nok_fullname?: string;
    nok_relationship?: string;
    nok_phone?: string;
    nok_email?: string;
    nok_address?: string;
    // Metrics
    wallet_balance?: number;
}

interface Investment {
    id: string;
    amount: number;
    shares?: number;
    created_at: string;
    listings?: {
        title: string;
        location?: string;
    }
}

interface UserDetailModalProps {
    user: UserDetail | null;
    investments?: Investment[]; // Added investments prop
    isOpen: boolean;
    onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, investments, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    const sections = [
        {
            title: 'Personal Information',
            icon: User,
            fields: [
                { label: 'Title', value: user.title },
                { label: 'Full Name', value: user.full_name },
                { label: 'Gender', value: user.gender },
                { label: 'Date of Birth', value: user.dob ? new Date(user.dob).toLocaleDateString() : null },
                { label: 'Marital Status', value: user.marital_status },
                { label: 'Nationality', value: user.nationality },
            ]
        },
        {
            title: 'Contact Details',
            icon: Phone,
            fields: [
                { label: 'Phone', value: user.phone_number },
                { label: 'Email', value: user.email },
                { label: 'Home Address', value: user.home_address },
                { label: 'Work Phone', value: user.work_phone },
                { label: 'Work Address', value: user.work_address },
            ]
        },
        {
            title: 'Identity & Occupation',
            icon: Shield,
            fields: [
                { label: 'ID No / NIN', value: user.nin },
                { label: 'Occupation', value: user.occupation },
                { label: 'Position', value: user.position },
                { label: 'KYC Status', value: user.kyc_status, isBadge: true },
            ] as { label: string; value: string | undefined | null; isBadge?: boolean }[]
        },
        {
            title: 'Next of Kin',
            icon: Heart,
            fields: [
                { label: 'Full Name', value: user.nok_fullname },
                { label: 'Relationship', value: user.nok_relationship },
                { label: 'Phone', value: user.nok_phone },
                { label: 'Email', value: user.nok_email },
                { label: 'Address', value: user.nok_address },
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className="bg-slate-950 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col scale-in-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 p-8">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    
                    <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                        <div className="h-24 w-24 rounded-2xl bg-slate-900 border-4 border-slate-950 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                            {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="pb-2">
                            <h3 className="text-2xl font-bold text-white">{user.full_name}</h3>
                            <p className="text-blue-100/70 text-sm">Investor ID: {user.id.slice(0, 8)}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 pt-16 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Stats Sidebar */}
                        <div className="md:col-span-1 space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Financial Status</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <CreditCard className="h-4 w-4" />
                                            <span className="text-sm">Wallet</span>
                                        </div>
                                        <span className="text-white font-bold">${user.wallet_balance?.toLocaleString() || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <TrendingUp className="h-4 w-4" />
                                            <span className="text-sm">Investments</span>
                                        </div>
                                        <span className="text-emerald-400 font-bold">Active</span>
                                    </div>
                                </div>
                                <button className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                                    View Transactions
                                    <ChevronRight className="h-3 w-3" />
                                </button>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Property Portfolio</h4>
                                <div className="space-y-4">
                                    {investments && investments.length > 0 ? (
                                        investments.map((inv) => (
                                            <div key={inv.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                                                <p className="text-xs font-bold text-white truncate">{inv.listings?.title || 'Unknown Property'}</p>
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</span>
                                                    <span className="text-emerald-400 font-bold">${inv.amount?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">No Acquisitions</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Info */}
                        <div className="md:col-span-2 space-y-8">
                            {sections.map((section, idx) => (
                                <div key={idx} className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                                        <section.icon className="h-4 w-4 text-blue-500" />
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">{section.title}</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                        {section.fields.map((field, fIdx) => (
                                            <div key={fIdx} className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{field.label}</p>
                                                {field.isBadge ? (
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                                        field.value === 'approved' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                                                    )}>
                                                        {field.value || 'N/A'}
                                                    </span>
                                                ) : (
                                                    <p className="text-sm text-slate-300 font-medium">{field.value || 'Not provided'}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-900/30 border-t border-slate-800 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all"
                    >
                        Close
                    </button>
                    <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                        Export Dossier
                    </button>
                </div>
            </div>
        </div>
    );
};
