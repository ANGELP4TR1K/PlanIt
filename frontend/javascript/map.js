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

// Display markers on map
function displayMarkers(eventsToShow) {
    if (!map) return;

    if (clusterer) {
        clusterer.clearMarkers();
        clusterer = null;
    }
    markers = [];

    const markerColors = {
        hivatalos: '#0004ff',
        kozossegi: '#ff0000'
    };

    eventsToShow.forEach(event => {
        const markerColor = markerColors[event.type] || '#5d5fef';

        const marker = new google.maps.Marker({
            position: { lat: event.lat, lng: event.lng },
            title: event.name,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: markerColor,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
            }
        });

        marker.addListener('click', () => {
            const contentString = `
                <div class="map-popup-content">
                    <h3 class="popup-title">${event.name}</h3>
                    <div class="popup-details">
                        <p class="popup-date"><svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z"/></svg> ${event.dates.join(' • ')}</p>
                        <p class="popup-type"><svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="M120-120v-80l80-80v160h-80Zm160 0v-240l80-80v320h-80Zm160 0v-320l80 81v239h-80Zm160 0v-239l80-80v319h-80Zm160 0v-400l80-80v480h-80ZM120-327v-113l280-280 160 160 280-280v113L560-447 400-607 120-327Z"/></svg> ${getTypeLabel(event.type)}</p>
                        <p class="popup-category"><svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="m260-520 220-360 220 360H260ZM700-80q-75 0-127.5-52.5T520-260q0-75 52.5-127.5T700-440q75 0 127.5 52.5T880-260q0 75-52.5 127.5T700-80Zm-580-20v-320h320v320H120Z"/></svg> ${getCategoryLabel(event.category)}</p>
                        <p class="popup-description">${event.helyszin}</p>
                    </div>
                    <button class="popup-btn" onclick="openEventModal(${event.id})">Érdekel</button>
                </div>
            `;
            infoWindow.setContent(contentString);
            infoWindow.open(map, marker);
        });

        markers.push({ marker, event });
    });

    clusterer = new markerClusterer.MarkerClusterer({ map, markers: markers.map(m => m.marker) });

    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(m => bounds.extend(m.marker.getPosition()));
        map.fitBounds(bounds);
    }
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

    if (!heroEl || !imageEl || !titleEl || !categoryEl || !locationEl || !datesContainer || !modalEl) return;

    heroEl.src = categoryHeroImages[event.category.toLowerCase()] || '/api/categories/default.png';
    imageEl.src = `/api/images/${event.id+214}`;
    titleEl.textContent = event.name;
    categoryEl.textContent = getCategoryLabel(event.category);
    locationEl.textContent = event.helyszin;

    datesContainer.innerHTML = event.dates.map((d, i) =>
        `<span class="date-chip ${i === 0 ? 'selected' : ''}" onclick="selectDateChip(this)">${d}</span>`
    ).join('');

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
};

function selectDateChip(el) {
    el.closest('.date-chips').querySelectorAll('.date-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}