
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjxpanpgrffwohtigkic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqeHBhbnBncmZmd29odGlna2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzkzODcsImV4cCI6MjA3OTg1NTM4N30._86nwqk8WLq0gH9ENzYohKC4j3sAtEmI6KooFP4hEOE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDetails() {
    const { data, error } = await supabase.from('listings').select('id, title, status, category, type').limit(10);
    if (error) {
        console.log('Error:', error.message);
    } else {
        console.table(data);
    }
}

checkDetails();
