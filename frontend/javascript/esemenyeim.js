document.addEventListener('DOMContentLoaded', async function () {
    if (await userSessionCheck()) {
        setupEventPage();
    } else {
        redirectToLogin(document.getElementById('events-container'));
    }
});

function setupEventPage() {
    setupTabNavigation();
    loadAllEvents();
    setupEventDetailsModal();
    setupEventActions();
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
            } else if (type === 'created') {
                paragraph.textContent = 'Nincsenek létrehozott eseményeid. ';
                const link = document.createElement('a');
                link.href = '/profile';
                link.textContent = 'Hozz létre egy új eseményt!';
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

    const imageUrl = `/api/images/${event.id+214}`;
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

    body.appendChild(info);

    // Create type badge
    const typeBadge = document.createElement('span');
    typeBadge.className = 'events-item-type';
    typeBadge.textContent = eventType;
    body.appendChild(typeBadge);

    // Create actions container
    const actions = document.createElement('div');
    actions.className = 'events-item-actions';

    if (type === 'created') {
        const editBtn = document.createElement('button');
        editBtn.className = 'events-item-btn events-item-btn-primary';
        editBtn.textContent = 'Szerkesztés';
        editBtn.addEventListener('click', () => editEvent(event.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'events-item-btn events-item-btn-danger';
        deleteBtn.textContent = 'Törlés';
        deleteBtn.addEventListener('click', () => showDeleteConfirmationModal(event.id));

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
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

function setupEventDetailsModal() {
    const modal = document.getElementById('eventDetailsModal');
    const closeBtn = modal.querySelector('.btn-close-custom');

    closeBtn.addEventListener('click', () => {
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) bootstrapModal.hide();
    });
}

async function viewEventDetails(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            alert('Nem sikerült betölteni az esemény részleteit');
            return;
        }

        const event = await response.json();

        // Populate modal
        document.getElementById('detailsEventTitle').textContent = event.title;
        document.getElementById('detailsLocation').textContent = event.location;
        document.getElementById('detailsCategory').textContent = event.category || 'Általános';
        document.getElementById('detailsType').textContent = event.is_private ? 'Közösségi' : 'Hivatalos';
        document.getElementById('detailsDescription').textContent = event.description || 'Nincs leírás';

        const dateObj = new Date(event.date);
        const dateStr = dateObj.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('detailsDate').textContent = `${dateStr} - ${timeStr}`;

        // Set up action buttons
        setupModalActions(event);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('eventDetailsModal'));
        modal.show();

    } catch (error) {
        console.error('Error loading event details:', error);
        alert('Hálózati hiba az esemény betöltésekor');
    }
}

function setupModalActions(event) {
    const actionsContainer = document.getElementById('modalActions');
    actionsContainer.innerHTML = '';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'event-action-btn secondary-btn';
    closeBtn.textContent = 'Bezárás';
    closeBtn.addEventListener('click', () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('eventDetailsModal'));
        modal.hide();
    });

    const leaveBtn = document.createElement('button');
    leaveBtn.className = 'event-action-btn primary-btn';
    leaveBtn.textContent = 'Elhagyás';
    leaveBtn.addEventListener('click', () => {
        const detailsModal = bootstrap.Modal.getInstance(document.getElementById('eventDetailsModal'));
        detailsModal.hide();
        leaveEvent(event.id);
    });

    actionsContainer.appendChild(leaveBtn);
    actionsContainer.appendChild(closeBtn);
}

async function leaveEvent(eventId) {
    showLeaveConfirmationModal(eventId);
}

function editEvent(eventId) {
    window.location.href = `/edit-event/${eventId}`;
}



async function userSessionCheck() {
    const res = await fetch('/api/userSession', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await res.json();
    return data.session;
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
            const response = await fetch(`/api/events/${eventId}`, {
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

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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
            window.location.href = '/create-event';
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
