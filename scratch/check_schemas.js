
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjxpanpgrffwohtigkic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqeHBhbnBncmZmd29odGlna2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzkzODcsImV4cCI6MjA3OTg1NTM4N30._86nwqk8WLq0gH9ENzYohKC4j3sAtEmI6KooFP4hEOE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log('Checking table schemas via RPC/SQL...');
    
    const tables = ['profiles', 'transactions', 'investments', 'messages'];
    
    for (const table of tables) {
        // Since I can't run arbitrary SQL easily via anon key without a specific RPC,
        // I'll try to fetch a row again but specifically check for null/empty.
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`${table} error:`, error.message);
        } else if (data.length === 0) {
            console.log(`${table} is empty. Checking metadata...`);
            // Try to get one row by ordering by created_at or id
            const { data: data2 } = await supabase.from(table).select('*').order('id', { ascending: false }).limit(1);
            if (data2 && data2.length > 0) {
                console.log(`${table} columns:`, Object.keys(data2[0]));
            } else {
                console.log(`${table} has no data at all to infer columns.`);
            }
        } else {
            console.log(`${table} columns:`, Object.keys(data[0]));
        }
    }
}

checkSchema();
