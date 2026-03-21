const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

async function migrate() {
    if (!connectionString) {
        throw new Error('Missing DATABASE_URL env var');
    }

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
