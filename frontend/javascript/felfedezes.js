// Események betöltése az API-ról, kártyák és térkép frissítése
async function fetchEvents() {
    try {
        const response = await fetch('/api/events');
        const data = await response.json();
        allEvents = groupEvents(data).map(normalizeEvent);
        renderCards(allEvents);
        displayMarkers(allEvents);
    } catch (error) {
        console.error('Nem sikerült betölteni az eseményeket:', error);
    }
}

function _makeSvgIcon(pathD) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('height', '18px');
    svg.setAttribute('viewBox', '0 -960 960 960');
    svg.setAttribute('width', '18px');
    svg.setAttribute('fill', 'currentColor');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    svg.appendChild(path);
    return svg;
}

// Esemény kártyák kirajzolása a #discoverevents konténerbe
function renderCards(eventsToRender) {
    const container = document.getElementById('discoverevents');
    if (!container) return;

    container.innerHTML = '';
    eventsToRender.forEach(event => {
        const card = document.createElement('div');
        card.className = 'events-item';

        const img = document.createElement('img');
        img.src = `/api/images/${event.id}`;
        img.alt = event.name;
        img.className = 'events-item-img';
        img.onerror = function() { this.onerror = null; };
        card.appendChild(img);

        const body = document.createElement('div');
        body.className = 'events-item-body';

        const title = document.createElement('h3');
        title.className = 'events-item-title';
        title.textContent = event.name;
        body.appendChild(title);

        const info = document.createElement('div');
        info.className = 'events-item-info';

        const dateRow = document.createElement('div');
        dateRow.className = 'events-item-info-row';
        dateRow.appendChild(_makeSvgIcon('M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-40q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840v40h320v-40q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840v40h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z'));
        const dateSpan = document.createElement('span');
        dateSpan.textContent = event.dates.length > 1
            ? `${event.dates[0]} (+${event.dates.length - 1} időpont)`
            : event.dates[0];
        dateRow.appendChild(dateSpan);
        info.appendChild(dateRow);

        const locationRow = document.createElement('div');
        locationRow.className = 'events-item-info-row';
        locationRow.appendChild(_makeSvgIcon('M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-71.5-178.5T480-800q-109 0-180.5 69.5T228-552q0 71 59 162.5T480-186Z'));
        const locationSpan = document.createElement('span');
        locationSpan.textContent = event.helyszin;
        locationRow.appendChild(locationSpan);
        info.appendChild(locationRow);

        body.appendChild(info);

        const badgeRow = document.createElement('div');
        badgeRow.className = 'events-item-badge-row';
        const typeBadge = document.createElement('span');
        typeBadge.className = 'events-item-type events-item-type-'+event.type;
        typeBadge.textContent = event.type === 'official' ? 'Hivatalos' :'Közösségi';
        badgeRow.appendChild(typeBadge);
        body.appendChild(badgeRow);

        const actions = document.createElement('div');
        actions.className = 'events-item-actions';
        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'events-item-btn events-item-btn-primary';
        detailsBtn.textContent = 'Részletek';
        detailsBtn.addEventListener('click', () => openEventModal(event.id));
        actions.appendChild(detailsBtn);
        body.appendChild(actions);

        card.appendChild(body);
        container.appendChild(card);
    });
}

// Keresés a kártyákon és térképen
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!searchTerm) {
        applyFilters();
        return;
    }
    const filtered = allEvents.filter(evt =>
        evt.name.toLowerCase().includes(searchTerm) ||
        evt.helyszin.toLowerCase().includes(searchTerm) ||
        evt.category.toLowerCase().includes(searchTerm)
    );
    renderCards(filtered);
    displayMarkers(filtered);
}

// Kategória + dátum + keresés szűrők alkalmazása
function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
    const normalizeStr = str => (str || '').normalize('NFC').toLowerCase().trim();
    const checkedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
        .map(cb => normalizeStr(cb.value));
    const dateFrom = document.getElementById('dateFrom')?.value || '';
    const dateTo = document.getElementById('dateTo')?.value || '';

    let filtered = checkedCategories.length > 0
        ? allEvents.filter(evt => checkedCategories.includes(normalizeStr(evt.category)))
        : [];

    if (dateFrom || dateTo) {
        filtered = filtered.filter(evt =>
            evt.rawDates.some(d => {
                if (dateFrom && dateTo) return d >= dateFrom && d <= dateTo;
                if (dateFrom) return d >= dateFrom;
                return d <= dateTo;
            })
        );
    }

    if (searchTerm) {
        filtered = filtered.filter(evt =>
            evt.name.toLowerCase().includes(searchTerm) ||
            evt.helyszin.toLowerCase().includes(searchTerm) ||
            evt.category.toLowerCase().includes(searchTerm)
        );
    }

    renderCards(filtered);
    displayMarkers(filtered);
}

// Szűrők törlése és alapállapot visszaállítása
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.querySelectorAll('.category-checkbox').forEach(cb => { cb.checked = true; });
    renderCards(allEvents);
    displayMarkers(allEvents);
    map.setCenter({ lat: 47.4979, lng: 19.0402 });
    map.setZoom(13);
}

// Keresés és szűrő event listenerek beállítása
function setupEventListeners() {
    document.getElementById('searchBtn')?.addEventListener('click', performSearch);
    document.getElementById('searchInput')?.addEventListener('input', performSearch);
    document.getElementById('searchInput')?.addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });
    document.querySelectorAll('.category-checkbox').forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });
    document.getElementById('dateFrom')?.addEventListener('change', applyFilters);
    document.getElementById('dateTo')?.addEventListener('change', applyFilters);
    document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
}

// applyFilters és resetFilters exportálása index.js számára
window.mapFunctions = {
    ...window.mapFunctions,
    applyFilters,
    resetFilters
};

// Oldal inicializálása
document.addEventListener('DOMContentLoaded', async function() {
    await loadGoogleMapsAPI();
    initializeMap();
    setupEventListeners();
    await fetchEvents();

    // Ha eventId van az URL-ben (pl. főoldalról érkezés), megnyitja a modalt
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('eventId');
    if (eventId) {
        window.openEventModal(parseInt(eventId));
    }
});
