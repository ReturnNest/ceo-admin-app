import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        async function checkAdmin() {
            try {
                console.log('Starting admin check...');

                // Get session first - it's faster and less likely to hang
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session fetch error:', sessionError);
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                if (!session?.user) {
                    console.log('No session/user found.');
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                const user = session.user;
                console.log('User found:', user.email, 'Checking profile...');

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile from DB:', profileError);
                    setIsAdmin(false);
                } else if (!profile) {
                    console.warn('Profile found but is null/empty.');
                    setIsAdmin(false);
                } else {
                    console.log('Profile role received:', profile.role);
                    setRole(profile.role);
                    setIsAdmin(profile.role === 'admin');
                }
            } catch (err) {
                console.error('Critical RBAC catch:', err);
                setIsAdmin(false);
            } finally {
                setLoading(false);
                console.log('RBAC check complete.');
            }
        }

        checkAdmin();
    }, []);

    return { isAdmin, loading, role };
}
