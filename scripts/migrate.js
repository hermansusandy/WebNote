const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:%40caspo2006%40@db.tjirzgjhnnneetrdorii.supabase.co:5432/postgres';

async function migrate() {
    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const migrationPath = path.join(__dirname, '../supabase/migrations/0000_init_schema.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running migration...');
        await client.query(migrationSql);
        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
