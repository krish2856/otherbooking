// =====================================================
// CONTROLLER: Other Booking
// Handles business logic, ticket generation, math calculations, and API handlers.
// =====================================================
const OtherBookingModel = require('../models/otherBookingModel');
const { validateBooking } = require('./otherBookingValidator');

const TICKET_PREFIX = 'OB-';
const TICKET_PAD_LENGTH = 6;

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

    async getAll(req, res) {
        try {
            const bookings = await OtherBookingModel.findAll();
            res.json({ success: true, data: bookings });
        } catch (err) {
            console.error('getAll error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async getNextTicket(req, res) {
        try {
            const nextTicketNo = await generateNextTicketNo();
            res.json({ success: true, ticket_no: nextTicketNo });
        } catch (err) {
            console.error('getNextTicket error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async getOne(req, res) {
        try {
            const booking = await OtherBookingModel.findById(req.params.id);
            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            res.json({ success: true, data: booking });
        } catch (err) {
            console.error('getOne error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async search(req, res) {
        try {
            const { field, keyword } = req.query;
            if (!field || !keyword) {
                return res.status(400).json({ success: false, message: 'field and keyword are required' });
            }
            const results = await OtherBookingModel.search(field, keyword.trim());
            res.json({ success: true, data: results });
        } catch (err) {
            console.error('search error:', err);
            res.status(400).json({ success: false, message: err.message });
        }
    },

    async create(req, res) {
        try {
            const errors = validateBooking(req.body);
            if (errors.length > 0) {
                return res.status(422).json({ success: false, message: errors.join(' '), errors });
            }

            const ticket_no = await generateNextTicketNo();

            const seatTaken = await OtherBookingModel.seatAlreadyBooked(
                req.body.journey_date, req.body.seat_number, req.body.operator
            );
            if (seatTaken) {
                return res.status(409).json({
                    success: false,
                    message: `Seat ${req.body.seat_number} is already booked for ${req.body.operator} on ${req.body.journey_date}.`
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
                coach: req.body.coach,
                journey_time: req.body.journey_time,
                passenger_name: req.body.passenger_name,
                passenger_mobile: req.body.passenger_mobile,
                passenger_gender: req.body.passenger_gender,
                passenger_age: req.body.passenger_age,
                seat_type: req.body.seat_type,
                seat_number: req.body.seat_number,
                pickup_point: req.body.pickup_point,
                drop_point: req.body.drop_point,
                fare: amounts.fare,
                discount: amounts.discount,
                gst: amounts.gst,
                net_amount: amounts.net_amount,
                paid_amount: amounts.paid_amount,
                due_amount: amounts.due_amount,
                payment_mode: req.body.payment_mode,
                pnr: req.body.pnr,
                bus_number: req.body.bus_number,
                remarks: req.body.remarks,
                booking_status: req.body.booking_status || 'Confirmed'
            };

            const created = await OtherBookingModel.create(data);
            res.status(201).json({ success: true, message: 'Booking created successfully', data: created });
        } catch (err) {
            console.error('create error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const existing = await OtherBookingModel.findById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }

            const errors = validateBooking(req.body, true);
            if (errors.length > 0) {
                return res.status(422).json({ success: false, message: errors.join(' '), errors });
            }

            const seatTaken = await OtherBookingModel.seatAlreadyBooked(
                req.body.journey_date, req.body.seat_number, req.body.operator, id
            );
            if (seatTaken) {
                return res.status(409).json({
                    success: false,
                    message: `Seat ${req.body.seat_number} is already booked for ${req.body.operator} on ${req.body.journey_date}.`
                });
            }

            const amounts = calculateAmounts(req.body);

            const data = {
                booking_date: req.body.booking_date,
                journey_date: req.body.journey_date,
                from_place: req.body.from_place,
                to_place: req.body.to_place,
                operator: req.body.operator,
                coach: req.body.coach,
                journey_time: req.body.journey_time,
                passenger_name: req.body.passenger_name,
                passenger_mobile: req.body.passenger_mobile,
                passenger_gender: req.body.passenger_gender,
                passenger_age: req.body.passenger_age,
                seat_type: req.body.seat_type,
                seat_number: req.body.seat_number,
                pickup_point: req.body.pickup_point,
                drop_point: req.body.drop_point,
                fare: amounts.fare,
                discount: amounts.discount,
                gst: amounts.gst,
                net_amount: amounts.net_amount,
                paid_amount: amounts.paid_amount,
                due_amount: amounts.due_amount,
                payment_mode: req.body.payment_mode,
                pnr: req.body.pnr,
                bus_number: req.body.bus_number,
                remarks: req.body.remarks,
                booking_status: req.body.booking_status || 'Confirmed'
            };

            const updated = await OtherBookingModel.update(id, data);
            res.json({ success: true, message: 'Booking updated successfully', data: updated });
        } catch (err) {
            console.error('update error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async remove(req, res) {
        try {
            const { id } = req.params;
            const deleted = await OtherBookingModel.remove(id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            res.json({ success: true, message: 'Booking deleted successfully' });
        } catch (err) {
            console.error('remove error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = OtherBookingController;
