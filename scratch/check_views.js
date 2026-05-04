
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjxpanpgrffwohtigkic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqeHBhbnBncmZmd29odGlna2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzkzODcsImV4cCI6MjA3OTg1NTM4N30._86nwqk8WLq0gH9ENzYohKC4j3sAtEmI6KooFP4hEOE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkViews() {
    console.log('Checking for views...');
    // We can't easily list views without a direct SQL query, but we can try some common ones
    const views = ['active_listings', 'marketplace_listings', 'published_listings'];
    for (const v of views) {
        const { error } = await supabase.from(v).select('*').limit(0);
        if (error) {
            console.log(`View ${v}: MISSING (${error.message})`);
        } else {
            console.log(`View ${v}: EXISTS`);
        }
    }
}

checkViews();
