import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { LogIn, ShieldCheck, Mail, Lock } from 'lucide-react';

export const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                if (authError.message === 'Invalid login credentials') {
                    throw new Error('Invalid login. Please ensure this email is registered in your Supabase Auth dashboard.');
                }
                throw authError;
            }

            // Immediately check role
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Authentication successful but user not found.');
            
            console.log('Authenticated User ID:', user.id);

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error('Detailed Profile fetch error:', profileError);
                await supabase.auth.signOut();
                const errorMsg = profileError.message || 'Unknown error';
                const errorCode = profileError.code || 'No code';
                
                if (errorCode === 'PGRST116') {
                    throw new Error('Access denied: Administrator profile not found. Please ensure your account exists in the profiles table.');
                }
                throw new Error(`Access denied: ${errorMsg} (Code: ${errorCode}). Check database connection and RLS policies.`);
            }

            if (profile?.role !== 'admin') {
                await supabase.auth.signOut();
                throw new Error('Access denied: These credentials are not authorized for the Admin Console.');
            }

            // Success will trigger a reload or navigation via effect in App.tsx
            window.location.href = '/admin';
        } catch (err: any) {
            setError(err.message || 'Login failed');
            setLoading(false);
            // Ensure we don't leave a half-logged-in state if verification failed
            if (err.message.includes('Access denied')) {
                await supabase.auth.signOut();
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 font-sans">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mb-6">
                        <ShieldCheck className="h-10 w-10 text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Admin Gateway</h2>
                    <p className="mt-2 text-slate-400">Restricted access for marketplace administrators.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 ml-1">Admin Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 ml-1">Secret Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5" />
                                    <span>Authenticate Portal</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center">
                    <p className="text-xs text-slate-600 uppercase tracking-widest font-bold">Secure Environment v1.0.4</p>
                </div>
            </div>
        </div>
    );
};
