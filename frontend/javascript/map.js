// Térkép állapot változók
let map;
let markers = [];
let infoWindow;
let clusterer = null;
let allEvents = [];

// Események csoportosítása cím + helyszín alapján (több dátum = 1 csoport)
function groupEvents(data) {
    const groups = {};
    data.forEach(e => {
        const key = `${e.title}_${e.location_id}`;
        if (!groups[key]) {
            groups[key] = { ...e, dates: [e.date], ids: [e.id] };
        } else {
            groups[key].dates.push(e.date);
            groups[key].ids.push(e.id);
        }
    });
    return Object.values(groups);
}

// Esemény adatok normalizálása frontend formátumra
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
        rawDates: e.dates,
        rawIds: e.ids || [e.id],
        link: e.link || null,
        description: e.description || null
    };
}

// Dátum + idő formázása: "2026-06-11T12:00:00" → "2026. 06. 11. 12:00"
function formatDate(dateStr) {
    const [datePart, timePart] = dateStr.split('T');
    const date = datePart.replace('-', '. ').replace('-', '. ') + '.';
    const time = timePart ? timePart.substring(0, 5) : null;
    return time && time !== '00:00' ? `${date} ${time}` : date;
}

// Google Maps API betöltése a backendről lekért API kulccsal
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

// Térkép inicializálása a #mapDisplay elembe
function initializeMap() {
    const mapDisplay = document.getElementById('mapDisplay');
    if (!mapDisplay) return;

    map = new google.maps.Map(mapDisplay, {
        center: { lat: 47.4979, lng: 19.0402 },
        zoom: 13,
        streetViewControl: false,
        styles: document.body.classList.contains('dark-mode') ? getDarkModeStyles() : getHidePOIStyles()
    });

    infoWindow = new google.maps.InfoWindow();
}

// Pin marker SVG – 1 event: kék, több event: lila + szám
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

// Cluster SVG – kék kör a darabszámmal
function makeClusterSvg(count) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44">
        <circle cx="22" cy="22" r="20" fill="#3b82f6" stroke="white" stroke-width="3"/>
        <text x="22" y="27" text-anchor="middle" fill="white"
              font-size="14" font-weight="bold">${count > 99 ? '99+' : count}</text>
    </svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// Markerek kirajzolása a térképre – helyszín szerint csoportosítva
function displayMarkers(eventsToShow) {
    if (!map) return;

    if (clusterer) { clusterer.clearMarkers(); clusterer = null; }
    markers = [];

    // Ugyanolyan lat/lng = 1 marker (több esemény ugyanazon helyszínen)
    const byLocation = {};
    eventsToShow.forEach(e => {
        const key = `${e.lat},${e.lng}`;
        if (!byLocation[key]) byLocation[key] = [];
        byLocation[key].push(e);
    });

    Object.values(byLocation).forEach(events => {
        const { lat, lng } = events[0];
        const multi = events.length > 1;
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

// Egyedi esemény popup tartalma
function buildSinglePopup(e) {
    return `<div class="map-popup-content">
        <h3 class="popup-title">${e.name}</h3>
        <p class="popup-location">📍 ${e.helyszin}</p>
        <p class="popup-date">🗓 ${e.dates.join(' • ')}</p>
        <p class="popup-category">🏷 ${e.category}</p>
        <button class="popup-btn" onclick="infoWindow.close(); openEventModal(${e.id})">Részletek</button>
    </div>`;
}

// Több esemény popup – helyszín listával
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

// Térkép téma frissítése dark mode váltáskor
function updateMapTheme() {
    if (map) {
        map.setOptions({
            styles: document.body.classList.contains('dark-mode') ? getDarkModeStyles() : getHidePOIStyles()
        });
    }
}

// Világos mód: alap POI-k elrejtése
function getHidePOIStyles() {
    return [
        { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.attraction', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.government', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.place_of_worship', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.school', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.park', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit.station.airport', stylers: [{ visibility: 'off' }] }
    ];
}

// Sötét mód stílusok
function getDarkModeStyles() {
    return [
        { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.attraction', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.government', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.place_of_worship', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.school', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.park', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit.station.airport', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit.station', stylers: [{ visibility: 'off' }] },
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
        { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
        { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
        { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
        { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
        { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
        { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }
    ];
}

// Kategória → hero kép mapelés
const categoryHeroImages = {
    'koncert': '/api/categories/koncert.png',
    'fesztivál': '/api/categories/fesztival.png',
    'sport': '/api/categories/sport.png',
    'színház': '/api/categories/szinhaz.png',
    'komédia': '/api/categories/komedia.png',
    'vásár': '/api/categories/vasar.png',
    'workshop': '/api/categories/workshop.png'
};

// Esemény modal megnyitása – ha nincs modal az oldalon (home), átirányít felfedezésre
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
    imageEl.src = `/api/images/${event.id}`;

    const ticketBtn = document.getElementById('ticketswapBtn');
    if (ticketBtn) {
        if (event.link) {
            ticketBtn.href = event.link;
            ticketBtn.style.display = '';
        } else {
            ticketBtn.style.display = 'none';
        }
    }

    titleEl.textContent = event.name;
    categoryEl.textContent = event.category;
    locationEl.textContent = event.helyszin;

    const navigateBtn = document.getElementById('navigateBtn');
    if (navigateBtn) {
        navigateBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`;
    }

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
        `<span class="date-chip ${i === 0 ? 'selected' : ''}" data-event-id="${event.rawIds[i]}" onclick="selectDateChip(this)">${d}</span>`
    ).join('');

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

    new bootstrap.Modal(modalEl).show();
};

// Érdekel gomb kezelése – belép az eseményre, frissíti a számlálót
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
        const countEl = document.getElementById('eventModalParticipantCount');
        if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
    } else {
        alert(data.message);
    }
}

// Dátum chip váltás – frissíti a résztvevő számot és az Érdekel gombot az adott időpontra
function selectDateChip(el) {
    el.closest('.date-chips').querySelectorAll('.date-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');

    const eventId = el.dataset.eventId;

    fetch(`/api/events/${eventId}/participants/count`)
        .then(r => r.json())
        .then(data => { document.getElementById('eventModalParticipantCount').textContent = data.count; });

    const btn = document.getElementById('interestedBtn');
    if (btn) {
        btn.dataset.eventId = eventId;
        fetch(`/api/events/${eventId}/joined`)
            .then(r => r.json())
            .then(data => {
                if (data.joined) {
                    btn.textContent = '✓ Jelentkeztem';
                    btn.disabled = true;
                    btn.classList.add('btn-joined');
                } else {
                    btn.textContent = 'Érdekel';
                    btn.disabled = false;
                    btn.classList.remove('btn-joined');
                }
            });
    }
}

// updateMapTheme exportálása index.js számára (dark mode váltáskor hívja)
window.mapFunctions = { updateMapTheme };

// Térkép inicializálása – csak a főoldalon fut
// Ha felfedezes.js is betöltve van, az kezeli az inicializálást
document.addEventListener('DOMContentLoaded', async function() {
    if (!document.getElementById('mapDisplay')) return;
    if (document.getElementById('discoverevents')) return; // felfedezes.js kezeli
    await loadGoogleMapsAPI();
    initializeMap();
});
