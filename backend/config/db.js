// =====================================================
// Database Configuration
// Creates a PostgreSQL connection pool using pg
// =====================================================
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bus_reservation_db',
    port: process.env.DB_PORT || 5432,
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
