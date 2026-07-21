// =====================================================
// MODEL: Other Booking
// Handles all database queries for the `other_bookings` table.
// =====================================================
const db = require('../config/db');

const TABLE = 'other_bookings';

const OtherBookingModel = {

    async create(data) {
        const query = `
            INSERT INTO ${TABLE} (
                ticket_no, booking_date, journey_date, from_place, to_place,
                operator, coach, journey_time, passenger_name, passenger_mobile,
                passenger_gender, passenger_age, seat_type, seat_number,
                pickup_point, drop_point, fare, discount, gst, net_amount,
                paid_amount, due_amount, payment_mode, pnr, bus_number, remarks, booking_status
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12, $13, $14,
                $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25, $26, $27
            ) RETURNING *
        `;
        const values = [
            data.ticket_no,
            data.booking_date,
            data.journey_date,
            data.from_place,
            data.to_place,
            data.operator,
            data.coach || null,
            data.journey_time || null,
            data.passenger_name,
            data.passenger_mobile,
            data.passenger_gender || 'Male',
            data.passenger_age || null,
            data.seat_type || 'Seater',
            data.seat_number,
            data.pickup_point || null,
            data.drop_point || null,
            data.fare,
            data.discount || 0,
            data.gst || 0,
            data.net_amount,
            data.paid_amount || 0,
            data.due_amount || 0,
            data.payment_mode || 'Cash',
            data.pnr || null,
            data.bus_number || null,
            data.remarks || null,
            data.booking_status || 'Confirmed'
        ];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async update(id, data) {
        const query = `
            UPDATE ${TABLE} SET
                booking_date = $1, journey_date = $2, from_place = $3, to_place = $4,
                operator = $5, coach = $6, journey_time = $7, passenger_name = $8,
                passenger_mobile = $9, passenger_gender = $10, passenger_age = $11,
                seat_type = $12, seat_number = $13, pickup_point = $14, drop_point = $15,
                fare = $16, discount = $17, gst = $18, net_amount = $19, paid_amount = $20,
                due_amount = $21, payment_mode = $22, pnr = $23, bus_number = $24,
                remarks = $25, booking_status = $26, updated_at = CURRENT_TIMESTAMP
            WHERE id = $27 RETURNING *
        `;
        const values = [
            data.booking_date,
            data.journey_date,
            data.from_place,
            data.to_place,
            data.operator,
            data.coach || null,
            data.journey_time || null,
            data.passenger_name,
            data.passenger_mobile,
            data.passenger_gender || 'Male',
            data.passenger_age || null,
            data.seat_type || 'Seater',
            data.seat_number,
            data.pickup_point || null,
            data.drop_point || null,
            data.fare,
            data.discount || 0,
            data.gst || 0,
            data.net_amount,
            data.paid_amount || 0,
            data.due_amount || 0,
            data.payment_mode || 'Cash',
            data.pnr || null,
            data.bus_number || null,
            data.remarks || null,
            data.booking_status || 'Confirmed',
            id
        ];
        const { rows } = await db.query(query, values);
        return rows[0] || null;
    },

    async remove(id) {
        const { rowCount } = await db.query(`DELETE FROM ${TABLE} WHERE id = $1`, [id]);
        return rowCount > 0;
    },

    async findById(id) {
        const { rows } = await db.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
        return rows[0] || null;
    },

    async findAll() {
        const { rows } = await db.query(`SELECT * FROM ${TABLE} ORDER BY id DESC`);
        return rows;
    },

    async getLastTicketNo() {
        const { rows } = await db.query(`SELECT ticket_no FROM ${TABLE} ORDER BY id DESC LIMIT 1`);
        return rows[0] ? rows[0].ticket_no : null;
    },

    async ticketExists(ticketNo) {
        const { rows } = await db.query(`SELECT id FROM ${TABLE} WHERE ticket_no = $1 LIMIT 1`, [ticketNo]);
        return rows.length > 0;
    },

    async seatAlreadyBooked(journeyDate, seatNumber, operator, excludeId = null) {
        let sql = `SELECT id FROM ${TABLE} WHERE journey_date = $1 AND seat_number = $2 AND operator = $3`;
        const params = [journeyDate, seatNumber, operator];
        if (excludeId) {
            sql += ` AND id != $4`;
            params.push(excludeId);
        }
        sql += ` LIMIT 1`;
        const { rows } = await db.query(sql, params);
        return rows.length > 0;
    },

    async search(field, keyword) {
        const allowedFields = ['ticket_no', 'passenger_name', 'passenger_mobile', 'pnr', 'journey_date'];
        if (!allowedFields.includes(field)) {
            throw new Error(`Invalid search field: ${field}`);
        }
        let query;
        let values;
        if (field === 'journey_date') {
            query = `SELECT * FROM ${TABLE} WHERE journey_date = $1 ORDER BY id DESC`;
            values = [keyword];
        } else {
            query = `SELECT * FROM ${TABLE} WHERE ${field} ILIKE $1 ORDER BY id DESC`;
            values = [`%${keyword}%`];
        }
        const { rows } = await db.query(query, values);
        return rows;
    }
};

module.exports = OtherBookingModel;
