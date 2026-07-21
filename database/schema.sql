-- =====================================================
-- BUS RESERVATION MANAGEMENT SYSTEM
-- Module: OTHER BOOKING
-- Database Schema for PostgreSQL
-- =====================================================

CREATE TABLE IF NOT EXISTS other_bookings (
    id SERIAL PRIMARY KEY,
    ticket_no VARCHAR(50) UNIQUE NOT NULL,
    booking_date DATE NOT NULL,
    journey_date DATE NOT NULL,
    from_place VARCHAR(100) NOT NULL,
    to_place VARCHAR(100) NOT NULL,
    operator VARCHAR(100) NOT NULL,
    coach VARCHAR(50),
    journey_time VARCHAR(50),
    passenger_name VARCHAR(100) NOT NULL,
    passenger_mobile VARCHAR(15) NOT NULL,
    passenger_gender VARCHAR(20) DEFAULT 'Male',
    passenger_age INT,
    seat_type VARCHAR(50) DEFAULT 'Seater',
    seat_number VARCHAR(50) NOT NULL,
    pickup_point VARCHAR(150),
    drop_point VARCHAR(150),
    fare NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    gst NUMERIC(10, 2) DEFAULT 0.00,
    net_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(10, 2) DEFAULT 0.00,
    due_amount NUMERIC(10, 2) DEFAULT 0.00,
    payment_mode VARCHAR(50) DEFAULT 'Cash',
    pnr VARCHAR(50),
    bus_number VARCHAR(50),
    remarks TEXT,
    booking_status VARCHAR(50) DEFAULT 'Confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_other_bookings_ticket_no ON other_bookings(ticket_no);
CREATE INDEX IF NOT EXISTS idx_other_bookings_journey_date ON other_bookings(journey_date);
CREATE INDEX IF NOT EXISTS idx_other_bookings_mobile ON other_bookings(passenger_mobile);
