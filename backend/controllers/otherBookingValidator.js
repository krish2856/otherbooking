// =====================================================
// VALIDATION
// Simple, dependency-light validation for booking data.
// Returns an array of error messages (empty = valid).
// =====================================================

function isEmpty(val) {
    return val === undefined || val === null || String(val).trim() === '';
}

function validateBooking(body) {
    const errors = [];

    // ---- Required fields ----
    const requiredFields = [
        { key: 'booking_date', label: 'Booking Date' },
        { key: 'journey_date', label: 'Journey Date' },
        { key: 'from_place', label: 'From' },
        { key: 'to_place', label: 'To' },
        { key: 'operator', label: 'Operator' },
        { key: 'passenger_name', label: 'Passenger Name' },
        { key: 'passenger_mobile', label: 'Passenger Mobile Number' },
        { key: 'seat_number', label: 'Seat Number' },
        { key: 'fare', label: 'Fare' },
        { key: 'payment_mode', label: 'Payment Mode' },
        { key: 'booking_status', label: 'Booking Status' }
    ];

    requiredFields.forEach(f => {
        if (isEmpty(body[f.key])) {
            errors.push(`${f.label} is required.`);
        }
    });

    // ---- Phone validation (10 digit Indian mobile number) ----
    if (!isEmpty(body.passenger_mobile)) {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(String(body.passenger_mobile).trim())) {
            errors.push('Passenger Mobile Number must be a valid 10-digit number.');
        }
    }

    // ---- Age validation ----
    if (!isEmpty(body.passenger_age)) {
        const age = Number(body.passenger_age);
        if (isNaN(age) || age <= 0 || age > 120) {
            errors.push('Passenger Age must be a valid number between 1 and 120.');
        }
    }

    // ---- Numeric field validations ----
    const numericFields = ['fare', 'discount', 'gst', 'net_amount', 'paid_amount', 'due_amount'];
    numericFields.forEach(key => {
        if (!isEmpty(body[key]) && isNaN(Number(body[key]))) {
            errors.push(`${key.replace('_', ' ')} must be a valid number.`);
        }
    });

    if (!isEmpty(body.fare) && Number(body.fare) < 0) {
        errors.push('Fare cannot be negative.');
    }

    // ---- Date logic validation ----
    if (!isEmpty(body.booking_date) && !isEmpty(body.journey_date)) {
        const bookingDate = new Date(body.booking_date);
        const journeyDate = new Date(body.journey_date);
        if (journeyDate < bookingDate) {
            errors.push('Journey Date cannot be earlier than Booking Date.');
        }
    }

    // ---- Gender validation ----
    if (!isEmpty(body.passenger_gender)) {
        const allowedGenders = ['Male', 'Female', 'Other'];
        if (!allowedGenders.includes(body.passenger_gender)) {
            errors.push('Invalid Passenger Gender.');
        }
    }

    // ---- Payment mode validation ----
    if (!isEmpty(body.payment_mode)) {
        const allowedModes = ['Cash', 'UPI', 'Card', 'Online'];
        if (!allowedModes.includes(body.payment_mode)) {
            errors.push('Invalid Payment Mode.');
        }
    }

    // ---- Booking status validation ----
    if (!isEmpty(body.booking_status)) {
        const allowedStatus = ['Confirmed', 'Pending', 'Cancelled'];
        if (!allowedStatus.includes(body.booking_status)) {
            errors.push('Invalid Booking Status.');
        }
    }

    return errors;
}

module.exports = { validateBooking };
