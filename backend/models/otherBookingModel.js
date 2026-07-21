// =====================================================
// MODEL: Other Booking
// Handles all direct database interactions for the
// other_bookings table using PostgreSQL (`pg`).
// =====================================================
const db = require('../config/db');

const TABLE = 'other_bookings';

const OtherBookingModel = {

    // ---------------------------------------------------
    // Get the last inserted ticket number (used to auto
    // generate the next ticket number, e.g. OB-000001)
    // ---------------------------------------------------
    async getLastTicketNo() {
        const { rows } = await db.query(
            `SELECT ticket_no FROM ${TABLE} ORDER BY id DESC LIMIT 1`
        );
        return rows.length ? rows[0].ticket_no : null;
    },

    // ---------------------------------------------------
    // Check if a ticket number already exists (duplicate check)
    // ---------------------------------------------------
    async ticketExists(ticket_no, excludeId = null) {
        let sql = `SELECT id FROM ${TABLE} WHERE ticket_no = $1`;
        const params = [ticket_no];
        if (excludeId) {
            sql += ' AND id != $2';
            params.push(excludeId);
        }
        const { rows } = await db.query(sql, params);
        return rows.length > 0;
    },

    // ---------------------------------------------------
    // Check if a seat is already booked for the same
    // journey date + from/to + operator (basic duplicate
    // seat protection)
    // ---------------------------------------------------
    async seatAlreadyBooked(journey_date, seat_number, operator, excludeId = null) {
        let sql = `SELECT id FROM ${TABLE}
                   WHERE journey_date = $1 AND seat_number = $2 AND operator = $3
                   AND booking_status != 'Cancelled'`;
        const params = [journey_date, seat_number, operator];
        if (excludeId) {
            sql += ' AND id != $4';
            params.push(excludeId);
        }
        const { rows } = await db.query(sql, params);
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
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)
            RETURNING id
        `;
        const params = [
            data.ticket_no, data.booking_date, data.journey_date, data.from_place, data.to_place,
            data.operator, data.coach, data.journey_time,
            data.passenger_name, data.passenger_mobile, data.passenger_gender, data.passenger_age,
            data.seat_type, data.seat_number, data.pickup_point, data.drop_point,
            data.fare, data.discount, data.gst, data.net_amount, data.paid_amount, data.due_amount,
            data.payment_mode, data.pnr, data.bus_number, data.remarks, data.booking_status
        ];
        const { rows } = await db.query(sql, params);
        return rows[0].id;
    },

    // ---------------------------------------------------
    // Update an existing booking
    // ---------------------------------------------------
    async update(id, data) {
        const sql = `
            UPDATE ${TABLE} SET
                booking_date = $1, journey_date = $2, from_place = $3, to_place = $4,
                operator = $5, coach = $6, journey_time = $7,
                passenger_name = $8, passenger_mobile = $9, passenger_gender = $10, passenger_age = $11,
                seat_type = $12, seat_number = $13, pickup_point = $14, drop_point = $15,
                fare = $16, discount = $17, gst = $18, net_amount = $19, paid_amount = $20, due_amount = $21,
                payment_mode = $22, pnr = $23, bus_number = $24, remarks = $25, booking_status = $26,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $27
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
        const { rowCount } = await db.query(sql, params);
        return rowCount;
    },

    // ---------------------------------------------------
    // Delete a booking
    // ---------------------------------------------------
    async remove(id) {
        const { rowCount } = await db.query(`DELETE FROM ${TABLE} WHERE id = $1`, [id]);
        return rowCount;
    },

    // ---------------------------------------------------
    // Get single booking by ID
    // ---------------------------------------------------
    async findById(id) {
        const { rows } = await db.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
        return rows[0] || null;
    },

    // ---------------------------------------------------
    // Get all bookings (most recent first)
    // ---------------------------------------------------
    async findAll() {
        const { rows } = await db.query(`SELECT * FROM ${TABLE} ORDER BY id DESC`);
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
            sql = `SELECT * FROM ${TABLE} WHERE journey_date = $1 ORDER BY id DESC`;
            params = [keyword];
        } else {
            // ILIKE is used in Postgres for case-insensitive search
            sql = `SELECT * FROM ${TABLE} WHERE ${column} ILIKE $1 ORDER BY id DESC`;
            params = [`%${keyword}%`];
        }

        const { rows } = await db.query(sql, params);
        return rows;
    }
};

module.exports = OtherBookingModel;
