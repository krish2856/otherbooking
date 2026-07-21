// =====================================================
// MODEL: Other Booking
// Handles all direct database interactions for the
// other_bookings table.
// =====================================================
const db = require('../config/db');

const TABLE = 'other_bookings';

const OtherBookingModel = {

    // ---------------------------------------------------
    // Get the last inserted ticket number (used to auto
    // generate the next ticket number, e.g. OB-000001)
    // ---------------------------------------------------
    async getLastTicketNo() {
        const [rows] = await db.query(
            `SELECT ticket_no FROM ${TABLE} ORDER BY id DESC LIMIT 1`
        );
        return rows.length ? rows[0].ticket_no : null;
    },

    // ---------------------------------------------------
    // Check if a ticket number already exists (duplicate check)
    // ---------------------------------------------------
    async ticketExists(ticket_no, excludeId = null) {
        let sql = `SELECT id FROM ${TABLE} WHERE ticket_no = ?`;
        const params = [ticket_no];
        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }
        const [rows] = await db.query(sql, params);
        return rows.length > 0;
    },

    // ---------------------------------------------------
    // Check if a seat is already booked for the same
    // journey date + from/to + operator (basic duplicate
    // seat protection)
    // ---------------------------------------------------
    async seatAlreadyBooked(journey_date, seat_number, operator, excludeId = null) {
        let sql = `SELECT id FROM ${TABLE}
                   WHERE journey_date = ? AND seat_number = ? AND operator = ?
                   AND booking_status != 'Cancelled'`;
        const params = [journey_date, seat_number, operator];
        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }
        const [rows] = await db.query(sql, params);
        return rows.length > 0;
    },

    // ---------------------------------------------------
    // Create a new booking
    // ---------------------------------------------------
    async create(data) {
        const sql = `
            INSERT INTO ${TABLE}
            (ticket_no, booking_date, journey_date, from_place, to_place, operator, coach, journey_time,
             passenger_name, passenger_mobile, passenger_gender, passenger_age,
             seat_type, seat_number, pickup_point, drop_point,
             fare, discount, gst, net_amount, paid_amount, due_amount,
             payment_mode, pnr, bus_number, remarks, booking_status)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;
        const params = [
            data.ticket_no, data.booking_date, data.journey_date, data.from_place, data.to_place,
            data.operator, data.coach, data.journey_time,
            data.passenger_name, data.passenger_mobile, data.passenger_gender, data.passenger_age,
            data.seat_type, data.seat_number, data.pickup_point, data.drop_point,
            data.fare, data.discount, data.gst, data.net_amount, data.paid_amount, data.due_amount,
            data.payment_mode, data.pnr, data.bus_number, data.remarks, data.booking_status
        ];
        const [result] = await db.query(sql, params);
        return result.insertId;
    },

    // ---------------------------------------------------
    // Update an existing booking
    // ---------------------------------------------------
    async update(id, data) {
        const sql = `
            UPDATE ${TABLE} SET
                booking_date = ?, journey_date = ?, from_place = ?, to_place = ?,
                operator = ?, coach = ?, journey_time = ?,
                passenger_name = ?, passenger_mobile = ?, passenger_gender = ?, passenger_age = ?,
                seat_type = ?, seat_number = ?, pickup_point = ?, drop_point = ?,
                fare = ?, discount = ?, gst = ?, net_amount = ?, paid_amount = ?, due_amount = ?,
                payment_mode = ?, pnr = ?, bus_number = ?, remarks = ?, booking_status = ?
            WHERE id = ?
        `;
        const params = [
            data.booking_date, data.journey_date, data.from_place, data.to_place,
            data.operator, data.coach, data.journey_time,
            data.passenger_name, data.passenger_mobile, data.passenger_gender, data.passenger_age,
            data.seat_type, data.seat_number, data.pickup_point, data.drop_point,
            data.fare, data.discount, data.gst, data.net_amount, data.paid_amount, data.due_amount,
            data.payment_mode, data.pnr, data.bus_number, data.remarks, data.booking_status,
            id
        ];
        const [result] = await db.query(sql, params);
        return result.affectedRows;
    },

    // ---------------------------------------------------
    // Delete a booking
    // ---------------------------------------------------
    async remove(id) {
        const [result] = await db.query(`DELETE FROM ${TABLE} WHERE id = ?`, [id]);
        return result.affectedRows;
    },

    // ---------------------------------------------------
    // Get single booking by ID
    // ---------------------------------------------------
    async findById(id) {
        const [rows] = await db.query(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
        return rows[0] || null;
    },

    // ---------------------------------------------------
    // Get all bookings (most recent first)
    // ---------------------------------------------------
    async findAll() {
        const [rows] = await db.query(`SELECT * FROM ${TABLE} ORDER BY id DESC`);
        return rows;
    },

    // ---------------------------------------------------
    // Search bookings by a given field + keyword
    // ---------------------------------------------------
    async search(field, keyword) {
        const allowedFields = {
            ticket_no: 'ticket_no',
            passenger_name: 'passenger_name',
            passenger_mobile: 'passenger_mobile',
            pnr: 'pnr',
            journey_date: 'journey_date'
        };

        const column = allowedFields[field];
        if (!column) {
            throw new Error('Invalid search field');
        }

        let sql;
        let params;

        if (column === 'journey_date') {
            sql = `SELECT * FROM ${TABLE} WHERE journey_date = ? ORDER BY id DESC`;
            params = [keyword];
        } else {
            sql = `SELECT * FROM ${TABLE} WHERE ${column} LIKE ? ORDER BY id DESC`;
            params = [`%${keyword}%`];
        }

        const [rows] = await db.query(sql, params);
        return rows;
    }
};

module.exports = OtherBookingModel;
