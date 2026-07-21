-- =====================================================
-- BUS RESERVATION MANAGEMENT SYSTEM
-- Module: OTHER BOOKING
-- Database Schema
-- =====================================================

CREATE DATABASE IF NOT EXISTS bus_reservation_db;
USE bus_reservation_db;

-- =====================================================
-- Table: other_bookings
-- =====================================================
DROP TABLE IF EXISTS other_bookings;

CREATE TABLE other_bookings (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    ticket_no           VARCHAR(20)     NOT NULL,
    booking_date        DATE            NOT NULL,
    journey_date        DATE            NOT NULL,
    from_place          VARCHAR(100)    NOT NULL,
    to_place             VARCHAR(100)    NOT NULL,
    operator            VARCHAR(100)    NOT NULL,
    coach                VARCHAR(50)     DEFAULT NULL,
    journey_time         VARCHAR(20)     DEFAULT NULL,

    passenger_name       VARCHAR(100)    NOT NULL,
    passenger_mobile     VARCHAR(15)     NOT NULL,
    passenger_gender     ENUM('Male','Female','Other') DEFAULT 'Male',
    passenger_age        INT             DEFAULT NULL,

    seat_type            VARCHAR(50)     DEFAULT NULL,
    seat_number          VARCHAR(20)     NOT NULL,
    pickup_point         VARCHAR(100)    DEFAULT NULL,
    drop_point            VARCHAR(100)    DEFAULT NULL,

    fare                 DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    discount              DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    gst                   DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    net_amount            DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    paid_amount           DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    due_amount            DECIMAL(10,2)   NOT NULL DEFAULT 0.00,

    payment_mode          ENUM('Cash','UPI','Card','Online') DEFAULT 'Cash',
    pnr                    VARCHAR(30)     DEFAULT NULL,
    bus_number             VARCHAR(30)     DEFAULT NULL,
    remarks                 VARCHAR(255)    DEFAULT NULL,
    booking_status          ENUM('Confirmed','Pending','Cancelled') NOT NULL DEFAULT 'Confirmed',

    created_at              TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Unique constraint to prevent duplicate ticket numbers
    UNIQUE KEY uq_ticket_no (ticket_no),

    -- Indexes for fast searching
    INDEX idx_passenger_name (passenger_name),
    INDEX idx_passenger_mobile (passenger_mobile),
    INDEX idx_pnr (pnr),
    INDEX idx_journey_date (journey_date),
    INDEX idx_booking_status (booking_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Sample Seed Data (optional - for testing)
-- =====================================================
INSERT INTO other_bookings
(ticket_no, booking_date, journey_date, from_place, to_place, operator, coach, journey_time,
 passenger_name, passenger_mobile, passenger_gender, passenger_age,
 seat_type, seat_number, pickup_point, drop_point,
 fare, discount, gst, net_amount, paid_amount, due_amount,
 payment_mode, pnr, bus_number, remarks, booking_status)
VALUES
('OB-000001', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Ahmedabad', 'Mumbai', 'Shree Travels', 'A1', '21:30',
 'Ramesh Patel', '9825012345', 'Male', 34,
 'Sleeper', 'S-12', 'Ahmedabad Bus Stand', 'Borivali',
 1200.00, 100.00, 55.00, 1155.00, 1155.00, 0.00,
 'UPI', 'PNR100001', 'GJ-01-AB-1234', 'Window seat preferred', 'Confirmed');
