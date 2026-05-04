
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjxpanpgrffwohtigkic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqeHBhbnBncmZmd29odGlna2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzkzODcsImV4cCI6MjA3OTg1NTM4N30._86nwqk8WLq0gH9ENzYohKC4j3sAtEmI6KooFP4hEOE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
    console.log('Checking users table...');
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Users EXISTS. Count:', data.length);
        if (data.length > 0) console.log('Columns:', Object.keys(data[0]));
    }
}

checkUsers();
