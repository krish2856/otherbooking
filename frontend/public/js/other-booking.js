// =====================================================
// FRONTEND LOGIC: Other Booking Page
//
// This file runs entirely in the user's web browser.
// It is responsible for making buttons clickable, talking to the backend
// server without refreshing the page, doing math for the ticket price,
// and creating the PDF tickets.
// =====================================================
document.addEventListener('DOMContentLoaded', function () {

    // -------------------------------------------------
    // API Configuration
    // -------------------------------------------------
    const API_BASE_URL = 'https://otherbooking.onrender.com';

    // -------------------------------------------------
    // Element references
    // -------------------------------------------------
    const form = document.getElementById('bookingForm');
    const bookingIdField = document.getElementById('bookingId');
    const ticketNoField = document.getElementById('ticket_no');
    const nextTicketBadge = document.getElementById('nextTicketBadge');
    const formModeLabel = document.getElementById('formModeLabel');

    const btnNew = document.getElementById('btnNew');
    const btnSave = document.getElementById('btnSave');
    const btnUpdate = document.getElementById('btnUpdate');
    const btnDelete = document.getElementById('btnDelete');
    const btnClear = document.getElementById('btnClear');
    const btnPrint = document.getElementById('btnPrint');
    const btnPdf = document.getElementById('btnPdf');

    const btnSearch = document.getElementById('btnSearch');
    const btnResetSearch = document.getElementById('btnResetSearch');
    const searchField = document.getElementById('searchField');
    const searchKeyword = document.getElementById('searchKeyword');
    const searchKeywordDate = document.getElementById('searchKeywordDate');

    const tableBody = document.getElementById('bookingsTableBody');
    const recordCount = document.getElementById('recordCount');
    const alertBox = document.getElementById('alertBox');

    const calcFields = document.querySelectorAll('.calc-field');

    let currentBookingData = null; // holds the loaded record for printing

    // -------------------------------------------------
    // Sidebar toggle (mobile)
    // -------------------------------------------------
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            sidebarBackdrop.classList.toggle('show');
        });
        sidebarBackdrop.addEventListener('click', () => {
            sidebar.classList.remove('show');
            sidebarBackdrop.classList.remove('show');
        });
    }

    // -------------------------------------------------
    // Helper: show floating alert
    // -------------------------------------------------
    function showAlert(message, type = 'success') {
        const icon = type === 'success' ? 'bi-check-circle-fill'
                    : type === 'danger' ? 'bi-x-circle-fill'
                    : 'bi-exclamation-triangle-fill';
        alertBox.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show d-flex align-items-center" role="alert">
                <i class="bi ${icon} me-2"></i>
                <div>${message}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>`;
        setTimeout(() => {
            const alertEl = alertBox.querySelector('.alert');
            if (alertEl) {
                const bsAlert = bootstrap.Alert.getOrCreateInstance(alertEl);
                bsAlert.close();
            }
        }, 4500);
    }

    // -------------------------------------------------
    // Helper: today's date in YYYY-MM-DD
    // -------------------------------------------------
    function todayStr() {
        const d = new Date();
        return d.toISOString().split('T')[0];
    }

    // -------------------------------------------------
    // Auto-calculate Net Amount & Due Amount
    // -------------------------------------------------
    function recalcAmounts() {
        const fare = parseFloat(document.getElementById('fare').value) || 0;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const gst = parseFloat(document.getElementById('gst').value) || 0;
        const paid = parseFloat(document.getElementById('paid_amount').value) || 0;

        const net = Math.max(fare - discount + gst, 0);
        const due = Math.max(net - paid, 0);

        document.getElementById('net_amount').value = net.toFixed(2);
        document.getElementById('due_amount').value = due.toFixed(2);
    }
    calcFields.forEach(el => el.addEventListener('input', recalcAmounts));

    // -------------------------------------------------
    // Mobile number: numeric-only + live validation
    // -------------------------------------------------
    const mobileInput = document.getElementById('passenger_mobile');
    const mobileError = document.getElementById('mobileError');
    mobileInput.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
        const valid = /^[6-9]\d{9}$/.test(this.value);
        mobileError.classList.toggle('d-none', this.value === '' || valid);
    });

    // -------------------------------------------------
    // Set form to "New Entry" mode
    // -------------------------------------------------
    async function setNewMode() {
        form.reset();
        bookingIdField.value = '';
        document.getElementById('booking_date').value = todayStr();
        document.getElementById('discount').value = 0;
        document.getElementById('gst').value = 0;
        document.getElementById('paid_amount').value = 0;
        document.getElementById('net_amount').value = '0.00';
        document.getElementById('due_amount').value = '0.00';
        mobileError.classList.add('d-none');
        btnSave.disabled = false;

        formModeLabel.textContent = 'Mode: New Entry';
        currentBookingData = null;

        await refreshNextTicket();
        clearRowSelection();
    }

    // -------------------------------------------------
    // Fetch & display next auto-generated ticket number
    // -------------------------------------------------
    async function refreshNextTicket() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/other-bookings/next-ticket`);
            const json = await res.json();
            if (json.success) {
                ticketNoField.value = json.ticket_no;
                nextTicketBadge.textContent = json.ticket_no;
            } else {
                nextTicketBadge.textContent = "Error";
                showAlert("Failed to load ticket number: " + (json.message || json.errorName || ''), "danger");
            }
        } catch (err) {
            console.error('Failed to fetch next ticket number', err);
            nextTicketBadge.textContent = "Offline";
            showAlert("Network Error: Could not connect to API for ticket generation.", "danger");
        }
    }

    // -------------------------------------------------
    // Gather all data from the form fields into one neat package
    // -------------------------------------------------
    function collectFormData() {
        return {
            booking_date: document.getElementById('booking_date').value,
            journey_date: document.getElementById('journey_date').value,
            from_place: document.getElementById('from_place').value.trim(),
            to_place: document.getElementById('to_place').value.trim(),
            operator: document.getElementById('operator').value.trim(),
            coach: document.getElementById('coach').value.trim(),
            journey_time: document.getElementById('journey_time').value,
            passenger_name: document.getElementById('passenger_name').value.trim(),
            passenger_mobile: document.getElementById('passenger_mobile').value.trim(),
            passenger_gender: document.getElementById('passenger_gender').value,
            passenger_age: document.getElementById('passenger_age').value,
            seat_type: document.getElementById('seat_type').value,
            seat_number: document.getElementById('seat_number').value.trim(),
            pickup_point: document.getElementById('pickup_point').value.trim(),
            drop_point: document.getElementById('drop_point').value.trim(),
            fare: document.getElementById('fare').value,
            discount: document.getElementById('discount').value,
            gst: document.getElementById('gst').value,
            net_amount: document.getElementById('net_amount').value,
            paid_amount: document.getElementById('paid_amount').value,
            due_amount: document.getElementById('due_amount').value,
            payment_mode: document.getElementById('payment_mode').value,
            pnr: document.getElementById('pnr').value.trim(),
            bus_number: document.getElementById('bus_number').value.trim(),
            remarks: document.getElementById('remarks').value.trim(),
            booking_status: document.getElementById('booking_status').value
        };
    }

    // -------------------------------------------------
    // Populate form fields from a booking record
    // -------------------------------------------------
    function populateForm(b) {
        bookingIdField.value = b.id;
        ticketNoField.value = b.ticket_no;
        document.getElementById('booking_date').value = b.booking_date;
        document.getElementById('journey_date').value = b.journey_date;
        document.getElementById('from_place').value = b.from_place;
        document.getElementById('to_place').value = b.to_place;
        document.getElementById('operator').value = b.operator;
        document.getElementById('coach').value = b.coach || '';
        document.getElementById('journey_time').value = b.journey_time || '';
        document.getElementById('passenger_name').value = b.passenger_name;
        document.getElementById('passenger_mobile').value = b.passenger_mobile;
        document.getElementById('passenger_gender').value = b.passenger_gender;
        document.getElementById('passenger_age').value = b.passenger_age || '';
        document.getElementById('seat_type').value = b.seat_type || 'Seater';
        document.getElementById('seat_number').value = b.seat_number;
        document.getElementById('pickup_point').value = b.pickup_point || '';
        document.getElementById('drop_point').value = b.drop_point || '';
        document.getElementById('fare').value = b.fare;
        document.getElementById('discount').value = b.discount;
        document.getElementById('gst').value = b.gst;
        document.getElementById('net_amount').value = b.net_amount;
        document.getElementById('paid_amount').value = b.paid_amount;
        
        document.getElementById('payment_mode').value = b.payment_mode;
        
        
        document.getElementById('remarks').value = b.remarks || '';
        document.getElementById('booking_status').value = b.booking_status;

        formModeLabel.textContent = `Mode: Editing Ticket ${b.ticket_no}`;
        currentBookingData = b;
    }

    function clearRowSelection() {
        document.querySelectorAll('#bookingsTable tbody tr').forEach(r => r.classList.remove('row-selected'));
    }

    // -------------------------------------------------
    // CREATE (Save a brand new booking)
    // -------------------------------------------------
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        const data = collectFormData();

        try {
            btnSave.disabled = true;
            const res = await fetch(`${API_BASE_URL}/api/other-bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                showAlert(json.message || 'Failed to save booking.', 'danger');
                btnSave.disabled = false;
                return;
            }

            showAlert(`Booking saved successfully! Ticket No: <b>${json.data.ticket_no}</b>`, 'success');
            await loadAllBookings();
            populateForm(json.data);
            btnSave.disabled = false;
        } catch (err) {
            console.error(err);
            showAlert('Server error while saving booking.', 'danger');
            btnSave.disabled = false;
        }
    });

    // -------------------------------------------------
    // UPDATE (Save changes to an existing booking)
    // -------------------------------------------------
    btnUpdate.addEventListener('click', async function () {
        const id = bookingIdField.value;
        if (!id) {
            showAlert('Please select a booking to update.', 'warning');
            return;
        }
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        const data = collectFormData();

        try {
            const res = await fetch(`${API_BASE_URL}/api/other-bookings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                showAlert(json.message || 'Failed to update booking.', 'danger');
                return;
            }

            showAlert('Booking updated successfully!', 'success');
            await loadAllBookings();
            populateForm(json.data);
        } catch (err) {
            console.error(err);
            showAlert('Server error while updating booking.', 'danger');
        }
    });

    // -------------------------------------------------
    // DELETE
    // -------------------------------------------------
    btnDelete.addEventListener('click', async function () {
        const id = bookingIdField.value;
        if (!id) {
            showAlert('Please select a booking to delete.', 'warning');
            return;
        }
        if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/other-bookings/${id}`, { method: 'DELETE' });
            const json = await res.json();

            if (!res.ok || !json.success) {
                showAlert(json.message || 'Failed to delete booking.', 'danger');
                return;
            }

            showAlert('Booking deleted successfully.', 'success');
            await loadAllBookings();
            await setNewMode();
        } catch (err) {
            console.error(err);
            showAlert('Server error while deleting booking.', 'danger');
        }
    });

    // -------------------------------------------------
    // NEW / CLEAR
    // -------------------------------------------------
    btnNew.addEventListener('click', setNewMode);
    btnClear.addEventListener('click', setNewMode);

    // -------------------------------------------------
    // FETCH DATA: Load all bookings from the server & render table
    // -------------------------------------------------
    async function loadAllBookings() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/other-bookings`);
            const json = await res.json();
            if (json.success) {
                renderTable(json.data);
            } else {
                tableBody.innerHTML = `<tr><td colspan="11" class="text-center text-danger py-4">Error: ${json.message || json.errorName || 'Failed to load'}</td></tr>`;
            }
        } catch (err) {
            console.error('Failed to load bookings', err);
            tableBody.innerHTML = `<tr><td colspan="11" class="text-center text-danger py-4">Network Error: Could not connect to API.</td></tr>`;
        }
    }

    // -------------------------------------------------
    // Render table rows
    // -------------------------------------------------
    function renderTable(rows) {
        recordCount.textContent = `${rows.length} record${rows.length !== 1 ? 's' : ''}`;

        if (rows.length === 0) {
            tableBody.innerHTML = `
                <tr id="emptyRow">
                    <td colspan="11" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-3 d-block mb-2"></i>No bookings found.
                    </td>
                </tr>`;
            return;
        }

        tableBody.innerHTML = rows.map(b => `
            <tr data-id="${b.id}">
                <td class="fw-semibold text-accent">${escapeHtml(b.ticket_no)}</td>
                <td>${escapeHtml(b.journey_date)}</td>
                <td>${escapeHtml(b.passenger_name)}</td>
                <td>${escapeHtml(b.passenger_mobile)}</td>
                <td>${escapeHtml(b.from_place)}</td>
                <td>${escapeHtml(b.to_place)}</td>
                <td>${escapeHtml(b.seat_number)}</td>
                <td>${escapeHtml(b.operator)}</td>
                <td>₹${Number(b.fare).toFixed(2)}</td>
                <td><span class="status-badge status-${b.booking_status.toLowerCase()}">${b.booking_status}</span></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-icon-table text-primary btn-edit-row" title="Edit"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-icon-table text-danger btn-delete-row" title="Delete"><i class="bi bi-trash"></i></button>
                    <button class="btn btn-sm btn-icon-table text-success btn-print-row" title="Print"><i class="bi bi-printer"></i></button>
                </td>
            </tr>
        `).join('');
    }

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    // -------------------------------------------------
    // Table row actions (Edit / Delete / Print) — delegated
    // -------------------------------------------------
    tableBody.addEventListener('click', async function (e) {
        const row = e.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');

        if (e.target.closest('.btn-edit-row')) {
            await loadBookingIntoForm(id);
            clearRowSelection();
            row.classList.add('row-selected');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (e.target.closest('.btn-delete-row')) {
            if (!confirm('Are you sure you want to delete this booking?')) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/other-bookings/${id}`, { method: 'DELETE' });
                const json = await res.json();
                if (!res.ok || !json.success) {
                    showAlert(json.message || 'Failed to delete booking.', 'danger');
                    return;
                }
                showAlert('Booking deleted successfully.', 'success');
                await loadAllBookings();
                if (bookingIdField.value === id) await setNewMode();
            } catch (err) {
                console.error(err);
                showAlert('Server error while deleting booking.', 'danger');
            }
        }

        if (e.target.closest('.btn-print-row')) {
            const res = await fetch(`${API_BASE_URL}/api/other-bookings/${id}`);
            const json = await res.json();
            if (json.success) {
                printTicket(json.data);
            }
        }
    });

    async function loadBookingIntoForm(id) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/other-bookings/${id}`);
            const json = await res.json();
            if (json.success) {
                populateForm(json.data);
            } else {
                showAlert('Booking not found.', 'danger');
            }
        } catch (err) {
            console.error(err);
            showAlert('Failed to load booking.', 'danger');
        }
    }

    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------
    searchField.addEventListener('change', function () {
        const isDate = this.value === 'journey_date';
        searchKeyword.classList.toggle('d-none', isDate);
        searchKeywordDate.classList.toggle('d-none', !isDate);
    });

    btnSearch.addEventListener('click', async function () {
        const field = searchField.value;
        const isDate = field === 'journey_date';
        const keyword = isDate ? searchKeywordDate.value : searchKeyword.value.trim();

        if (!keyword) {
            showAlert('Please enter a search keyword.', 'warning');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/other-bookings/search?field=${encodeURIComponent(field)}&keyword=${encodeURIComponent(keyword)}`);
            const json = await res.json();
            if (json.success) {
                renderTable(json.data);
                if (json.data.length === 0) {
                    showAlert('No matching bookings found.', 'warning');
                }
            } else {
                showAlert(json.message || 'Search failed.', 'danger');
            }
        } catch (err) {
            console.error(err);
            showAlert('Server error while searching.', 'danger');
        }
    });

    btnResetSearch.addEventListener('click', async function () {
        searchKeyword.value = '';
        searchKeywordDate.value = '';
        searchField.value = 'ticket_no';
        searchKeyword.classList.remove('d-none');
        searchKeywordDate.classList.add('d-none');
        await loadAllBookings();
    });

    // Allow Enter key to trigger search
    searchKeyword.addEventListener('keypress', e => { if (e.key === 'Enter') btnSearch.click(); });

    // -------------------------------------------------
    // PRINT TICKET
    // -------------------------------------------------
    function buildTicketHtml(b) {
        return `
        <div class="print-ticket">
            <div class="pt-header">
                <div>
                    <div class="pt-title"><i class="bi bi-bus-front-fill"></i>OtherBooking Pro</div>
                    <div class="pt-sub">E-Ticket / Booking Confirmation</div>
                </div>
                <div class="text-end">
                    <div class="pt-sub">Ticket No</div>
                    <div class="pt-title" style="font-size:16px;">${escapeHtml(b.ticket_no)}</div>
                </div>
            </div>
            <div class="pt-grid">
                <div><span class="label">Booking Date:</span> <span class="value">${escapeHtml(b.booking_date)}</span></div>
                <div><span class="label">Journey Date:</span> <span class="value">${escapeHtml(b.journey_date)}</span></div>
                <div><span class="label">From:</span> <span class="value">${escapeHtml(b.from_place)}</span></div>
                <div><span class="label">To:</span> <span class="value">${escapeHtml(b.to_place)}</span></div>
                <div><span class="label">Operator:</span> <span class="value">${escapeHtml(b.operator)}</span></div>
                <div><span class="label">Coach:</span> <span class="value">${escapeHtml(b.coach || '-')}</span></div>
                <div><span class="label">Journey Time:</span> <span class="value">${escapeHtml(b.journey_time || '-')}</span></div>
                <div><span class="label">Bus Number:</span> <span class="value">${escapeHtml(b.bus_number || '-')}</span></div>
                <div><span class="label">Passenger:</span> <span class="value">${escapeHtml(b.passenger_name)}</span></div>
                <div><span class="label">Mobile:</span> <span class="value">${escapeHtml(b.passenger_mobile)}</span></div>
                <div><span class="label">Gender / Age:</span> <span class="value">${escapeHtml(b.passenger_gender)} / ${escapeHtml(b.passenger_age || '-')}</span></div>
                <div><span class="label">Seat:</span> <span class="value">${escapeHtml(b.seat_number)} (${escapeHtml(b.seat_type || '-')})</span></div>
                <div><span class="label">Pickup Point:</span> <span class="value">${escapeHtml(b.pickup_point || '-')}</span></div>
                <div><span class="label">Drop Point:</span> <span class="value">${escapeHtml(b.drop_point || '-')}</span></div>
                
                <div><span class="label">Payment Mode:</span> <span class="value">${escapeHtml(b.payment_mode)}</span></div>
                <div><span class="label">Status:</span> <span class="value">${escapeHtml(b.booking_status)}</span></div>
                <div><span class="label">Remarks:</span> <span class="value">${escapeHtml(b.remarks || '-')}</span></div>
            </div>
            <div class="pt-fare-box">
                <div>Fare: ₹${Number(b.fare).toFixed(2)} &nbsp;|&nbsp; Discount: ₹${Number(b.discount).toFixed(2)} &nbsp;|&nbsp; GST: ₹${Number(b.gst).toFixed(2)}</div>
                <div>Net Payable: ₹${Number(b.net_amount).toFixed(2)}</div>
            </div>
            <div class="pt-grid mt-2">
                <div><span class="label">Paid Amount:</span> <span class="value text-success">₹${Number(b.paid_amount).toFixed(2)}</span></div>
                <div><span class="label">Due Amount:</span> <span class="value text-danger">₹${Number(b.due_amount).toFixed(2)}</span></div>
            </div>
            <div class="pt-footer">
                This is a computer-generated ticket and does not require a signature. &bull; Please carry a valid photo ID during travel.<br>
                Thank you for booking with BusReservePro Travels!
            </div>
        </div>`;
    }

    function printTicket(b) {
        const printArea = document.getElementById('printArea');
        printArea.innerHTML = buildTicketHtml(b);
        printArea.classList.remove('d-none');
        window.print();
        setTimeout(() => printArea.classList.add('d-none'), 500);
    }

    btnPrint.addEventListener('click', function () {
        if (!currentBookingData) {
            showAlert('Please select a booking first.', 'warning');
            return;
        }
        printTicket(currentBookingData);
    });

    // -------------------------------------------------
    // DOWNLOAD PDF (uses html2canvas + jsPDF)
    // -------------------------------------------------
    btnPdf.addEventListener('click', async function () {
        if (!currentBookingData) {
            showAlert('Please select a booking first.', 'warning');
            return;
        }

        const printArea = document.getElementById('printArea');
        printArea.innerHTML = buildTicketHtml(currentBookingData);
        printArea.classList.remove('d-none');
        printArea.style.position = 'fixed';
        printArea.style.left = '-9999px';
        printArea.style.display = 'block';

        try {
            const ticketEl = printArea.querySelector('.print-ticket');
            const canvas = await html2canvas(ticketEl, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'pt', [canvas.width / 2, canvas.height / 2]);
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`Ticket_${currentBookingData.ticket_no}.pdf`);

            showAlert('Ticket PDF downloaded successfully!', 'success');
        } catch (err) {
            console.error(err);
            showAlert('Failed to generate PDF.', 'danger');
        } finally {
            printArea.classList.add('d-none');
            printArea.style.position = '';
            printArea.style.left = '';
            printArea.style.display = 'none';
        }
    });

    // -------------------------------------------------
    // INIT
    // -------------------------------------------------
    document.getElementById('booking_date').value = todayStr();
    recalcAmounts();
    loadAllBookings();
    refreshNextTicket();
});
