require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_RC8IGebyo6kp@ep-cold-feather-aw8t1ayt-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await pool.query('ALTER TABLE other_bookings ADD COLUMN total_seat INTEGER;');
        console.log("Column added successfully");
    } catch (e) {
        console.error("Error or column already exists:", e.message);
    } finally {
        pool.end();
    }
}
run();
