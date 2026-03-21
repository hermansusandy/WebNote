const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('Missing DATABASE_URL env var');

const client = new Client({ connectionString });

async function debug() {
    console.log('Debugging database state...');
    try {
        await client.connect();
        const result = await client.query(`select to_regclass('public.pages') as pages_table`);
        const table = result.rows[0]?.pages_table;

        if (!table) {
            console.log('CONCLUSION: Table "pages" DOES NOT exist.');
        } else {
            console.log('CONCLUSION: Table "pages" exists.');
        }
    } catch (e) {
        console.log('Exception:', e);
    } finally {
        await client.end().catch(() => {});
    }
}

debug();
