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

function groupEvents(data) {
    const groups = {};
    data.forEach(e => {
        const key = `${e.title}_${e.location_id}`;
        if (!groups[key]) {
            groups[key] = { ...e, dates: [e.date] };
        } else {
            groups[key].dates.push(e.date);
        }
    });
    return Object.values(groups);
}

function normalizeEvent(e) {
    return {
        id: e.id,
        name: e.title,
        lat: parseFloat(e.latitude),
        lng: parseFloat(e.longitude),
        type: e.type,
        category: e.category,
        helyszin: e.helyszin,
        dates: e.dates.map(formatDate),
        rawDates: e.dates
    };
}

function formatDate(dateStr) {
    return dateStr.split('T')[0].replace('-', '. ').replace('-', '. ') + '.'; //T előtti rész a dátum, utána 2 kötőjel cseréje
}

function renderCards(eventsToRender) {
    const container = document.getElementById('discoverevents');
    if (!container) return;

    container.innerHTML = '';
    eventsToRender.forEach(event => {
        const card = document.createElement('div');
        card.className = 'card event-card';
        card.innerHTML = `
            <img src="/api/images/${event.id+214}" alt="${event.name}" class="card-img-top">
            <div class="card-body">
                <h5 class="card-title">${event.name}</h5>
                <p class="card-text text-muted">${event.helyszin} – ${event.dates.length > 1 ? event.dates[0] + ' (+' + (event.dates.length - 1) + ' időpont)' : event.dates[0]}</p>
                <a href="#" class="btn btn-primary btn-sm" onclick="openEventModal(${event.id}); return false;">Részletek</a>
            </div>
        `;
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadGoogleMapsAPI();
    initializeMap();
    setupEventListeners();
    await fetchEvents();

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('eventId');
    if (eventId) {
        window.openEventModal(parseInt(eventId));
    }
});

let map;
let markers = [];
let infoWindow;
let clusterer = null;

let allEvents = [];

async function loadGoogleMapsAPI() {
    try {
        const response = await fetch('/config');
        const config = await response.json();
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}`;
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    } catch (error) {
        console.error('Failed to load Google Maps API:', error);
    }
}

function initializeMap() {
    const mapDisplay = document.getElementById('mapDisplay');
    if (!mapDisplay) return;

    const defaultCenter = { lat: 47.4979, lng: 19.0402 };
    const defaultZoom = 13;

    map = new google.maps.Map(mapDisplay, {
        center: defaultCenter,
        zoom: defaultZoom,
        streetViewControl: false,
        styles: document.body.classList.contains('dark-mode') ? getDarkModeStyles() : getHidePOIStyles()
    });

    infoWindow = new google.maps.InfoWindow();
}

// Pin marker SVG generálás – 1 event: kék, több event: lila + szám
// encodeURIComponent: az SVG-t URL-safe formátumra alakítja (nem kell base64!)
function makeMarkerSvg(color, label) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42">
        <path d="M16 2 C24 2 30 8 30 16 C30 28 16 42 16 42 C16 42 2 28 2 16 C2 8 8 2 16 2Z"
              fill="${color}" stroke="white" stroke-width="2.5"/>
        <text x="16" y="21" text-anchor="middle" fill="white"
              font-size="12" font-weight="bold">${label}</text>
    </svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// Cluster SVG generálás – kék kör a darabszámmal
function makeClusterSvg(count) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44">
        <circle cx="22" cy="22" r="20" fill="#3b82f6" stroke="white" stroke-width="3"/>
        <text x="22" y="27" text-anchor="middle" fill="white"
              font-size="14" font-weight="bold">${count > 99 ? '99+' : count}</text>
    </svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// Display markers on map
function displayMarkers(eventsToShow) {
    if (!map) return;

    if (clusterer) { clusterer.clearMarkers(); clusterer = null; }
    markers = [];

    // Csoportosítás helyszín szerint (ugyanolyan lat/lng = 1 marker)
    const byLocation = {};
    eventsToShow.forEach(e => {
        const key = `${e.lat},${e.lng}`;
        if (!byLocation[key]) byLocation[key] = [];
        byLocation[key].push(e);
    });

    Object.values(byLocation).forEach(events => {
        const { lat, lng } = events[0];
        const multi = events.length > 1;

        // 1 event → kék pin, több event → lila pin a darabszámmal
        const color = multi ? '#7c3aed' : '#3b82f6';
        const label = multi ? String(events.length) : '●';

        const marker = new google.maps.Marker({
            position: { lat, lng },
            icon: {
                url: makeMarkerSvg(color, label),
                scaledSize: new google.maps.Size(32, 42),
                anchor: new google.maps.Point(16, 42)
            }
        });

        marker.addListener('click', () => {
            infoWindow.setContent(multi ? buildMultiPopup(events) : buildSinglePopup(events[0]));
            infoWindow.open(map, marker);
        });

        markers.push({ marker });
    });

    // Custom cluster megjelenés: kék kör SVG-vel
    const renderer = {
        render: ({ count, position }) => new google.maps.Marker({
            position,
            icon: {
                url: makeClusterSvg(count),
                scaledSize: new google.maps.Size(50, 50),
                anchor: new google.maps.Point(25, 25)
            },
            zIndex: 1000
        })
    };

    // @googlemaps/markerclusterer külső library – unpkg CDN-ről töltjük be a HTML-ben
    // GridAlgorithm: pixel-alapú négyzetráccsal dönti el mikor vonjon össze markereket
    // gridSize: 65px – minél nagyobb, annál több markert von össze egy clusterbe
    clusterer = new markerClusterer.MarkerClusterer({
        map,
        markers: markers.map(m => m.marker),
        renderer,
        algorithm: new markerClusterer.GridAlgorithm({ gridSize: 65 })
    });

    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(m => bounds.extend(m.marker.getPosition()));
        map.fitBounds(bounds);
    }
}

function buildSinglePopup(e) {
    return `<div class="map-popup-content">
        <h3 class="popup-title">${e.name}</h3>
        <p class="popup-location">📍 ${e.helyszin}</p>
        <p class="popup-date">🗓 ${e.dates.join(' • ')}</p>
        <p class="popup-category">🏷 ${e.category}</p>
        <button class="popup-btn" onclick="infoWindow.close(); openEventModal(${e.id})">Részletek</button>
    </div>`;
}

function buildMultiPopup(events) {
    const items = events.map(e => `
        <div class="popup-multi-item">
            <div class="popup-multi-info">
                <span class="popup-multi-name">${e.name}</span>
                <span class="popup-multi-date">${e.dates[0]}${e.dates.length > 1 ? ` (+${e.dates.length - 1})` : ''}</span>
            </div>
            <button class="popup-mini-btn" onclick="infoWindow.close(); openEventModal(${e.id})">→</button>
        </div>`).join('');
    return `<div class="map-popup-content">
        <h3 class="popup-title">📍 ${events[0].helyszin}</h3>
        <p class="popup-subtitle">${events.length} esemény ezen a helyszínen</p>
        <div class="popup-multi-list">${items}</div>
    </div>`;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchBtn')?.addEventListener('click', performSearch);
    document.getElementById('searchInput')?.addEventListener('input', performSearch);
    document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    document.querySelectorAll('.category-checkbox').forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });
    document.getElementById('dateFrom')?.addEventListener('change', applyFilters);
    document.getElementById('dateTo')?.addEventListener('change', applyFilters);
    document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!searchTerm) {
        applyFilters();
        return;
    }
    const filteredEvents = allEvents.filter(evt =>
        evt.name.toLowerCase().includes(searchTerm) ||
        evt.helyszin.toLowerCase().includes(searchTerm) ||
        evt.category.toLowerCase().includes(searchTerm)
    );
    renderCards(filteredEvents);
    displayMarkers(filteredEvents);
}

function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const normalizeStr = str => (str || '').normalize('NFC').toLowerCase().trim();
    const checkedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
        .map(cb => normalizeStr(cb.value));
    const dateFrom = document.getElementById('dateFrom')?.value || '';
    const dateTo = document.getElementById('dateTo')?.value || '';

    let filteredEvents = allEvents;

    if (checkedCategories.length > 0) {
        filteredEvents = filteredEvents.filter(evt =>
            checkedCategories.includes(normalizeStr(evt.category))
        );
    } else {
        filteredEvents = [];
    }

    if (dateFrom || dateTo) {
        filteredEvents = filteredEvents.filter(evt =>
            evt.rawDates.some(d => {
                if (dateFrom && dateTo) return d >= dateFrom && d <= dateTo;
                if (dateFrom) return d >= dateFrom;
                return d <= dateTo;
            })
        );
    }

    if (searchTerm) {
        filteredEvents = filteredEvents.filter(evt =>
            evt.name.toLowerCase().includes(searchTerm) ||
            evt.helyszin.toLowerCase().includes(searchTerm) ||
            evt.category.toLowerCase().includes(searchTerm)
        );
    }

    renderCards(filteredEvents);
    displayMarkers(filteredEvents);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    const dateFromEl = document.getElementById('dateFrom');
    const dateToEl = document.getElementById('dateTo');
    if (dateFromEl) dateFromEl.value = '';
    if (dateToEl) dateToEl.value = '';
    document.querySelectorAll('.category-checkbox').forEach(cb => {
        cb.checked = true;
    });
    renderCards(allEvents);
    displayMarkers(allEvents);
    map.setCenter({ lat: 47.4979, lng: 19.0402 });
    map.setZoom(13);
}

// Helper function to get type label in Hungarian
function getTypeLabel(type) {
    const labels = {
        hivatalos: 'Hivatalos',
        kozossegi: 'Közösségi'
    };
    return labels[type] || type;
}

// Helper function to get category label in Hungarian
function getCategoryLabel(category) {
    return category;
}

// Hide default POIs (theaters, cinemas, malls, etc.) for light mode
function getHidePOIStyles() {
    return [
        {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.attraction',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.government',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.medical',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.place_of_worship',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.school',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.sports_complex',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.park',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'transit.station.airport',
            stylers: [{ visibility: 'off' }]
        }
    ];
}

// Dark mode styles for Google Maps
function getDarkModeStyles() {
    return [
        // Hide default POIs in dark mode too
        {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.attraction',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.government',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.medical',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.place_of_worship',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.school',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.sports_complex',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.park',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'transit.station.airport',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'transit.station',
            stylers: [{ visibility: 'off' }]
        },
        // Original dark mode styling
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
        },
        {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#263c3f' }]
        },
        {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#6b9a76' }]
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }]
        },
        {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }]
        },
        {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#746855' }]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#1f2835' }]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#f3d19c' }]
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#515c6d' }]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#17263c' }]
        }
    ];
}

// Update map theme when dark mode changes
function updateMapTheme() {
    if (map) {
        const isDark = document.body.classList.contains('dark-mode');
        map.setOptions({
            styles: isDark ? getDarkModeStyles() : getHidePOIStyles()
        });
    }
}

// Export for use in index.js if needed
window.mapFunctions = {
    updateMapTheme,
    applyFilters,
    resetFilters
};

const categoryHeroImages = {
    'koncert': '/api/categories/koncert.png',
    'fesztivál': '/api/categories/fesztival.png',
    'sport': '/api/categories/sport.png',
    'színház': '/api/categories/szinhaz.png',
    'komédia': '/api/categories/komedia.png',
    'vásár': '/api/categories/vasar.png',
    'workshop': '/api/categories/workshop.png'
};

window.openEventModal = function(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    const heroEl = document.getElementById('eventModalHero');
    const imageEl = document.getElementById('eventModalImage');
    const titleEl = document.getElementById('eventModalTitle');
    const categoryEl = document.getElementById('eventModalCategory');
    const locationEl = document.getElementById('eventModalLocation');
    const datesContainer = document.getElementById('eventModalDates');
    const modalEl = document.getElementById('eventModal');

    if (!heroEl || !imageEl || !titleEl || !categoryEl || !locationEl || !datesContainer || !modalEl) {
        window.location.href = `/felfedezes?eventId=${eventId}`;
        return;
    }

    heroEl.src = categoryHeroImages[event.category.toLowerCase()] || '/api/categories/default.png';
    imageEl.src = `/api/images/${event.id+214}`;
    titleEl.textContent = event.name;
    categoryEl.textContent = getCategoryLabel(event.category);
    locationEl.textContent = event.helyszin;

    const countEl = document.getElementById('eventModalParticipantCount');
    if (countEl) {
        fetch(`/api/events/${event.id}/participants/count`)
            .then(r => r.json())
            .then(data => { countEl.textContent = data.count; });
    }

    const descEl = document.getElementById('eventModalDescription');
    if (descEl) {
        // TODO: jelenleg a DB-ben az events.description mező üres (példa adatok)
        // Ha majd valódi leírás kerül be, automatikusan azt fogja mutatni
        descEl.textContent = event.description ||
            'A részletes leírás és jegyvásárlási lehetőség az esemény oldalán érhető el. Keresd fel a TicketSwap oldalt a jegyekért!';
    }

    datesContainer.innerHTML = event.dates.map((d, i) =>
        `<span class="date-chip ${i === 0 ? 'selected' : ''}" onclick="selectDateChip(this)">${d}</span>`
    ).join('');

    // Érdekel gomb státusz betöltése
    const btn = document.getElementById('interestedBtn');
    if (btn) {
        btn.dataset.eventId = event.id;
        btn.textContent = 'Érdekel';
        btn.disabled = false;
        btn.classList.remove('btn-joined');

        fetch(`/api/events/${event.id}/joined`)
            .then(r => r.json())
            .then(data => {
                if (data.joined) {
                    btn.textContent = '✓ Jelentkeztem';
                    btn.disabled = true;
                    btn.classList.add('btn-joined');
                }
            });
    }

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
};

async function handleInterested() {
    const btn = document.getElementById('interestedBtn');
    const eventId = btn.dataset.eventId;

    const response = await fetch(`/api/events/${eventId}/join`, { method: 'POST' });
    const data = await response.json();

    if (response.status === 401) {
        bootstrap.Modal.getInstance(document.getElementById('eventModal'))?.hide();
        new bootstrap.Modal(document.getElementById('loginModal')).show();
        return;
    }

    if (response.ok) {
        btn.textContent = '✓ Jelentkeztem';
        btn.disabled = true;
        btn.classList.add('btn-joined');
    } else {
        alert(data.message);
    }
}

function selectDateChip(el) {
    el.closest('.date-chips').querySelectorAll('.date-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}