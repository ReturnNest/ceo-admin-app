import React, { useEffect, useState } from 'react';
import { 
    MessageSquare, 
    Search,
    Calendar,
    User,
    Clock,
    ChevronRight,
    Send,
    Filter
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Message {
    id: string;
    sender_id: string;
    recipient_id: string;
    subject: string;
    content: string;
    status: string;
    created_at: string;
    recipient: {
        full_name: string;
        email: string;
    };
    sender: {
        full_name: string;
    };
}

export const MessageHistory: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    async function fetchMessages() {
        try {
            // Note: messages table structure from 20260131_create_messages_table.sql
            // columns: id, sender_id, recipient_id, subject, content, status, created_at
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                // Fetch profiles for enrichment
                const profileIds = Array.from(new Set([
                    ...data.map(m => m.sender_id),
                    ...data.map(m => m.recipient_id)
                ]));

                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .in('id', profileIds);
                
                const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p]) || []);

                const enriched = data.map(m => ({
                    ...m,
                    recipient: profileMap[m.recipient_id] || { full_name: 'Unknown User', email: 'N/A' },
                    sender: profileMap[m.sender_id] || { full_name: 'System' }
                }));

                setMessages(enriched);
            } else {
                setMessages([]);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    }

    const filteredMessages = messages.filter(m => 
        m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Message History</h2>
                    <p className="text-slate-400 mt-1">Review all communications sent to users.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Message List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 w-full text-sm"
                        />
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-h-[600px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-800/50 animate-pulse border-b border-slate-800/50 last:border-0"></div>)
                        ) : filteredMessages.length === 0 ? (
                            <div className="py-12 text-center text-slate-500">
                                <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">No messages found</p>
                            </div>
                        ) : (
                            filteredMessages.map((msg) => (
                                <button
                                    key={msg.id}
                                    onClick={() => setSelectedMessage(msg)}
                                    className={cn(
                                        "w-full text-left p-4 border-b border-slate-800 last:border-0 transition-all hover:bg-slate-800/50",
                                        selectedMessage?.id === msg.id ? "bg-blue-600/10 border-l-4 border-l-blue-500" : ""
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm text-white truncate pr-4">{msg.subject}</h4>
                                        <span className="text-[10px] text-slate-500 min-w-fit">{new Date(msg.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 truncate mb-2">To: {msg.recipient.full_name}</p>
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md",
                                            msg.status === 'sent' ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"
                                        )}>
                                            {msg.status}
                                        </span>
                                        <ChevronRight className="h-3 w-3 text-slate-600" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Message Preview */}
                <div className="lg:col-span-2">
                    {selectedMessage ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden h-full flex flex-col shadow-xl">
                            <div className="p-8 border-b border-slate-800 bg-slate-800/30">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                                            <Send className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{selectedMessage.subject}</h3>
                                            <p className="text-slate-400 text-sm">Communication Transcript</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 justify-end mb-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(selectedMessage.created_at).toLocaleString()}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Ref: {selectedMessage.id.slice(0, 8)}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <User className="h-3 w-3" /> From
                                        </p>
                                        <p className="text-sm font-bold text-white">{selectedMessage.sender.full_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <User className="h-3 w-3" /> To
                                        </p>
                                        <p className="text-sm font-bold text-white">{selectedMessage.recipient.full_name}</p>
                                        <p className="text-xs text-slate-500">{selectedMessage.recipient.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 p-8 bg-slate-950/30 min-h-[300px]">
                                <div className="prose prose-invert max-w-none">
                                    <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {selectedMessage.content}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                    Archive Record
                                </div>
                                <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all">
                                    Re-send Message
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl h-full flex flex-col items-center justify-center p-20 text-center min-h-[500px]">
                            <div className="h-20 w-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6">
                                <MessageSquare className="h-10 w-10 text-slate-700" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-400">Select a message</h3>
                            <p className="text-slate-600 mt-2 max-w-xs">Pick a message from the history on the left to view the full transcript and recipient details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
