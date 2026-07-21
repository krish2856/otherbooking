// =====================================================
// CONTROLLER: Other Booking
// 
// Think of this controller as the "middleman" or "manager".
// When the frontend asks for data or wants to save a new booking,
// it talks to this file. This file then talks to the database (the Model),
// does any necessary calculations, and sends the result back to the frontend.
// =====================================================
const OtherBookingModel = require('../models/otherBookingModel');
const { validateBooking } = require('./otherBookingValidator');

const TICKET_PREFIX = 'OB-';
const TICKET_PAD_LENGTH = 6;

// ---------------------------------------------------
// Helper: Generate Next Ticket Number
// What it does: Looks at the database for the last ticket created
// (like OB-000004) and automatically generates the next one (OB-000005).
// ---------------------------------------------------
async function generateNextTicketNo() {
    const lastTicket = await OtherBookingModel.getLastTicketNo();
    let nextNumber = 1;

    if (lastTicket) {
        const numericPart = parseInt(lastTicket.replace(TICKET_PREFIX, ''), 10);
        if (!isNaN(numericPart)) {
            nextNumber = numericPart + 1;
        }
    }

    return TICKET_PREFIX + String(nextNumber).padStart(TICKET_PAD_LENGTH, '0');
}

// ---------------------------------------------------
// Helper: Calculate Money (Server-Side)
// What it does: We never completely trust the math done in the user's browser
// because it could be tampered with. This function recalculates the final
// price and amount due securely on our server before saving to the database.
// ---------------------------------------------------
function calculateAmounts(body) {
    const fare = parseFloat(body.fare) || 0;
    const discount = parseFloat(body.discount) || 0;
    const gst = parseFloat(body.gst) || 0;
    const paid = parseFloat(body.paid_amount) || 0;

    const netAmount = Math.max(fare - discount + gst, 0);
    const dueAmount = Math.max(netAmount - paid, 0);

    return {
        fare: fare.toFixed(2),
        discount: discount.toFixed(2),
        gst: gst.toFixed(2),
        net_amount: netAmount.toFixed(2),
        paid_amount: paid.toFixed(2),
        due_amount: dueAmount.toFixed(2)
    };
}

const OtherBookingController = {

    // renderPage function removed because frontend is now static HTML

    // ---------------------------------------------------
    // API Route: Get All Bookings
    // Fetches every booking from the database and sends it back 
    // as raw JSON data (useful for updating the table without refreshing the page).
    // ---------------------------------------------------
    async getAll(req, res) {
        try {
            const bookings = await OtherBookingModel.findAll();
            res.json({ success: true, data: bookings });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ---------------------------------------------------
    // API Route: Get Next Ticket Number
    // A quick way for the frontend to ask "Hey, what's the next ticket number?"
    // ---------------------------------------------------
    async getNextTicket(req, res) {
        try {
            const nextTicketNo = await generateNextTicketNo();
            res.json({ success: true, ticket_no: nextTicketNo });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ---------------------------------------------------
    // GET /api/other-bookings/:id
    // Returns a single booking
    // ---------------------------------------------------
    async getOne(req, res) {
        try {
            const booking = await OtherBookingModel.findById(req.params.id);
            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            res.json({ success: true, data: booking });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ---------------------------------------------------
    // GET /api/other-bookings/search?field=&keyword=
    // ---------------------------------------------------
    async search(req, res) {
        try {
            const { field, keyword } = req.query;
            if (!field || !keyword) {
                return res.status(400).json({ success: false, message: 'field and keyword are required' });
            }
            const results = await OtherBookingModel.search(field, keyword.trim());
            res.json({ success: true, data: results });
        } catch (err) {
            console.error(err);
            res.status(400).json({ success: false, message: err.message });
        }
    },

    // ---------------------------------------------------
    // POST /api/other-bookings
    // Create a new booking
    // ---------------------------------------------------
    async create(req, res) {
        try {
            const errors = validateBooking(req.body);
            if (errors.length > 0) {
                return res.status(422).json({ success: false, message: errors.join(' ') , errors });
            }

            // Auto-generate ticket number (ignore any client-supplied value)
            const ticket_no = await generateNextTicketNo();

            // Duplicate ticket check (defensive, should not happen with auto-gen)
            const duplicate = await OtherBookingModel.ticketExists(ticket_no);
            if (duplicate) {
                return res.status(409).json({ success: false, message: 'Ticket number already exists. Please try again.' });
            }

            // Duplicate seat check
            const seatTaken = await OtherBookingModel.seatAlreadyBooked(
                req.body.journey_date, req.body.seat_number, req.body.operator
            );
            if (seatTaken) {
                return res.status(409).json({
                    success: false,
                    message: `Seat ${req.body.seat_number} is already booked for this operator on ${req.body.journey_date}.`
                });
            }

            const amounts = calculateAmounts(req.body);

            const data = {
                ticket_no,
                booking_date: req.body.booking_date,
                journey_date: req.body.journey_date,
                from_place: req.body.from_place,
                to_place: req.body.to_place,
                operator: req.body.operator,
                coach: req.body.coach || null,
                journey_time: req.body.journey_time || null,
                passenger_name: req.body.passenger_name,
                passenger_mobile: req.body.passenger_mobile,
                passenger_gender: req.body.passenger_gender || 'Male',
                passenger_age: req.body.passenger_age || null,
                seat_type: req.body.seat_type || null,
                seat_number: req.body.seat_number,
                pickup_point: req.body.pickup_point || null,
                drop_point: req.body.drop_point || null,
                ...amounts,
                payment_mode: req.body.payment_mode,
                pnr: req.body.pnr || null,
                bus_number: req.body.bus_number || null,
                remarks: req.body.remarks || null,
                booking_status: req.body.booking_status
            };

            const insertId = await OtherBookingModel.create(data);
            const newBooking = await OtherBookingModel.findById(insertId);

            res.status(201).json({ success: true, message: 'Booking created successfully.', data: newBooking });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ---------------------------------------------------
    // PUT /api/other-bookings/:id
    // Update an existing booking
    // ---------------------------------------------------
    async update(req, res) {
        try {
            const { id } = req.params;

            const existing = await OtherBookingModel.findById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }

            const errors = validateBooking(req.body);
            if (errors.length > 0) {
                return res.status(422).json({ success: false, message: errors.join(' '), errors });
            }

            // Duplicate seat check (excluding current record)
            const seatTaken = await OtherBookingModel.seatAlreadyBooked(
                req.body.journey_date, req.body.seat_number, req.body.operator, id
            );
            if (seatTaken) {
                return res.status(409).json({
                    success: false,
                    message: `Seat ${req.body.seat_number} is already booked for this operator on ${req.body.journey_date}.`
                });
            }

            const amounts = calculateAmounts(req.body);

            const data = {
                booking_date: req.body.booking_date,
                journey_date: req.body.journey_date,
                from_place: req.body.from_place,
                to_place: req.body.to_place,
                operator: req.body.operator,
                coach: req.body.coach || null,
                journey_time: req.body.journey_time || null,
                passenger_name: req.body.passenger_name,
                passenger_mobile: req.body.passenger_mobile,
                passenger_gender: req.body.passenger_gender || 'Male',
                passenger_age: req.body.passenger_age || null,
                seat_type: req.body.seat_type || null,
                seat_number: req.body.seat_number,
                pickup_point: req.body.pickup_point || null,
                drop_point: req.body.drop_point || null,
                ...amounts,
                payment_mode: req.body.payment_mode,
                pnr: req.body.pnr || null,
                bus_number: req.body.bus_number || null,
                remarks: req.body.remarks || null,
                booking_status: req.body.booking_status
            };

            await OtherBookingModel.update(id, data);
            const updated = await OtherBookingModel.findById(id);

            res.json({ success: true, message: 'Booking updated successfully.', data: updated });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    // ---------------------------------------------------
    // DELETE /api/other-bookings/:id
    // ---------------------------------------------------
    async remove(req, res) {
        try {
            const { id } = req.params;
            const existing = await OtherBookingModel.findById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            await OtherBookingModel.remove(id);
            res.json({ success: true, message: 'Booking deleted successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = OtherBookingController;
