import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

interface ComposeMessageModalProps {
    recipient: { id: string; full_name?: string; email?: string } | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({ recipient, isOpen, onClose }) => {
    const { user } = useAuth();
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('SYSTEM');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);

    if (!isOpen || !recipient) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSending(true);
        try {
            // Attempt insert with new columns
            const { error } = await supabase
                .from('messages')
                .insert({
                    sender_id: user.id,
                    recipient_id: recipient.id,
                    subject,
                    content,
                    category,
                    status: 'sent'
                });

            if (error) {
                console.warn('Initial insert failed, attempting fallback without category...', error);
                
                // Fallback: Send without the new columns in case migration hasn't been applied or cache is stale
                const { error: fallbackError } = await supabase
                    .from('messages')
                    .insert({
                        sender_id: user.id,
                        recipient_id: recipient.id,
                        subject,
                        content,
                    });

                if (fallbackError) throw fallbackError;
            }

            alert('Message dispatched successfully through telemetry uplink.');
            setSubject('');
            setContent('');
            onClose();
        } catch (err: any) {
            console.error('Error sending message:', err);
            alert('Failed to send message: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-white">Send Message</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSend} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-400">To:</label>
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-white">
                            {recipient.full_name || recipient.email || 'Unknown User'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-400">Subject</label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Message Subject"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-400">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="SYSTEM">System Update</option>
                            <option value="PROTOCOL">Security Protocol</option>
                            <option value="ACQUISITION">Asset Acquisition</option>
                            <option value="SUPPORT">Support Response</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-400">Message</label>
                        <textarea
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            placeholder="Write your message here..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={sending}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Message
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
