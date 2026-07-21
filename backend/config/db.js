// =====================================================
// Database Configuration
// Creates a PostgreSQL connection pool using pg
// =====================================================
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: 'ep-cold-feather-aw8t1ayt-pooler.c-12.us-east-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_RC8IGebyo6kp',
    database: 'neondb',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

// Test connection on startup
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ PostgreSQL connection failed:', err.message);
        console.error('   Please check your .env database credentials.');
    } else {
        console.log('✅ PostgreSQL connected successfully to database:', process.env.DB_NAME);
        release();
    }
});

module.exports = pool;
