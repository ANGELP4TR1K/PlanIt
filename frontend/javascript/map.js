document.addEventListener('DOMContentLoaded', async function() {
    await loadGoogleMapsAPI();
    initializeMap();
    setupEventListeners();
});

let map;
let markers = [];
let infoWindow;

const events = [
    {
        id: 1,
        name: "Budapesti Tavaszi Fesztivál",
        lat: 47.5029,
        lng: 19.0584,
        type: "hivatalos",
        category: "koncert",
        description: "Nemzetközi művészeti fesztivál klasszikus zenével",
        date: "2026.03.15"
    },
    {
        id: 2,
        name: "Parkfutás a Városligetben",
        lat: 47.5138,
        lng: 19.0832,
        type: "kozossegi",
        category: "sport",
        description: "Közösségi futóesemény minden szintű futó számára",
        date: "2026.02.10"
    },
    {
        id: 3,
        name: "Modern Magyar Művészet",
        lat: 47.5175,
        lng: 19.0763,
        type: "hivatalos",
        category: "kiallitas",
        description: "Kortárs magyar művészek gyűjteményes kiállítása",
        date: "2026.02.05 - 04.20"
    },
    {
        id: 4,
        name: "Közösségi Kézműves Vásár",
        lat: 47.5082,
        lng: 19.0702,
        type: "kozossegi",
        category: "vasar",
        description: "Helyi kézműves termékek és design tárgyak",
        date: "2026.02.08"
    },
    {
        id: 5,
        name: "Shakespeare: Hamlet",
        lat: 47.5147,
        lng: 19.0822,
        type: "hivatalos",
        category: "szinhaz",
        description: "Klasszikus dráma modern rendezésben",
        date: "2026.02.12"
    },
    {
        id: 6,
        name: "Fotózási Workshop",
        lat: 47.4979,
        lng: 19.0402,
        type: "kozossegi",
        category: "workshop",
        description: "Kezdő fotósoknak szóló gyakorlati workshop",
        date: "2026.02.15"
    },
    {
        id: 7,
        name: "Rock Koncert a Parkban",
        lat: 47.5200,
        lng: 19.0900,
        type: "kozossegi",
        category: "koncert",
        description: "Helyi zenekarok szabadtéri koncertje",
        date: "2026.03.01"
    },
    {
        id: 8,
        name: "Kosárlabda Bajnokság",
        lat: 47.4850,
        lng: 19.0550,
        type: "hivatalos",
        category: "sport",
        description: "Nemzeti kosárlabda bajnokság döntője",
        date: "2026.02.20"
    }
];

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
    const defaultCenter = { lat: 47.4979, lng: 19.0402 };
    const defaultZoom = 13;

    map = new google.maps.Map(document.getElementById('mapDisplay'), {
        center: defaultCenter,
        zoom: defaultZoom,
        styles: document.body.classList.contains('dark-mode') ? getDarkModeStyles() : getHidePOIStyles()
    });

    // Create info window
    infoWindow = new google.maps.InfoWindow();

    // Add all markers
    displayMarkers(events);
}

// Display markers on map
function displayMarkers(eventsToShow) {
    // Clear existing markers
    markers.forEach(m => m.marker.setMap(null));
    markers = [];

    // Marker colors based on type
    const markerColors = {
        hivatalos: '#0004ff',
        kozossegi: '#ff0000'
    };

    // Add markers for each event
    eventsToShow.forEach(event => {
        const markerColor = markerColors[event.type] || '#5d5fef';
        
        const marker = new google.maps.Marker({
            position: { lat: event.lat, lng: event.lng },
            map: map,
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
                        <p class="popup-date"><svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z"/></svg> ${event.date}</p>
                        <p class="popup-type"><svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="M120-120v-80l80-80v160h-80Zm160 0v-240l80-80v320h-80Zm160 0v-320l80 81v239h-80Zm160 0v-239l80-80v319h-80Zm160 0v-400l80-80v480h-80ZM120-327v-113l280-280 160 160 280-280v113L560-447 400-607 120-327Z"/></svg> ${getTypeLabel(event.type)}</p>
                        <p class="popup-category"><svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="m260-520 220-360 220 360H260ZM700-80q-75 0-127.5-52.5T520-260q0-75 52.5-127.5T700-440q75 0 127.5 52.5T880-260q0 75-52.5 127.5T700-80Zm-580-20v-320h320v320H120Z"/></svg> ${getCategoryLabel(event.category)}</p>
                        <p class="popup-description">${event.description}</p>
                    </div>
                    <button class="popup-btn" onclick="openEventModal(${event.id})">Érdekel</button>
                </div>
            `;
            infoWindow.setContent(contentString);
            infoWindow.open(map, marker);
        });

        markers.push({ marker, event });
    });

    // Fit bounds to show all markers
    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(m => bounds.extend(m.marker.getPosition()));
        map.fitBounds(bounds);
    }
}

// Setup event listeners
function setupEventListeners() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const resetFiltersBtn = document.getElementById('resetFilters');

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
        // Real-time search as user types
        searchInput.addEventListener('input', performSearch);

        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Filter changes
    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilters);
    }

    // Category checkboxes
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    // Reset filters
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
}

// Perform search
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        applyFilters();
        return;
    }

    const filteredEvents = events.filter(evt => 
        evt.name.toLowerCase().includes(searchTerm) ||
        evt.description.toLowerCase().includes(searchTerm) ||
        getTypeLabel(evt.type).toLowerCase().includes(searchTerm) ||
        getCategoryLabel(evt.category).toLowerCase().includes(searchTerm)
    );

    displayMarkers(filteredEvents);
}

// Apply filters
function applyFilters() {
    const typeFilter = document.getElementById('typeFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    // Get checked categories
    const checkedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
        .map(cb => cb.value);

    let filteredEvents = events;

    // Apply type filter
    if (typeFilter !== 'all') {
        filteredEvents = filteredEvents.filter(evt => evt.type === typeFilter);
    }

    // Apply category filter - only show events with checked categories
    if (checkedCategories.length > 0) {
        filteredEvents = filteredEvents.filter(evt => checkedCategories.includes(evt.category));
    } else {
        // If no categories are checked, show nothing
        filteredEvents = [];
    }

    // Apply search term if exists
    if (searchTerm) {
        filteredEvents = filteredEvents.filter(evt => 
            evt.name.toLowerCase().includes(searchTerm) ||
            evt.description.toLowerCase().includes(searchTerm)
        );
    }

    displayMarkers(filteredEvents);
}

// Reset all filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('typeFilter').value = 'all';
    
    // Check all category checkboxes
    document.querySelectorAll('.category-checkbox').forEach(cb => {
        cb.checked = true;
    });
    
    displayMarkers(events);
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
    const labels = {
        koncert: 'Koncert',
        sport: 'Sport',
        kiallitas: 'Kiállítás',
        szinhaz: 'Színház',
        workshop: 'Workshop',
        vasar: 'Vásár'
    };
    return labels[category] || category;
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

// Open event details modal
window.openEventModal = function(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Populate modal content
    document.getElementById('eventModalTitle').textContent = event.name;
    document.getElementById('eventModalDate').textContent = event.date;
    document.getElementById('eventModalType').textContent = getTypeLabel(event.type);
    document.getElementById('eventModalCategory').textContent = getCategoryLabel(event.category);
    document.getElementById('eventModalDescription').textContent = event.description;
    
    // Show additional details
    document.getElementById('eventModalLocation').textContent = 'Budapest';
    document.getElementById('eventModalOrganizer').textContent = event.type === 'hivatalos' ? 'Hivatalos Szervező' : 'Közösségi Szervező';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
};