
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjxpanpgrffwohtigkic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqeHBhbnBncmZmd29odGlna2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzkzODcsImV4cCI6MjA3OTg1NTM4N30._86nwqk8WLq0gH9ENzYohKC4j3sAtEmI6KooFP4hEOE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function auditData() {
    console.log('--- Auditing Profiles ---');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
    if (pError) console.log('Profiles Error:', pError.message);
    else console.log('Profile Columns:', Object.keys(profiles[0] || {}));

    console.log('\n--- Auditing Transactions/Investments ---');
    const tables = ['transactions', 'investments', 'purchases'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`${table}: MISSING (${error.message})`);
        } else {
            console.log(`${table}: EXISTS. Columns:`, Object.keys(data[0] || {}));
            if (data.length > 0) console.log(`${table} Sample:`, data[0]);
        }
    }

    console.log('\n--- Auditing Messages ---');
    const { data: messages, error: mError } = await supabase.from('messages').select('*').limit(1);
    if (mError) console.log('Messages Error:', mError.message);
    else {
        console.log('Messages: EXISTS. Columns:', Object.keys(messages[0] || {}));
    }
}

auditData();
