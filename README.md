# Other Booking Module — Bus Reservation Management System

A fully functional **Other Booking** module built with plain HTML5, CSS3, Bootstrap 5,
vanilla JavaScript, Node.js, Express.js, EJS, and MySQL (no frameworks like React/Vue/Angular,
no TypeScript).

---

## 1. Features

- Top navbar + left sidebar admin layout (matches a typical bus-reservation admin panel)
- Full booking form with every field requested (journey, passenger, seat, fare, payment, etc.)
- **Auto-generated Ticket Number** (`OB-000001`, `OB-000002`, ...)
- Live **Net Amount** / **Due Amount** calculation as you type
- Full CRUD (Create, Read, Update, Delete) via REST APIs
- Search by Ticket Number / Passenger Name / Phone / PNR / Journey Date
- Responsive, sortable bookings table with Edit / Delete / Print actions
- **Print Ticket** (browser print dialog with a dedicated ticket layout)
- **Download PDF** (client-side PDF generation using jsPDF + html2canvas)
- Server-side validation: required fields, 10-digit phone validation, duplicate ticket
  prevention, duplicate seat prevention, date logic checks
- MVC folder structure (Models / Controllers / Routes)

---

## 2. Project Structure

```
other-booking/
├── config/
│   └── db.js                      # MySQL connection pool
├── controllers/
│   ├── otherBookingController.js  # Business logic + REST handlers
│   └── otherBookingValidator.js   # Server-side validation rules
├── models/
│   └── otherBookingModel.js       # All SQL queries
├── routes/
│   └── otherBookingRoutes.js      # Express routes (page + REST API)
├── views/
│   ├── other-booking.ejs          # Main page (form + table)
│   └── partials/
│       ├── head.ejs
│       ├── navbar.ejs
│       └── sidebar.ejs
├── public/
│   ├── css/style.css              # All custom styling
│   ├── js/other-booking.js        # All frontend logic (fetch/AJAX, calc, print, pdf)
│   └── images/
├── database/
│   └── schema.sql                 # Table creation + seed data
├── .env                           # DB credentials (edit before running)
├── server.js                      # App entry point
├── package.json
└── README.md
```

---

## 3. Setup Instructions

### Step 1 — Install dependencies
```bash
cd other-booking
npm install
```

### Step 2 — Create the database
Open MySQL Workbench / CLI and run:
```bash
mysql -u root -p < database/schema.sql
```
This creates the `bus_reservation_db` database and the `other_bookings` table
(with one sample record).

### Step 3 — Configure environment variables
Edit the `.env` file with your MySQL credentials:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bus_reservation_db
DB_PORT=3306
```

### Step 4 — Run the server
```bash
npm start
```
or, for auto-restart during development:
```bash
npm run dev
```

### Step 5 — Open in browser
```
http://localhost:3000/other-booking
```

---

## 4. REST API Reference

| Method | Endpoint                              | Description                          |
|--------|----------------------------------------|---------------------------------------|
| GET    | `/other-booking`                       | Renders the module page               |
| GET    | `/api/other-bookings`                  | Get all bookings                      |
| GET    | `/api/other-bookings/next-ticket`      | Get next auto-generated ticket number |
| GET    | `/api/other-bookings/search?field=&keyword=` | Search bookings                 |
| GET    | `/api/other-bookings/:id`              | Get a single booking                  |
| POST   | `/api/other-bookings`                  | Create a new booking                  |
| PUT    | `/api/other-bookings/:id`              | Update an existing booking            |
| DELETE | `/api/other-bookings/:id`              | Delete a booking                      |

Valid values for `field` in the search endpoint: `ticket_no`, `passenger_name`,
`passenger_mobile`, `pnr`, `journey_date`.

---

## 5. Validation Rules

- Required: Booking Date, Journey Date, From, To, Operator, Passenger Name,
  Mobile Number, Seat Number, Fare, Payment Mode, Booking Status
- Mobile number must be a valid 10-digit Indian number (starts 6–9)
- Age must be between 1–120 (if provided)
- Fare/Discount/GST/etc. must be non-negative numbers
- Journey Date cannot be earlier than Booking Date
- Ticket numbers are auto-generated server-side — never editable, never duplicated
- Duplicate seat booking (same seat + operator + journey date) is blocked

---

## 6. Notes

- No reference image was received with this request, so the UI was designed from
  the written specification as a modern, professional admin panel (navy/blue theme,
  card-based form, clean data table) typical of bus-reservation back-office software.
  Colors, spacing, and layout can easily be adjusted in `public/css/style.css`.
- All money math (Net Amount, Due Amount) is recalculated on the server before saving,
  so the client-side calculation is for live UX preview only — the server is the source
  of truth.
