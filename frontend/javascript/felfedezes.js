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

// Esemény kártyák kirajzolása a #discoverevents konténerbe
function renderCards(eventsToRender) {
    const container = document.getElementById('discoverevents');
    if (!container) return;

    container.innerHTML = '';
    eventsToRender.forEach(event => {
        const card = document.createElement('div');
        card.className = 'card event-card';
        card.innerHTML = `
            <img src="/api/images/${event.id}" alt="${event.name}" class="card-img-top">
            <div class="card-body">
                <h5 class="card-title">${event.name}</h5>
                <p class="card-text text-muted">${event.helyszin} – ${event.dates.length > 1 ? event.dates[0] + ' (+' + (event.dates.length - 1) + ' időpont)' : event.dates[0]}</p>
                <a href="#" class="btn btn-primary btn-sm" onclick="openEventModal(${event.id}); return false;">Részletek</a>
            </div>
        `;
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
