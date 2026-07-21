// =====================================================
// ROUTES: Other Booking API
// =====================================================
const express = require('express');
const router = express.Router();
const OtherBookingController = require('../controllers/otherBookingController');

// Specific GET routes (Must come BEFORE /:id to avoid collision)
router.get('/api/other-bookings/search', OtherBookingController.search);
router.get('/api/other-bookings/next-ticket', OtherBookingController.getNextTicket);

// CRUD routes
router.get('/api/other-bookings', OtherBookingController.getAll);
router.get('/api/other-bookings/:id', OtherBookingController.getOne);
router.post('/api/other-bookings', OtherBookingController.create);
router.put('/api/other-bookings/:id', OtherBookingController.update);
router.delete('/api/other-bookings/:id', OtherBookingController.remove);

module.exports = router;
