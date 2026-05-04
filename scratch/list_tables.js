
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjxpanpgrffwohtigkic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqeHBhbnBncmZmd29odGlna2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzkzODcsImV4cCI6MjA3OTg1NTM4N30._86nwqk8WLq0gH9ENzYohKC4j3sAtEmI6KooFP4hEOE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
    // Try to get table list using a common trick (querying informaton_schema via RPC if possible, or just guessing)
    // Actually, we can try to guess some common names
    const tables = ['properties', 'listings', 'profiles', 'investments', 'wallets', 'transactions'];
    for (const t of tables) {
        const { error } = await supabase.from(t).select('*').limit(0);
        if (error) {
            console.log(`Table ${t}: MISSING (${error.message})`);
        } else {
            console.log(`Table ${t}: EXISTS`);
        }
    }
}

listTables();
