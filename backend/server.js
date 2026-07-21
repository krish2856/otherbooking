// =====================================================
// SERVER: Bus Reservation Management System
// Module: Other Booking
// =====================================================
require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');
const cors = require('cors');

const otherBookingRoutes = require('./routes/otherBookingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Root route redirect to index.html
app.get('/', (req, res) => res.redirect('/index.html'));

// Attach API Routes
app.use('/', otherBookingRoutes);

// 404 Handler
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
    }
    res.status(404).send('<h2 style="font-family:sans-serif;text-align:center;margin-top:50px;">404 - Page Not Found</h2>');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Start Server
app.listen(PORT, () => {
    console.log(`=====================================================`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`=====================================================`);
});

module.exports = app;
