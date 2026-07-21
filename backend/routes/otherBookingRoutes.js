// =====================================================
// ROUTES: Other Booking
// =====================================================
const express = require('express');
const router = express.Router();
const OtherBookingController = require('../controllers/otherBookingController');

// ---- Page route (Removed) ----

// ---- REST API routes ----
router.get('/api/other-bookings/search', OtherBookingController.search);          // must be BEFORE /:id
router.get('/api/other-bookings/next-ticket', OtherBookingController.getNextTicket); // must be BEFORE /:id
router.get('/api/other-bookings/:id', OtherBookingController.getOne);
router.get('/api/other-bookings', OtherBookingController.getAll);
router.post('/api/other-bookings', OtherBookingController.create);
router.put('/api/other-bookings/:id', OtherBookingController.update);
router.delete('/api/other-bookings/:id', OtherBookingController.remove);

module.exports = router;
