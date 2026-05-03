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

function formatDate(dateStr) {
    const [datePart, timePart] = dateStr.split('T');
    const date = datePart.replace('-', '. ').replace('-', '. ') + '.';
    const time = timePart ? timePart.substring(0, 5) : null;
    return time && time !== '00:00' ? `${date} ${time}` : date;
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
            card.className = 'card event-card';
            card.innerHTML = `
                <img src="/api/images/${event.id}" alt="${event.title}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${event.title}</h5>
                    <p class="card-text text-muted">${event.helyszin} – ${dateText}</p>
                    <a href="/felfedezes?eventId=${event.id}" class="btn btn-primary btn-sm">Részletek</a>
                </div>
            `;
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
