const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tjirzgjhnnneetrdorii.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaXJ6Z2pobm5uZWV0cmRvcmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMzU1MjYsImV4cCI6MjA3OTYxMTUyNn0.jrqvkEV9Q17Iytn5Riw_k09HqM5_gncGRd8yQdFJ7S4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verifying connection to Supabase...');

    // Try to select from a table that should exist (e.g., profiles or pages)
    // Even if empty, it should not return a 404 or connection error if the table exists.
    const { data, error } = await supabase.from('pages').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Connection failed or table not found:', error.message);
        if (error.code === 'PGRST204') {
            console.error('Hint: The table "pages" was not found. Did you run the migration SQL?');
        }
    } else {
        console.log('Connection successful! Table "pages" exists.');
    }
}

verify();
