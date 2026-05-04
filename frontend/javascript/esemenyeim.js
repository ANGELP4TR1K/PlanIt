document.addEventListener('DOMContentLoaded', async function () {
    if (await userSessionCheck()) {
        setupEventPage();
    } else {
        redirectToLogin(document.getElementById('events-container'));
    }
});

let ceAllLocations = [];
let ceEditingEventId = null;

function setupEventPage() {
    setupTabNavigation();
    loadAllEvents();
    setupEventActions();
    setupCommunityEventForm();
    handleInviteLink();
}

function handleInviteLink() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (!token) return;

    // Switch to the community/private tab so context is clear
    const joinTab = document.querySelector('.tab-btn[data-tab="communityEvents"]');
    if (joinTab) joinTab.click();

    // Pre-fill and open the join modal
    const inviteCodeInput = document.getElementById('inviteCode');
    if (inviteCodeInput) inviteCodeInput.value = token;

    const joinModal = new bootstrap.Modal(document.getElementById('joinEventModal'));
    joinModal.show();

    // Clean the URL so the token isn't re-triggered on refresh
    window.history.replaceState({}, '', window.location.pathname);
}

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

async function loadAllEvents() {
    try {
        const response = await fetch('/api/userEvents', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Failed to load events');
            return;
        }

        const data = await response.json();

        // Display official events (joined)
        displayEvents(data.communityEvents, 'officialEventsGrid', 'official');

        // Display community events (joined)
        displayEvents(data.privateEvents, 'communityEventsGrid', 'community');

        // Display created events
        displayEvents(data.createdEvents, 'createdEventsGrid', 'created');

        // Display past events
        displayEvents(data.pastEvents, 'pastEventsGrid', 'past');

        // Display past created events
        displayEvents(data.pastCreatedEvents, 'pastCreatedEventsGrid', 'pastCreated');

    } catch (error) {
        console.error('Error loading events:', error);
    }
}

function displayEvents(events, gridId, type) {
    const grid = document.getElementById(gridId);

    // Remove all existing event cards and empty states
    const existingCards = grid.querySelectorAll('.events-item');
    existingCards.forEach(card => card.remove());

    const existingEmptyState = grid.querySelector('.empty-state');
    if (existingEmptyState) {
        existingEmptyState.remove();
    }

    if (!events || events.length === 0) {
        // Show empty state
        const emptyState = grid.querySelector('.empty-state');
        if (!emptyState) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-state';

            // Create SVG element
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('height', '48px');
            svg.setAttribute('viewBox', '0 -960 960 960');
            svg.setAttribute('width', '48px');
            svg.setAttribute('fill', 'currentColor');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // Set SVG path based on type
            if (type === 'official') {
                path.setAttribute('d', 'm344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z');
            } else if (type === 'community') {
                path.setAttribute('d', 'M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-240Zm0-400Z');
            } else if (type === 'created') {
                path.setAttribute('d', 'M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z');
            } else if (type === 'past') {
                path.setAttribute('d', 'M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-456v-224h80v192l120 120-48 56Z');
            } else if (type === 'pastCreated') {
                path.setAttribute('d', 'M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-456v-224h80v192l120 120-48 56Z');
            }

            svg.appendChild(path);
            emptyDiv.appendChild(svg);

            // Create text content
            const paragraph = document.createElement('p');
            if (type === 'official') {
                paragraph.textContent = 'Nem csatlakoztál még hivatalos eseményhez. ';
                const link = document.createElement('a');
                link.href = '/felfedezes';
                link.textContent = 'Fedezd fel az eseményeket!';
                paragraph.appendChild(link);
            } else if (type === 'community') {
                paragraph.textContent = 'Nem csatlakoztál még közösségi eseményhez.';
            } else if (type === 'past') {
                paragraph.textContent = 'Még nem vettél részt eseményen.';
            } else if (type === 'pastCreated') {
                paragraph.textContent = 'Még nem hoztál létre eseményt.';
            } else if (type === 'created') {
                paragraph.textContent = 'Nincsenek létrehozott eseményeid. ';
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = 'Hozz létre egy új eseményt!';
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    new bootstrap.Modal(document.getElementById('createCommunityEventModal')).show();
                });
                paragraph.appendChild(link);
            }

            emptyDiv.appendChild(paragraph);
            grid.appendChild(emptyDiv);
        }
        return;
    }

    events.forEach(event => {
        const card = createEventCard(event, type);
        grid.appendChild(card);
    });
}

function createEventCard(event, type) {
    const card = document.createElement('div');
    card.className = 'events-item';
    card.setAttribute('data-event-id', event.id);

    const imageUrl = `/api/images/${event.id}`;
    const eventType = event.type == 'private' ? 'Közösségi' : 'Hivatalos';
    const dateObj = new Date(event.date);
    const dateStr = dateObj.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });

    // Create image element
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = event.title;
    img.className = 'events-item-img';
    img.onerror = function() {
        this.src = `/uploads/${event.id}.jpg`;
        this.onerror = null;
    };
    card.appendChild(img);

    // Create body
    const body = document.createElement('div');
    body.className = 'events-item-body';

    // Create title
    const title = document.createElement('h3');
    title.className = 'events-item-title';
    title.textContent = event.title;
    body.appendChild(title);

    // Create info container
    const info = document.createElement('div');
    info.className = 'events-item-info';

    // Create date info row
    const dateRow = document.createElement('div');
    dateRow.className = 'events-item-info-row';
    const dateSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    dateSvg.setAttribute('height', '18px');
    dateSvg.setAttribute('viewBox', '0 -960 960 960');
    dateSvg.setAttribute('width', '18px');
    dateSvg.setAttribute('fill', 'currentColor');
    const datePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    datePath.setAttribute('d', 'M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-40q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840v40h320v-40q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840v40h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z');
    dateSvg.appendChild(datePath);
    const dateSpan = document.createElement('span');
    dateSpan.textContent = `${dateStr} ${timeStr}`;
    dateRow.appendChild(dateSvg);
    dateRow.appendChild(dateSpan);
    info.appendChild(dateRow);

    // Create location info row
    const locationRow = document.createElement('div');
    locationRow.className = 'events-item-info-row';
    const locationSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    locationSvg.setAttribute('height', '18px');
    locationSvg.setAttribute('viewBox', '0 -960 960 960');
    locationSvg.setAttribute('width', '18px');
    locationSvg.setAttribute('fill', 'currentColor');
    const locationPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    locationPath.setAttribute('d', 'M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-71.5-178.5T480-800q-109 0-180.5 69.5T228-552q0 71 59 162.5T480-186Z');
    locationSvg.appendChild(locationPath);
    const locationSpan = document.createElement('span');
    locationSpan.textContent = event.location;
    locationRow.appendChild(locationSvg);
    locationRow.appendChild(locationSpan);
    info.appendChild(locationRow);

    if ((type === 'community') && event.capacity) {
        const capacityRow = document.createElement('div');
        capacityRow.className = 'events-item-info-row';
        const capacitySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        capacitySvg.setAttribute('height', '18px');
        capacitySvg.setAttribute('viewBox', '0 -960 960 960');
        capacitySvg.setAttribute('width', '18px');
        capacitySvg.setAttribute('fill', 'currentColor');
        const capacityPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        capacityPath.setAttribute('d', 'M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z');
        capacitySvg.appendChild(capacityPath);
        const capacitySpan = document.createElement('span');
        const joined = event.participant_count ?? 0;
        capacitySpan.textContent = `${joined} / ${event.capacity} résztvevő`;
        capacityRow.appendChild(capacitySvg);
        capacityRow.appendChild(capacitySpan);
        info.appendChild(capacityRow);
    }

    body.appendChild(info);

    // Create type badge(s)
    const badgeRow = document.createElement('div');
    badgeRow.className = 'events-item-badge-row';

    const typeBadge = document.createElement('span');
    typeBadge.className = 'events-item-type';
    typeBadge.textContent = eventType;
    badgeRow.appendChild(typeBadge);

    if (event.is_private) {
        const privateBadge = document.createElement('span');
        privateBadge.className = 'events-item-type events-item-type-private';
        privateBadge.textContent = 'Privát';
        badgeRow.appendChild(privateBadge);
    }

    body.appendChild(badgeRow);

    // Create actions container
    const actions = document.createElement('div');
    actions.className = 'events-item-actions';

    if (type === 'created') {
        if (event.is_private && event.invite_token) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'events-item-btn events-item-btn-copy';
            copyBtn.textContent = 'Meghívó másolása';
            copyBtn.addEventListener('click', () => {
                const inviteUrl = `${window.location.origin}/esemenyeim?invite=${event.invite_token}`;
                const message = `Meghívlak a(z) ${event.title} eseményemre csatlakozz a következő kóddal vagy csak kattints a linkre!\n\n${event.invite_token}\n\n${inviteUrl}`;
                navigator.clipboard.writeText(message).then(() => {
                    copyBtn.textContent = 'Másolva!';
                    setTimeout(() => { copyBtn.textContent = 'Meghívó link másolása'; }, 2000);
                });
            });
            actions.appendChild(copyBtn);
        }

        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'events-item-btn events-item-btn-secondary';
        detailsBtn.textContent = 'Részletek';
        detailsBtn.addEventListener('click', () => viewEventDetails(event.id));

        const attendeesBtn = document.createElement('button');
        attendeesBtn.className = 'events-item-btn events-item-btn-secondary';
        attendeesBtn.textContent = 'Résztvevők';
        attendeesBtn.addEventListener('click', () => openParticipantsModal(event.id, event.title));

        const editBtn = document.createElement('button');
        editBtn.className = 'events-item-btn events-item-btn-primary';
        editBtn.textContent = 'Szerkesztés';
        editBtn.addEventListener('click', () => editEvent(event));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'events-item-btn events-item-btn-danger';
        deleteBtn.textContent = 'Törlés';
        deleteBtn.addEventListener('click', () => showDeleteConfirmationModal(event.id));

        actions.appendChild(detailsBtn);
        actions.appendChild(attendeesBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
    } else if (type === 'past' || type === 'pastCreated') {
        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'events-item-btn events-item-btn-secondary';
        detailsBtn.textContent = 'Részletek';
        detailsBtn.addEventListener('click', () => viewEventDetails(event.id));
        actions.appendChild(detailsBtn);

        if (type === 'pastCreated') {
            const attendeesBtn = document.createElement('button');
            attendeesBtn.className = 'events-item-btn events-item-btn-secondary';
            attendeesBtn.textContent = 'Résztvevők';
            attendeesBtn.addEventListener('click', () => openParticipantsModal(event.id, event.title, true));
            actions.appendChild(attendeesBtn);
        }
    } else {
        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'events-item-btn events-item-btn-primary';
        detailsBtn.textContent = 'Részletek';
        detailsBtn.addEventListener('click', () => viewEventDetails(event.id));

        const leaveBtn = document.createElement('button');
        leaveBtn.className = 'events-item-btn events-item-btn-danger';
        leaveBtn.textContent = 'Elhagyás';
        leaveBtn.addEventListener('click', () => leaveEvent(event.id));

        actions.appendChild(detailsBtn);
        actions.appendChild(leaveBtn);
    }

    body.appendChild(actions);
    card.appendChild(body);

    return card;
}

const categoryHeroImages = {
    'koncert': '/api/categories/koncert.png',
    'fesztivál': '/api/categories/fesztival.png',
    'sport': '/api/categories/sport.png',
    'színház': '/api/categories/szinhaz.png',
    'komédia': '/api/categories/komedia.png',
    'vásár': '/api/categories/vasar.png',
    'workshop': '/api/categories/workshop.png'
};

async function viewEventDetails(eventId) {
    try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) { showNotification('Nem sikerült betölteni az esemény részleteit', 'error'); return; }
        const event = await res.json();

        const category = (event.category || '').toLowerCase();
        document.getElementById('eventModalHero').src = categoryHeroImages[category] || '/api/categories/default.png';
        document.getElementById('eventModalImage').src = `/api/images/${eventId}`;
        document.getElementById('eventModalTitle').textContent = event.title;
        document.getElementById('eventModalCategory').textContent = event.category || 'Általános';
        document.getElementById('eventModalLocation').textContent = event.location;
        document.getElementById('eventModalDescription').textContent = event.description || 'Nincs leírás';

        const d = new Date(event.date);
        document.getElementById('eventModalDate').textContent =
            d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }) +
            ' – ' + d.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });

        const nav = document.getElementById('navigateBtn');
        nav.href = event.lat && event.lng
            ? `https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;

        fetch(`/api/events/${eventId}/participants/count`)
            .then(r => r.json())
            .then(data => { document.getElementById('eventModalParticipantCount').textContent = data.count ?? 0; })
            .catch(() => {});

        setupModalActions(event);
        new bootstrap.Modal(document.getElementById('eventDetailsModal')).show();

    } catch (err) {
        console.error(err);
        showNotification('Hálózati hiba az esemény betöltésekor', 'error');
    }
}

function setupModalActions(event) {
    const actionsContainer = document.getElementById('modalActions');
    actionsContainer.innerHTML = '';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'event-action-btn secondary-btn';
    closeBtn.textContent = 'Bezárás';
    closeBtn.setAttribute('data-bs-dismiss', 'modal');
    actionsContainer.appendChild(closeBtn);

    if (!event.is_private) {
        const leaveBtn = document.createElement('button');
        leaveBtn.className = 'event-action-btn primary-btn';
        leaveBtn.textContent = 'Elhagyás';
        leaveBtn.addEventListener('click', () => {
            bootstrap.Modal.getInstance(document.getElementById('eventDetailsModal')).hide();
            leaveEvent(event.id);
        });
        actionsContainer.appendChild(leaveBtn);
    }
}

async function leaveEvent(eventId) {
    showLeaveConfirmationModal(eventId);
}

function editEvent(event) {
    ceEditingEventId = event.id;

    document.getElementById('ce-title').value = event.title || '';
    document.getElementById('ce-description').value = event.description || '';
    document.getElementById('ce-category').value = event.category || '';
    document.getElementById('ce-locationInput').value = event.location || '';
    document.getElementById('ce-selectedLocationId').value = event.location_id || '';
    document.getElementById('ce-capacity').value = event.capacity || '';
    document.getElementById('ce-isPrivate').checked = !!event.is_private;

    const dateStr = event.date ? (event.date.includes('T') ? event.date : event.date.replace(' ', 'T')) : '';
    if (dateStr) {
        const d = new Date(dateStr);
        const pad = n => String(n).padStart(2, '0');
        document.getElementById('ce-date').value =
            `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    document.getElementById('ce-newLocationFields').style.display = 'none';

    const modal = document.querySelector('#createCommunityEventModal .ce-modal-title');
    if (modal) modal.textContent = 'Esemény szerkesztése';
    const submitBtn = document.getElementById('ce-submitBtn');
    if (submitBtn) submitBtn.textContent = 'Esemény mentése';

    new bootstrap.Modal(document.getElementById('createCommunityEventModal')).show();
}




function showLeaveConfirmationModal(eventId) {
    const overlay = document.createElement('div');
    overlay.className = 'confirmation-modal-overlay';

    const modalBox = document.createElement('div');
    modalBox.className = 'confirmation-modal';

    const content = document.createElement('div');
    content.className = 'confirmation-modal-content';

    const title = document.createElement('h2');
    title.textContent = 'Esemény elhagyása';

    const text = document.createElement('p');
    text.textContent = 'Biztosan el szeretnéd hagyni ezt az eseményt?';

    const actions = document.createElement('div');
    actions.className = 'confirmation-modal-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'confirmation-btn confirmation-btn-cancel';
    cancelBtn.textContent = 'Mégse';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'confirmation-btn confirmation-btn-confirm';
    confirmBtn.textContent = 'Elhagyás';

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    content.appendChild(title);
    content.appendChild(text);
    content.appendChild(actions);
    modalBox.appendChild(content);
    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);

    cancelBtn.addEventListener('click', () => {
        overlay.remove();
    });

    confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Feldolgozás...';

        try {
            const response = await fetch(`/api/events/${eventId}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                showNotification('Nem sikerült elhagyni az eseményt', 'error');
                overlay.remove();
                return;
            }

            showNotification('Sikeresen elhagytad az eseményt', 'success');

            loadAllEvents();
            overlay.remove();
        } catch (error) {
            console.error('Error leaving event:', error);
            showNotification('Hálózati hiba az esemény elhagyásakor', 'error');
            overlay.remove();
        }
    });

    // Close on background click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

async function showDeleteConfirmationModal(eventId) {
    const overlay = document.createElement('div');
    overlay.className = 'confirmation-modal-overlay';

    const modalBox = document.createElement('div');
    modalBox.className = 'confirmation-modal';

    const content = document.createElement('div');
    content.className = 'confirmation-modal-content';

    const title = document.createElement('h2');
    title.textContent = 'Esemény törlése';

    const text = document.createElement('p');
    text.textContent = 'Biztosan törölni szeretnéd ezt az eseményt? Ez a művelet nem visszafordítható!';

    const actions = document.createElement('div');
    actions.className = 'confirmation-modal-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'confirmation-btn confirmation-btn-cancel';
    cancelBtn.textContent = 'Mégse';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'confirmation-btn confirmation-btn-confirm';
    confirmBtn.textContent = 'Törlés';

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    content.appendChild(title);
    content.appendChild(text);
    content.appendChild(actions);
    modalBox.appendChild(content);
    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);

    cancelBtn.addEventListener('click', () => {
        overlay.remove();
    });

    confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Feldolgozás...';

        try {
            const response = await fetch(`/api/deleteCommunityEvent/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                showNotification('Nem sikerült törölni az eseményt', 'error');
                overlay.remove();
                return;
            }

            showNotification('Az esemény sikeresen törölve lett', 'success');


            loadAllEvents();
            overlay.remove();

        } catch (error) {
            console.error('Error deleting event:', error);
            showNotification('Hálózati hiba az esemény törléskor', 'error');
            overlay.remove();
        }
    });

    // Close on background click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

async function setupCommunityEventForm() {
    // Load locations for autocomplete
    try {
        const res = await fetch('/api/locations');
        const data = await res.json();
        ceAllLocations = data.locations || [];
    } catch (e) {
        console.error('Error fetching locations:', e);
    }

    setupCELocationAutocomplete();
    setupCEImagePreview();

    document.getElementById('ce-submitBtn').addEventListener('click', submitCommunityEventForm);

    // Reset form when modal closes
    const modalEl = document.getElementById('createCommunityEventModal');
    modalEl.addEventListener('hidden.bs.modal', () => {
        resetCEForm();
        const titleEl = modalEl.querySelector('.ce-modal-title');
        if (titleEl) titleEl.textContent = 'Új esemény létrehozása';
        const submitBtn = document.getElementById('ce-submitBtn');
        if (submitBtn) submitBtn.textContent = 'Esemény létrehozása';
    });
}

function setupCELocationAutocomplete() {
    const locationInput = document.getElementById('ce-locationInput');
    const locationDropdown = document.getElementById('ce-locationDropdown');
    const newLocationFields = document.getElementById('ce-newLocationFields');
    const selectedLocationId = document.getElementById('ce-selectedLocationId');

    locationInput.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        if (query.length === 0) {
            locationDropdown.style.display = 'none';
            return;
        }

        const filtered = ceAllLocations.filter(loc => loc.name.toLowerCase().includes(query));
        locationDropdown.innerHTML = '';

        filtered.forEach(loc => {
            const item = document.createElement('div');
            item.className = 'ce-location-item';
            item.textContent = loc.name;
            item.addEventListener('click', () => {
                locationInput.value = loc.name;
                selectedLocationId.value = loc.id;
                newLocationFields.style.display = 'none';
                locationDropdown.style.display = 'none';
                clearCENewLocationFields();
            });
            locationDropdown.appendChild(item);
        });

        const newItem = document.createElement('div');
        newItem.className = 'ce-location-item ce-location-item-new';
        newItem.textContent = `"${query}" – Új helyszín létrehozása`;
        newItem.addEventListener('click', () => {
            locationInput.value = query;
            selectedLocationId.value = '';
            newLocationFields.style.display = 'block';
            locationDropdown.style.display = 'none';
        });
        locationDropdown.appendChild(newItem);

        locationDropdown.style.display = 'block';
    });

    document.addEventListener('click', function (e) {
        if (e.target !== locationInput && !locationDropdown.contains(e.target)) {
            locationDropdown.style.display = 'none';
        }
    });
}

function clearCENewLocationFields() {
    ['ce-locationName', 'ce-zipCode', 'ce-city', 'ce-street', 'ce-houseNumber'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function setupCEImagePreview() {
    const imageInput = document.getElementById('ce-image');
    const imagePreview = document.getElementById('ce-imagePreview');
    const imagePreviewContainer = document.getElementById('ce-imagePreviewContainer');
    const removeImageBtn = document.getElementById('ce-removeImageBtn');

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
                imagePreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    removeImageBtn.addEventListener('click', () => {
        imageInput.value = '';
        imagePreviewContainer.style.display = 'none';
        imagePreview.src = '';
    });
}

async function submitCommunityEventForm() {
    const title = document.getElementById('ce-title').value.trim();
    const description = document.getElementById('ce-description').value.trim();
    const category = document.getElementById('ce-category').value;
    const locationInput = document.getElementById('ce-locationInput').value.trim();
    const selectedLocationId = document.getElementById('ce-selectedLocationId').value;
    const date = document.getElementById('ce-date').value;
    const capacity = document.getElementById('ce-capacity').value;
    const isPrivate = document.getElementById('ce-isPrivate').checked;
    const imageInput = document.getElementById('ce-image');

    const errorEl = document.getElementById('ce-formError');
    errorEl.style.display = 'none';
    errorEl.textContent = '';

    if (!title || !description || !category || !locationInput || !date || !capacity) {
        errorEl.textContent = 'Tölts ki az összes kötelező mezőt!';
        errorEl.style.display = 'block';
        return;
    }

    if (!isPrivate && !selectedLocationId) {
        const locationName = document.getElementById('ce-locationName').value.trim();
        const zipCode = document.getElementById('ce-zipCode').value.trim();
        const city = document.getElementById('ce-city').value.trim();
        const street = document.getElementById('ce-street').value.trim();
        const houseNumber = document.getElementById('ce-houseNumber').value.trim();

        if (!locationName || !zipCode || !city || !street || !houseNumber) {
            errorEl.textContent = 'Tölts ki az összes helyszín adatot, vagy válassz meglévő helyszínt!';
            errorEl.style.display = 'block';
            return;
        }
    }

    const submitBtn = document.getElementById('ce-submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Feldolgozás...';

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('date', date);
        formData.append('capacity', capacity);
        formData.append('is_private', isPrivate ? '1' : '0');

        formData.append('locationText', locationInput);

        if (selectedLocationId) {
            formData.append('locationId', selectedLocationId);
        } else {
            formData.append('locationName', document.getElementById('ce-locationName').value.trim());
            formData.append('zipCode', document.getElementById('ce-zipCode').value.trim());
            formData.append('city', document.getElementById('ce-city').value.trim());
            formData.append('street', document.getElementById('ce-street').value.trim());
            formData.append('houseNumber', document.getElementById('ce-houseNumber').value.trim());
        }

        if (imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }

        const isEditing = !!ceEditingEventId;
        const endpoint = isEditing ? `/api/updateCommunityEvent/${ceEditingEventId}` : '/api/createCommunityEvent';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(endpoint, { method, body: formData });
        const data = await response.json();

        if (!response.ok) {
            errorEl.textContent = data.message || (isEditing ? 'Hiba az esemény frissítése során.' : 'Hiba az esemény létrehozása során.');
            errorEl.style.display = 'block';
            return;
        }

        const bsModal = bootstrap.Modal.getInstance(document.getElementById('createCommunityEventModal'));
        bsModal.hide();

        showNotification(isEditing ? 'Esemény sikeresen frissítve!' : 'Esemény sikeresen létrehozva!', 'success');
        loadAllEvents();

    } catch (error) {
        console.error('Error creating community event:', error);
        errorEl.textContent = 'Hálózati hiba az esemény létrehozása során.';
        errorEl.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = ceEditingEventId ? 'Esemény mentése' : 'Esemény létrehozása';
    }
}

function resetCEForm() {
    ceEditingEventId = null;
    document.getElementById('ce-eventForm').reset();
    document.getElementById('ce-locationInput').value = '';
    document.getElementById('ce-selectedLocationId').value = '';
    document.getElementById('ce-newLocationFields').style.display = 'none';
    clearCENewLocationFields();
    document.getElementById('ce-imagePreviewContainer').style.display = 'none';
    document.getElementById('ce-imagePreview').src = '';
    document.getElementById('ce-image').value = '';
    document.getElementById('ce-formError').style.display = 'none';
}

function setupEventActions() {
    const joinEventBtn = document.getElementById('joinEventBtn');
    const createEventBtn = document.getElementById('createEventBtn');
    const joinEventForm = document.getElementById('joinEventForm');

    if (joinEventBtn) {
        joinEventBtn.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('joinEventModal'));
            modal.show();
        });
    }

    if (createEventBtn) {
        createEventBtn.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('createCommunityEventModal'));
            modal.show();
        });
    }

    if (joinEventForm) {
        joinEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inviteCode = document.getElementById('inviteCode').value.trim();

            if (!inviteCode) {
                showNotification('Kérjük, írj be egy meghívó kódot', 'error');
                return;
            }

            try {
                const response = await fetch('/api/invite/join', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token: inviteCode })
                });

                const data = await response.json();

                if (!response.ok) {
                    showNotification(data.message || 'Nem sikerült csatlakozni az eseményhez', 'error');
                    return;
                }

                showNotification('Sikeresen csatlakoztál az eseményhez!', 'success');
                const modal = bootstrap.Modal.getInstance(document.getElementById('joinEventModal'));
                modal.hide();
                document.getElementById('inviteCode').value = '';
                loadAllEvents();

            } catch (error) {
                console.error('Error joining event:', error);
                showNotification('Hálózati hiba az esemény csatlakozásakor', 'error');
            }
        });
    }
}

async function openParticipantsModal(eventId, eventTitle, readonly = false) {
    const list = document.getElementById('participantsList');
    const subtitle = document.getElementById('participantsModalSubtitle');
    list.innerHTML = '<p class="participant-empty">Betöltés...</p>';
    subtitle.textContent = eventTitle;

    const modal = new bootstrap.Modal(document.getElementById('participantsModal'));
    modal.show();

    try {
        const response = await fetch(`/api/events/${eventId}/participants`);
        const data = await response.json();

        if (!response.ok) {
            list.innerHTML = `<p class="participant-empty">${data.message}</p>`;
            return;
        }

        if (data.length === 0) {
            list.innerHTML = '<p class="participant-empty">Még nincs résztvevő.</p>';
            return;
        }

        list.innerHTML = '';
        data.forEach(participant => {
            const row = document.createElement('div');
            row.className = 'participant-row';

            const info = document.createElement('div');
            info.className = 'participant-info';
            info.innerHTML = `<span class="participant-name">${participant.full_name}</span><span class="participant-username">@${participant.username}</span>`;

            row.appendChild(info);

            if (!readonly) {
                const removeBtn = document.createElement('button');
                removeBtn.className = 'participant-remove-btn';
                removeBtn.textContent = 'Eltávolítás';
                removeBtn.addEventListener('click', async () => {
                    removeBtn.disabled = true;
                    removeBtn.textContent = '...';
                    const res = await fetch(`/api/events/${eventId}/participants/${participant.id}`, { method: 'DELETE' });
                    if (res.ok) {
                        row.remove();
                        if (list.children.length === 0) {
                            list.innerHTML = '<p class="participant-empty">Még nincs résztvevő.</p>';
                        }
                    } else {
                        removeBtn.disabled = false;
                        removeBtn.textContent = 'Eltávolítás';
                        showNotification('Nem sikerült eltávolítani a résztvevőt', 'error');
                    }
                });
                row.appendChild(removeBtn);
            }
            list.appendChild(row);
        });
    } catch (error) {
        list.innerHTML = '<p class="participant-empty">Hálózati hiba</p>';
    }
}
