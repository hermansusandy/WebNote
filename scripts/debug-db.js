const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tjirzgjhnnneetrdorii.supabase.co';
// Using Service Role Key for debugging to bypass RLS
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaXJ6Z2pobm5uZWV0cmRvcmlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDAzNTUyNiwiZXhwIjoyMDc5NjExNTI2fQ.XX_to4Dr78qDZAwL50O3KQnzKUIy84JhYnTEb36eRx8';

const supabase = createClient(supabaseUrl, serviceKey);

async function debug() {
    console.log('Debugging database state...');

    // 1. Check if we can access the 'pages' table definition
    // We try to insert a dummy row that will definitely fail validation (missing user_id)
    // but if the table doesn't exist, we'll get a specific error.

    try {
        const { error } = await supabase.from('pages').select('*').limit(1);

        if (error) {
            console.log('Select Error:', error);
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                console.log('CONCLUSION: Table "pages" DOES NOT exist.');
            } else {
                console.log('CONCLUSION: Table "pages" exists but select failed (unexpected).');
            }
        } else {
            console.log('CONCLUSION: Table "pages" exists (Select successful).');
        }

    } catch (e) {
        console.log('Exception:', e);
    }
}

debug();
