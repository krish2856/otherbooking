const express = require('express');
const router = express.Router();

const placeholders = [
    { path: '/dashboard', title: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/bus-booking', title: 'Bus Booking', icon: 'bi-ticket-perforated' },
    { path: '/cancellation', title: 'Cancellation', icon: 'bi-arrow-counterclockwise' },
    { path: '/bus-coach', title: 'Bus / Coach', icon: 'bi-bus-front' },
    { path: '/routes', title: 'Routes', icon: 'bi-signpost-split' },
    { path: '/operators', title: 'Operators', icon: 'bi-building' },
    { path: '/passengers', title: 'Passengers', icon: 'bi-people' },
    { path: '/payments', title: 'Payments', icon: 'bi-cash-coin' },
    { path: '/reports', title: 'Reports', icon: 'bi-graph-up-arrow' },
    { path: '/users', title: 'Users', icon: 'bi-people-fill' },
    { path: '/settings', title: 'Settings', icon: 'bi-gear' },
    { path: '/profile', title: 'Profile', icon: 'bi-person' },
];

placeholders.forEach(page => {
    router.get(page.path, (req, res) => {
        res.render('placeholder', { 
            title: page.title, 
            pageIcon: page.icon, 
            currentPath: page.path 
        });
    });
});

// Simple placeholder for logout (ideally would clear session)
router.get('/logout', (req, res) => {
    res.render('placeholder', {
        title: 'Logout',
        pageIcon: 'bi-box-arrow-right',
        currentPath: '/logout'
    });
});

module.exports = router;
