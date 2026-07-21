// =====================================================
// Database Configuration: PostgreSQL (`pg`)
// =====================================================
require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_RC8IGebyo6kp@ep-cold-feather-aw8t1ayt-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

// Verify connection status on boot
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ PostgreSQL connection error:', err.message);
    } else {
        console.log('✅ PostgreSQL connected successfully to Neon Cloud Database');
        release();
    }
});

module.exports = pool;
