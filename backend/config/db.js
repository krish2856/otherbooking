// =====================================================
// Database Configuration
// Creates a MySQL connection pool using mysql2
// =====================================================
require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bus_reservation_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true // return DATE/DATETIME as strings instead of JS Date objects
});

// Promise wrapper so we can use async/await in models & controllers
const promisePool = pool.promise();

// Test connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ MySQL connection failed:', err.message);
        console.error('   Please check your .env database credentials.');
    } else {
        console.log('✅ MySQL connected successfully to database:', process.env.DB_NAME);
        connection.release();
    }
});

module.exports = promisePool;
