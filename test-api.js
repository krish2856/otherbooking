const http = require('http');

const postData = JSON.stringify({
    ticket_no: 'OB-000003',
    booking_date: '2024-03-20',
    journey_date: '2024-03-25',
    from_place: 'Delhi',
    to_place: 'Mumbai',
    operator: 'Test',
    passenger_name: 'Test Name',
    passenger_mobile: '1234567890',
    passenger_gender: 'Male',
    passenger_age: '30',
    seat_type: 'Seater',
    seat_number: 'S2',
    fare: '1800',
    discount: '100',
    gst: '0',
    net_amount: '1700',
    paid_amount: '1700',
    due_amount: '0',
    payment_mode: 'Cash',
    booking_status: 'Confirmed'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/other-bookings',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    process.exit(1);
});

req.write(postData);
req.end();
