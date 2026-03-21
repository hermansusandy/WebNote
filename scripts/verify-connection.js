const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('Missing DATABASE_URL env var');

const client = new Client({ connectionString });

async function verify() {
    console.log('Verifying connection to Postgres...');
    await client.connect();

    const result = await client.query(
        `select 1
         from information_schema.tables
         where table_schema = 'public' and table_name = 'pages'
         limit 1`
    );

    if (result.rowCount === 1) {
        console.log('Connection successful! Table "pages" exists.');
    } else {
        console.error('Connected, but table "pages" was not found. Did you run migrations?');
        process.exitCode = 2;
    }

    await client.end();
}

verify();
