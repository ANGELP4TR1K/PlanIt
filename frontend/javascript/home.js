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

async function fetchHomeEvents() {
    try {
        const response = await fetch('/api/events');
        const data = await response.json();
        const container = document.getElementById('homeEvents');

        // Mai dátum (helyi idő szerint)
        const today = new Date().toISOString().split('T')[0];

        // Csak mai vagy jövőbeli események, dátum szerint rendezve, első 20
        const events = groupEvents(data)
            .filter(e => e.dates[0].split('T')[0] >= today);
        events.sort((a, b) => new Date(a.dates[0]) - new Date(b.dates[0]));
        const closest20 = events.slice(0, 20);

        closest20.forEach(event => {
            const dateText = event.dates.length > 1
                ? `${formatDate(event.dates[0])} (+${event.dates.length - 1} időpont)`
                : formatDate(event.dates[0]);

            const card = document.createElement('div');
            card.className = 'events-item';

            const img = document.createElement('img');
            img.src = `/api/images/${event.id}`;
            img.alt = event.title;
            img.className = 'events-item-img';
            img.onerror = function() { this.onerror = null; };
            card.appendChild(img);

            const body = document.createElement('div');
            body.className = 'events-item-body';

            const title = document.createElement('h3');
            title.className = 'events-item-title';
            title.textContent = event.title;
            body.appendChild(title);

            const info = document.createElement('div');
            info.className = 'events-item-info';

            const mkSvg = d => {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('height', '18px');
                svg.setAttribute('viewBox', '0 -960 960 960');
                svg.setAttribute('width', '18px');
                svg.setAttribute('fill', 'currentColor');
                const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                p.setAttribute('d', d);
                svg.appendChild(p);
                return svg;
            };

            const dateRow = document.createElement('div');
            dateRow.className = 'events-item-info-row';
            dateRow.appendChild(mkSvg('M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-40q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840v40h320v-40q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840v40h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z'));
            const dateSpan = document.createElement('span');
            dateSpan.textContent = dateText;
            dateRow.appendChild(dateSpan);
            info.appendChild(dateRow);

            const locationRow = document.createElement('div');
            locationRow.className = 'events-item-info-row';
            locationRow.appendChild(mkSvg('M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-71.5-178.5T480-800q-109 0-180.5 69.5T228-552q0 71 59 162.5T480-186Z'));
            const locationSpan = document.createElement('span');
            locationSpan.textContent = event.helyszin;
            locationRow.appendChild(locationSpan);
            info.appendChild(locationRow);

            body.appendChild(info);

            const badgeRow = document.createElement('div');
            badgeRow.className = 'events-item-badge-row';
            const typeBadge = document.createElement('span');
            const isPrivate = event.is_private == 1 || event.is_private === true;
            typeBadge.className = 'events-item-type events-item-type-' + (event.type === 'official' ? 'official' : isPrivate ? 'private' : 'community');
            typeBadge.textContent = event.type === 'official' ? 'Hivatalos' : isPrivate ? 'Privát' : 'Közösségi';
            badgeRow.appendChild(typeBadge);
            body.appendChild(badgeRow);

            const actions = document.createElement('div');
            actions.className = 'events-item-actions';
            const detailsBtn = document.createElement('a');
            detailsBtn.className = 'events-item-btn events-item-btn-primary';
            detailsBtn.href = `/felfedezes?eventId=${event.id}`;
            detailsBtn.textContent = 'Részletek';
            actions.appendChild(detailsBtn);
            body.appendChild(actions);

            card.appendChild(body);
            container.appendChild(card);
        });

        setupScrollArrows();

        // Normalizálás és térképre rakás (map.js normalizeEvent és displayMarkers)
        allEvents = closest20.map(normalizeEvent);
        displayMarkers(allEvents);

    } catch (error) {
        console.error('Nem sikerült betölteni az eseményeket:', error);
    }
}

function setupScrollArrows() {
    const wrapper = document.getElementById('homeEvents');
    if (!wrapper) return;

    const leftBtn = document.getElementById('homeScrollLeft');
    const rightBtn = document.getElementById('homeScrollRight');

    if (leftBtn) leftBtn.addEventListener('click', () => wrapper.scrollBy({ left: -300, behavior: 'smooth' }));
    if (rightBtn) rightBtn.addEventListener('click', () => wrapper.scrollBy({ left: 300, behavior: 'smooth' }));
}

// Térkép init + események betöltése – home oldal teljes inicializálása
document.addEventListener('DOMContentLoaded', async function() {
    await loadGoogleMapsAPI();
    initializeMap();
    await fetchHomeEvents();
});
