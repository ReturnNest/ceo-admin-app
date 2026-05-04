import React, { useEffect, useState } from 'react';
import {
    Search,
    Calendar,
    Terminal,
    User,
    AlertCircle
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AuditLog {
    id: string;
    admin_id: string;
    action: string;
    target_id: string;
    details: any;
    created_at: string;
    admin_email?: string;
}

export const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            try {
                // Fetch Security Audit Logs
                const { data: auditData, error: auditError } = await supabase
                    .from('audit_logs')
                    .select('*, profiles(email)')
                    .order('created_at', { ascending: false });

                // Fetch User Purchases (Investments)
                const { data: purchaseData, error: purchaseError } = await supabase
                    .from('investments')
                    .select('*, profiles(email, full_name), listings(title)')
                    .order('created_at', { ascending: false });

                const combinedLogs: any[] = [];

                if (!auditError && auditData) {
                    combinedLogs.push(...auditData.map(l => ({
                        ...l,
                        type: 'SECURITY',
                        admin_email: l.profiles?.email,
                        display_action: l.action,
                        display_details: JSON.stringify(l.details)
                    })));
                }

                if (!purchaseError && purchaseData) {
                    combinedLogs.push(...purchaseData.map(p => ({
                        ...p,
                        type: 'PURCHASE',
                        admin_email: p.profiles?.email || p.profiles?.full_name,
                        display_action: 'PROPERTY_PURCHASED',
                        display_details: `Acquired node: ${p.listings?.title || 'Unknown Asset'} for $${parseFloat(p.amount || '0').toLocaleString()}`
                    })));
                }

                // Sort combined logs by date
                combinedLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setLogs(combinedLogs);

            } catch (err) {
                console.error('Audit logs fetch error:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchLogs();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Security Audit Logs</h2>
                    <p className="text-slate-400 mt-1">Full immutable history of administrative actions.</p>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-bold uppercase tracking-tight">Compliance Enabled</span>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1-2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter by admin, action, or target ID..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        />
                    </div>
                    <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Time Range
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {logs.length === 0 && !loading ? (
                        <div className="text-center py-20">
                            <Terminal className="h-12 w-12 mx-auto mb-4 text-slate-700" />
                            <p className="text-slate-500 font-mono tracking-tight text-sm"># SYSTEM: No records detected in global ledger.</p>
                        </div>
                    ) : (
                        logs.map((log: any) => (
                            <div key={log.id} className="flex gap-4 p-4 rounded-xl hover:bg-slate-800/30 transition-colors border border-transparent hover:border-slate-800 group relative overflow-hidden">
                                <div className={cn(
                                    "absolute top-0 left-0 w-1 h-full opacity-50",
                                    log.type === 'PURCHASE' ? "bg-emerald-500" : "bg-blue-500"
                                )}></div>
                                <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400 group-hover:text-blue-400 transition-colors">
                                    {log.type === 'PURCHASE' ? <AlertCircle className="h-5 w-5 text-emerald-400" /> : <User className="h-5 w-5" />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">
                                                {log.display_action}
                                            </p>
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                                log.type === 'PURCHASE' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            )}>
                                                {log.type}
                                            </span>
                                        </div>
                                        <time className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(log.created_at).toLocaleString()}</time>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                        <span className="text-blue-400 font-bold">{log.admin_email || 'System'}</span>
                                        <span className="opacity-30">•</span>
                                        <span className="truncate italic">{log.display_details}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Dummy Entries for Preview if empty */}
                    {logs.length === 0 && (
                        <div className="space-y-4 opacity-40">
                            {[1, 2].map(i => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-800">
                                    <div className="shrink-0 h-10 w-10 bg-slate-800 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                                        <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
