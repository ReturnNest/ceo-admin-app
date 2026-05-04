import React, { useEffect, useState } from 'react';
import {
    Users,
    MessageSquare,
    Search
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { ComposeMessageModal } from '../../components/admin/ComposeMessageModal';
import { UserDetailModal } from '../../components/admin/UserDetailModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    kyc_status: string;
    created_at: string;
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
    nok_fullname?: string;
    nok_relationship?: string;
    nok_phone?: string;
    nok_email?: string;
    nok_address?: string;
    wallet_balance?: number;
}

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserProfile | null>(null);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [userInvestments, setUserInvestments] = useState<any[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleSendMessage = (e: React.MouseEvent, user: UserProfile) => {
        e.stopPropagation();
        setSelectedUser(user);
        setIsMessageModalOpen(true);
    };

    const handleViewDetail = async (user: UserProfile) => {
        setSelectedUserForDetail(user);
        setIsDetailModalOpen(true);
        setUserInvestments([]);
        
        try {
            const { data, error } = await supabase
                .from('investments')
                .select(`
                    id,
                    amount,
                    created_at,
                    listings (
                        title,
                        location
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error) {
                setUserInvestments(data || []);
            }
        } catch (err) {
            console.error('Error fetching investments:', err);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">User Management</h2>
                    <p className="text-slate-400 mt-1">View all users and send messages.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 w-full md:w-64"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-900 rounded-2xl animate-pulse"></div>)
                ) : filteredUsers.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                        <Users className="h-12 w-12 mx-auto mb-4 text-slate-700" />
                        <p className="text-slate-500">No users found.</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => handleViewDetail(user)}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 group cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-colors">
                                    <span className="font-bold text-lg uppercase tracking-widest">{user.full_name?.charAt(0) || 'U'}</span>
                                </div>
                                <div className={cn(
                                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                    user.role === 'admin' ? "bg-purple-500/10 text-purple-400" :
                                        user.role === 'seller' ? "bg-amber-500/10 text-amber-400" :
                                            "bg-blue-500/10 text-blue-400"
                                )}>
                                    {user.role || 'User'}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="font-bold text-white truncate">{user.full_name || 'Anonymous User'}</h4>
                                <p className="text-sm text-slate-500 truncate">{user.email || 'No email'}</p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                    Joined {new Date(user.created_at).toLocaleDateString()}
                                </div>
                                <button
                                    onClick={(e) => handleSendMessage(e, user)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-xs font-bold transition-all"
                                >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    Message
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ComposeMessageModal
                recipient={selectedUser}
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
            />

            <UserDetailModal
                user={selectedUserForDetail}
                investments={userInvestments}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
            />
        </div>
    );
};
