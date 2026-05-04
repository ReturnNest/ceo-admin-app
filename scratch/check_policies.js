
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjxpanpgrffwohtigkic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqeHBhbnBncmZmd29odGlna2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzkzODcsImV4cCI6MjA3OTg1NTM4N30._86nwqk8WLq0gH9ENzYohKC4j3sAtEmI6KooFP4hEOE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPolicies() {
    console.log('Checking policies on listings...');
    
    const { data, error } = await supabase.rpc('get_policies', { table_name: 'listings' });
    if (error) {
        // If RPC doesn't exist, try a direct query (if allowed)
        console.log('RPC get_policies failed:', error.message);
        
        // Try to query pg_policies directly (usually restricted)
        const { data: policies, error: polError } = await supabase.from('pg_policies').select('*').eq('tablename', 'listings');
        if (polError) {
            console.log('Direct query pg_policies failed:', polError.message);
        } else {
            console.log('Policies:', JSON.stringify(policies, null, 2));
        }
    } else {
        console.log('Policies:', JSON.stringify(data, null, 2));
    }

    // Also check if we can actually READ listings as anon
    const { data: readData, error: readError } = await supabase.from('listings').select('id, title, status').limit(5);
    if (readError) {
        console.log('Anon READ error:', readError.message);
    } else {
        console.log('Anon READ success. Count:', readData.length);
        console.log('Sample IDs:', readData.map(d => d.id));
    }
}

checkPolicies();
