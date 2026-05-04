
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjxpanpgrffwohtigkic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqeHBhbnBncmZmd29odGlna2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzkzODcsImV4cCI6MjA3OTg1NTM4N30._86nwqk8WLq0gH9ENzYohKC4j3sAtEmI6KooFP4hEOE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log('Checking tables...');
    
    // Try to select from properties
    const { data: props, error: propsError } = await supabase.from('properties').select('*').limit(1);
    if (propsError) {
        console.log('Properties table error:', propsError.message);
    } else {
        console.log('Properties table exists.');
    }

    // Try to select from listings
    const { data: listings, error: listingsError } = await supabase.from('listings').select('*').limit(1);
    if (listingsError) {
        console.log('Listings table error:', listingsError.message);
    } else {
        console.log('Listings table exists.');
        console.log('Sample listing:', JSON.stringify(listings[0], null, 2));
    }
}

checkSchema();
