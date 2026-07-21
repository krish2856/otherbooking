// =====================================================
// SERVER: Bus Reservation Management System
// Module: Other Booking
//
// Welcome to the core of the application! This file is
// like the main engine. It sets up the server, connects
// to our routes (URLs), and tells the app where to find
// the visual frontend files (HTML/CSS).
// =====================================================
require('dotenv').config(); // Loads secret keys from a .env file (so they aren't hardcoded)
const express = require('express'); // The web framework we use to build the app
const path = require('path'); // A tool to help us easily locate folders on our computer
const bodyParser = require('body-parser'); // Helps us read data sent from forms
const methodOverride = require('method-override'); // Lets us use advanced HTTP methods like PUT and DELETE
const morgan = require('morgan'); // A tool that logs all server activity in the console for easy debugging
const cors = require('cors'); // Allows our frontend to talk to the backend from a different URL (like Netlify or localhost)

// We bring in the code that tells the server what to do when specific URLs are visited
const otherBookingRoutes = require('./routes/otherBookingRoutes');

const app = express(); // Initialize our server app
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------
// 1. View Engine Setup (Removed)
// ---------------------------------------------------
// We no longer use EJS because the frontend is a separate static app!

// ---------------------------------------------------
// 2. Middleware Configuration
// ---------------------------------------------------
app.use(cors()); // Turns on CORS so the frontend doesn't get blocked
app.use(morgan('dev')); // Turns on activity logging
app.use(bodyParser.json()); // Allows the server to understand JSON data
app.use(bodyParser.urlencoded({ extended: true })); // Allows the server to understand standard form submissions
app.use(methodOverride('_method')); // Essential for HTML forms to send PUT/DELETE requests

// This line is very important: It tells the server where all our static
// files (like images, CSS files, and frontend Javascript) live.
app.use(express.static(path.join(__dirname, '../frontend/public')));

// ---------------------------------------------------
// 3. Routing (Directing Traffic)
// ---------------------------------------------------
// When a user visits the main page "/", we automatically redirect them to the frontend index
app.get('/', (req, res) => res.redirect('/index.html'));
// This line attaches all our custom API routes to the main app
app.use('/', otherBookingRoutes);

// ---------------------------------------------------
// 4. Safety Nets (Error Handlers)
// ---------------------------------------------------
// 404 Handler: If someone types a URL that doesn't exist, they land here.
app.use((req, res) => {
    res.status(404).send('<h2 style="font-family:sans-serif;text-align:center;margin-top:50px;">404 - Page Not Found</h2>');
});

// Global Error Handler: If the server crashes or hits an unexpected bug, this catches it
// and prevents the whole app from going down.
app.use((err, req, res, next) => {
    console.error('Server encountered a problem:', err.stack);
    res.status(500).send('<h2 style="font-family:sans-serif;text-align:center;margin-top:50px;">500 - Server Error</h2>');
});

// ---------------------------------------------------
// 5. Start the Engine!
// ---------------------------------------------------
// Finally, we turn the server on and tell it to listen on the specified port.
app.listen(PORT, () => {
    console.log(`🚌 Other Booking Module running securely at http://localhost:${PORT}/other-booking`);
});
