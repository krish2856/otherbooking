// =====================================================
// FRONTEND LOGIC: Other Booking Module
// =====================================================
document.addEventListener('DOMContentLoaded', function () {

    // Dynamic API URL Detection
    const getApiBaseUrl = () => {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'https://otherbooking.onrender.com';
        }
        if (host.includes('onrender.com')) {
            return window.location.origin;
        }
        // Fallback for Vercel or external hostings
        return 'https://otherbooking.onrender.com';
    };

    const API_BASE_URL = getApiBaseUrl();

    // DOM Elements
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
    const printArea = document.getElementById('printArea');

    const calcFields = document.querySelectorAll('.calc-field');
    let currentBookingData = null;

    // -------------------------------------------------
    // Helper: Floating Alert
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

    // Helper: Date string
    function todayStr() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    // -------------------------------------------------
    // Live Financial Calculations
    // -------------------------------------------------
    function recalcAmounts() {
        const fare = parseFloat(document.getElementById('fare').value) || 0;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const gst = parseFloat(document.getElementById('gst').value) || 0;
        const paid = parseFloat(document.getElementById('paid_amount').value) || 0;

        const net = Math.max(fare - discount + gst, 0);
        const due = Math.max(net - paid, 0);

        document.getElementById('net_amount').value = net.toFixed(2);
    }
    calcFields.forEach(el => el.addEventListener('input', recalcAmounts));

    // Mobile input validation
    const mobileInput = document.getElementById('passenger_mobile');
    const mobileError = document.getElementById('mobileError');
    mobileInput.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
        const valid = /^[6-9]\d{9}$/.test(this.value);
        mobileError.classList.toggle('d-none', this.value === '' || valid);
    });

    // -------------------------------------------------
    // Form Mode Control
    // -------------------------------------------------
    async function setNewMode() {
        form.reset();
        bookingIdField.value = '';
        document.getElementById('booking_date').value = todayStr();
        document.getElementById('discount').value = 0;
        document.getElementById('gst').value = 0;
        document.getElementById('paid_amount').value = 0;
        document.getElementById('net_amount').value = '0.00';
        mobileError.classList.add('d-none');
        btnSave.disabled = false;

        formModeLabel.textContent = 'Mode: New Entry';
        formModeLabel.className = 'badge bg-primary text-white';
        currentBookingData = null;

        await refreshNextTicket();
        clearRowSelection();
    }

    async function refreshNextTicket() {
        try {
            ticketNoField.value = 'Fetching...';
            const res = await fetch(`${API_BASE_URL}/api/other-bookings/next-ticket`);
            const json = await res.json();
            if (json.success) {
                ticketNoField.value = json.ticket_no;
                if (nextTicketBadge) nextTicketBadge.textContent = json.ticket_no;
            } else {
                ticketNoField.value = 'OB-Auto';
                if (nextTicketBadge) nextTicketBadge.textContent = 'Auto';
            }
        } catch (err) {
            console.error('Failed to fetch next ticket number', err);
            ticketNoField.value = 'OB-Auto';
            if (nextTicketBadge) nextTicketBadge.textContent = 'Auto';
        }
    }

    function collectFormData() {
        return {
            booking_date: document.getElementById('booking_date').value,
            journey_date: document.getElementById('journey_date').value,
            from_place: document.getElementById('from_place').value.trim(),
            to_place: document.getElementById('to_place').value.trim(),
            operator: document.getElementById('operator').value.trim(),
            journey_time: document.getElementById('journey_time').value,
            passenger_name: document.getElementById('passenger_name').value.trim(),
            passenger_mobile: document.getElementById('passenger_mobile').value.trim(),
            passenger_gender: document.getElementById('passenger_gender').value,
            seat_type: document.getElementById('seat_type').value,
            seat_number: document.getElementById('seat_number').value.trim(),
            total_seat: document.getElementById('total_seat').value,
            pickup_point: document.getElementById('pickup_point').value.trim(),
            drop_point: document.getElementById('drop_point').value.trim(),
            fare: document.getElementById('fare').value,
            discount: document.getElementById('discount').value,
            gst: document.getElementById('gst').value,
            paid_amount: document.getElementById('paid_amount').value,
            payment_mode: document.getElementById('payment_mode').value,
            pnr: document.getElementById('pnr').value.trim(),
            bus_number: document.getElementById('bus_number').value.trim(),
            remarks: document.getElementById('remarks').value.trim(),
            booking_status: document.getElementById('booking_status').value
        };
    }

    function populateForm(b) {
        bookingIdField.value = b.id;
        ticketNoField.value = b.ticket_no;
        document.getElementById('booking_date').value = b.booking_date ? String(b.booking_date).split('T')[0] : '';
        document.getElementById('journey_date').value = b.journey_date ? String(b.journey_date).split('T')[0] : '';
        document.getElementById('from_place').value = b.from_place || '';
        document.getElementById('to_place').value = b.to_place || '';
        document.getElementById('operator').value = b.operator || '';
        document.getElementById('journey_time').value = b.journey_time || '';

        document.getElementById('passenger_name').value = b.passenger_name || '';
        document.getElementById('passenger_mobile').value = b.passenger_mobile || '';
        document.getElementById('passenger_gender').value = b.passenger_gender || 'Male';
        document.getElementById('seat_type').value = b.seat_type || 'A/C Sleeper';

        document.getElementById('seat_number').value = b.seat_number || '';
        document.getElementById('total_seat').value = b.total_seat || '';
        document.getElementById('pickup_point').value = b.pickup_point || '';
        document.getElementById('drop_point').value = b.drop_point || '';
        document.getElementById('pnr').value = b.pnr || '';

        document.getElementById('fare').value = b.fare || 0;
        document.getElementById('discount').value = b.discount || 0;
        document.getElementById('gst').value = b.gst || 0;
        document.getElementById('paid_amount').value = b.paid_amount || 0;
        document.getElementById('payment_mode').value = b.payment_mode || 'Cash';
        document.getElementById('bus_number').value = b.bus_number || '';
        document.getElementById('remarks').value = b.remarks || '';
        document.getElementById('booking_status').value = b.booking_status || 'Confirmed';

        recalcAmounts();

        formModeLabel.textContent = `Mode: Editing #${b.ticket_no}`;
        formModeLabel.className = 'badge bg-warning text-dark';
        currentBookingData = b;
        btnSave.disabled = true;
    }

    // -------------------------------------------------
    // CREATE (Save Ticket)
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
            
            const shareCheck = document.getElementById('shareWhatsapp');
            if (shareCheck && shareCheck.checked) {
                try {
                    showAlert('Generating PDF for WhatsApp...', 'info');
                    const blob = await generateTicketPdfBlob(json.data);
                    await shareOnWhatsApp(json.data, blob);
                } catch (e) {
                    console.error('WhatsApp share error', e);
                }
            }

            await loadAllBookings();
            await setNewMode();
        } catch (err) {
            console.error(err);
            showAlert('Server error while saving booking.', 'danger');
            btnSave.disabled = false;
        }
    });

    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------
    btnUpdate.addEventListener('click', async function () {
        const id = bookingIdField.value;
        if (!id) {
            showAlert('Please select a booking from the table to update.', 'warning');
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

            showAlert(`Booking <b>#${json.data.ticket_no}</b> updated successfully!`, 'success');
            
            const shareCheck = document.getElementById('shareWhatsapp');
            if (shareCheck && shareCheck.checked) {
                try {
                    showAlert('Generating PDF for WhatsApp...', 'info');
                    const blob = await generateTicketPdfBlob(json.data);
                    await shareOnWhatsApp(json.data, blob);
                } catch (e) {
                    console.error('WhatsApp share error', e);
                }
            }

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
            await setNewMode();
        } catch (err) {
            console.error(err);
            showAlert('Server error while deleting booking.', 'danger');
        }
    });

    btnNew.addEventListener('click', setNewMode);
    btnClear.addEventListener('click', setNewMode);

    // -------------------------------------------------
    // Read & Render All Bookings
    // -------------------------------------------------
    async function loadAllBookings() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/other-bookings`);
            const json = await res.json();
            if (json.success) {
                renderTable(json.data);
            } else {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Error: ${json.message || 'Failed to load'}</td></tr>`;
            }
        } catch (err) {
            console.error('Failed to load bookings', err);
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Network Error: Could not connect to API.</td></tr>`;
        }
    }

    function renderTable(rows) {
        recordCount.textContent = `${rows.length} record${rows.length !== 1 ? 's' : ''}`;

        if (rows.length === 0) {
            tableBody.innerHTML = `
                <tr id="emptyRow">
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-3 d-block mb-2"></i>No bookings found.
                    </td>
                </tr>`;
            return;
        }

        tableBody.innerHTML = rows.map(b => {
            const formattedDate = b.journey_date ? String(b.journey_date).split('T')[0] : '';
            return `
            <tr data-id="${b.id}">
                <td class="fw-semibold text-primary">${escapeHtml(b.ticket_no)}</td>
                <td>${escapeHtml(formattedDate)}</td>
                <td>${escapeHtml(b.passenger_name)}</td>
                <td>${escapeHtml(b.passenger_mobile)}</td>
                <td>${escapeHtml(b.operator)}</td>
                <td>₹${Number(b.fare).toFixed(2)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-icon-table text-primary btn-edit-row" title="Edit"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-sm btn-icon-table text-danger btn-delete-row" title="Delete"><i class="bi bi-trash"></i></button>
                    <button class="btn btn-sm btn-icon-table text-success btn-print-row" title="Print"><i class="bi bi-printer"></i></button>
                </td>
            </tr>
        `}).join('');
    }

    function clearRowSelection() {
        tableBody.querySelectorAll('tr').forEach(r => r.classList.remove('table-active'));
    }

    // Delegate Table Row Actions
    tableBody.addEventListener('click', async function (e) {
        const row = e.target.closest('tr[data-id]');
        if (!row) return;
        const id = row.getAttribute('data-id');

        if (e.target.closest('.btn-edit-row')) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/other-bookings/${id}`);
                const json = await res.json();
                if (json.success) {
                    populateForm(json.data);
                    clearRowSelection();
                    row.classList.add('table-active');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } catch (err) {
                console.error(err);
                showAlert('Failed to fetch booking details.', 'danger');
            }
        }

        if (e.target.closest('.btn-delete-row')) {
            if (!confirm('Are you sure you want to delete this booking?')) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/other-bookings/${id}`, { method: 'DELETE' });
                const json = await res.json();
                if (json.success) {
                    showAlert('Booking deleted successfully.', 'success');
                    await loadAllBookings();
                    if (bookingIdField.value === id) await setNewMode();
                }
            } catch (err) {
                console.error(err);
                showAlert('Failed to delete booking.', 'danger');
            }
        }

        if (e.target.closest('.btn-print-row')) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/other-bookings/${id}`);
                const json = await res.json();
                if (json.success) {
                    populateForm(json.data);
                    window.print();
                }
            } catch (err) {
                console.error(err);
            }
        }
    });

    // -------------------------------------------------
    // SEARCH & FILTER
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
            const url = `${API_BASE_URL}/api/other-bookings/search?field=${encodeURIComponent(field)}&keyword=${encodeURIComponent(keyword)}`;
            const res = await fetch(url);
            const json = await res.json();
            if (json.success) {
                renderTable(json.data);
                showAlert(`Found ${json.data.length} matching booking(s).`, 'info');
            } else {
                showAlert(json.message || 'Search failed.', 'danger');
            }
        } catch (err) {
            console.error(err);
            showAlert('Server error during search.', 'danger');
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

    // -------------------------------------------------
    // TICKET PRINT & PDF GENERATOR
    // -------------------------------------------------
    function generateTicketHtml(b) {
        const formatDate = (d) => d ? String(d).split('T')[0] : '-';
        return `
            <div class="ticket-card">
                <!-- Header -->
                <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                    <div>
                        <div class="ticket-header-title"><i class="bi bi-bus-front me-2"></i>Ganga Travels</div>
                        <small class="text-muted">7228882888</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-primary fs-6 px-3 py-2">Ticket: ${escapeHtml(b.ticket_no)}</span>
                        <div class="text-muted small mt-1">Booked On: ${formatDate(b.booking_date)}</div>
                    </div>
                </div>

                <!-- Route Banner -->
                <div class="ticket-route-banner d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <div class="small opacity-75">ORIGIN</div>
                        <div class="fs-4 fw-bold">${escapeHtml(b.from_place)}</div>
                    </div>
                    <div class="text-center px-3">
                        <i class="bi bi-arrow-right fs-3"></i>
                        <div class="small fw-semibold mt-1">${formatDate(b.journey_date)} ${b.journey_time ? '| ' + escapeHtml(b.journey_time) : ''}</div>
                    </div>
                    <div class="text-end">
                        <div class="small opacity-75">DESTINATION</div>
                        <div class="fs-4 fw-bold">${escapeHtml(b.to_place)}</div>
                    </div>
                </div>

                <!-- Details Grid -->
                <div class="row g-3 mb-4">
                    <div class="col-4">
                        <div class="ticket-field">
                            <span class="ticket-label">Passenger Name</span>
                            <span class="ticket-val">${escapeHtml(b.passenger_name)}</span>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="ticket-field">
                            <span class="ticket-label">Mobile Number</span>
                            <span class="ticket-val">${escapeHtml(b.passenger_mobile)}</span>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="ticket-field">
                            <span class="ticket-label">Gender</span>
                            <span class="ticket-val">${escapeHtml(b.passenger_gender || 'Male')}</span>
                        </div>
                    </div>

                    <div class="col-4">
                        <div class="ticket-field">
                            <span class="ticket-label">Seat Number (Total: ${b.total_seat || 1})</span>
                            <span class="ticket-val text-primary fw-bold">${escapeHtml(b.seat_number)} (${escapeHtml(b.seat_type || 'A/C Sleeper')})</span>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="ticket-field">
                            <span class="ticket-label">Travel Operator</span>
                            <span class="ticket-val">${escapeHtml(b.operator)}</span>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="ticket-field">
                            <span class="ticket-label">Bus No</span>
                            <span class="ticket-val">${b.bus_number ? escapeHtml(b.bus_number) : '-'}</span>
                        </div>
                    </div>

                    <div class="col-4">
                        <div class="ticket-field">
                            <span class="ticket-label">Pickup Point</span>
                            <span class="ticket-val">${escapeHtml(b.pickup_point || '-')}</span>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="ticket-field">
                            <span class="ticket-label">Drop Point</span>
                            <span class="ticket-val">${escapeHtml(b.drop_point || '-')}</span>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="ticket-field">
                            <span class="ticket-label">PNR / Status</span>
                            <span class="ticket-val">${escapeHtml(b.pnr || '-')} / <span class="text-success fw-bold">${escapeHtml(b.booking_status || 'Confirmed')}</span></span>
                        </div>
                    </div>
                </div>

                <!-- Fare Summary -->
                <div class="ticket-fare-summary mb-4">
                    <div class="row text-center align-items-center">
                        <div class="col">
                            <span class="ticket-label">Base Fare</span>
                            <span class="fw-bold">₹${Number(b.fare).toFixed(2)}</span>
                        </div>
                        <div class="col">
                            <span class="ticket-label">Discount</span>
                            <span class="fw-bold text-success">-₹${Number(b.discount || 0).toFixed(2)}</span>
                        </div>
                        <div class="col">
                            <span class="ticket-label">GST</span>
                            <span class="fw-bold">+₹${Number(b.gst || 0).toFixed(2)}</span>
                        </div>
                        <div class="col">
                            <span class="ticket-label">Paid (${escapeHtml(b.payment_mode || 'Cash')})</span>
                            <span class="fw-bold text-success">₹${Number(b.paid_amount || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <!-- Footer Terms -->
                <div class="text-center text-muted small pt-2 border-top">
                    <div><i class="bi bi-info-circle me-1"></i>Please report at pickup point 15 minutes prior to departure. Carry a valid photo ID.</div>
                    <div class="fw-bold text-dark mt-1" style="font-weight: 800 !important; letter-spacing: 0.5px;">NON-REFUNDABLE</div>
                </div>
            </div>
        `;
    }

    function printCurrentTicket(b) {
        if (!b) {
            showAlert('Please select or create a booking to print.', 'warning');
            return;
        }
        printArea.innerHTML = generateTicketHtml(b); // Print single ticket
        printArea.classList.remove('d-none');
        window.print();
    }

    btnPrint.addEventListener('click', function () {
        if (!currentBookingData) {
            const formData = collectFormData();
            if (!formData.passenger_name || !formData.seat_number) {
                showAlert('Please fill form or select a booking from the table to print.', 'warning');
                return;
            }
            formData.ticket_no = ticketNoField.value || 'OB-Draft';
            printCurrentTicket(formData);
        } else {
            printCurrentTicket(currentBookingData);
        }
    });

    async function generateTicketPdfBlob(b) {
        printArea.innerHTML = generateTicketHtml(b);
        printArea.classList.remove('d-none');

        const ticketCard = printArea.querySelector('.ticket-card');
        const canvas = await html2canvas(ticketCard, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'pt', [canvas.width / 2, canvas.height / 2]);
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        
        printArea.classList.add('d-none');
        return pdf.output('blob');
    }

    async function shareOnWhatsApp(b, pdfBlob) {
        const file = new File([pdfBlob], `Ticket_${b.ticket_no || 'Booking'}.pdf`, { type: 'application/pdf' });
        const textMsg = `Hello ${b.passenger_name},\nHere is your ticket for ${b.from_place} to ${b.to_place}.\nTicket No: ${b.ticket_no}`;
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'Ticket PDF',
                    text: textMsg
                });
                return;
            } catch (err) {
                console.log('Share canceled or failed natively', err);
            }
        }
        
        // Fallback: Download and open WA Web
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        const phone = b.passenger_mobile ? `91${b.passenger_mobile.replace(/\D/g, '')}` : '';
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(textMsg + "\n\n(Please attach the downloaded PDF)")}`;
        window.open(waUrl, '_blank');
    }

    btnPdf.addEventListener('click', async function () {
        const b = currentBookingData || (form.checkValidity() ? { ...collectFormData(), ticket_no: ticketNoField.value || 'OB-Draft' } : null);
        if (!b) {
            showAlert('Please select or fill a booking to download PDF.', 'warning');
            return;
        }

        try {
            showAlert('Generating Ticket PDF...', 'info');
            const blob = await generateTicketPdfBlob(b);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Ticket_${b.ticket_no || 'Booking'}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showAlert('Ticket PDF downloaded successfully!', 'success');
        } catch (err) {
            console.error(err);
            showAlert('Failed to generate PDF.', 'danger');
        }
    });

    // -------------------------------------------------
    // INITIALIZATION
    // -------------------------------------------------
    async function init() {
        document.getElementById('booking_date').value = todayStr();
        recalcAmounts();
        await refreshNextTicket();
        await loadAllBookings();
    }

    init();
});
