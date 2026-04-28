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

function formatDate(dateStr) {
    return dateStr.split('T')[0].replace('-', '. ').replace('-', '. ') + '.';
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

async function fetchHomeEvents() {
    try {
        const response = await fetch('/api/events');
        const data = await response.json();
        const container = document.getElementById('homeEvents');

        const budapest = { lat: 47.4979, lng: 19.0402 };

        const events = groupEvents(data).map(event => ({
            ...event,
            distance: calculateDistance(budapest.lat, budapest.lng, parseFloat(event.latitude), parseFloat(event.longitude))
        }));

        events.sort((a, b) => a.distance - b.distance);
        const closest20 = events.slice(0, 20);

        closest20.forEach(event => {
            const dateText = event.dates.length > 1
                ? `${formatDate(event.dates[0])} (+${event.dates.length - 1} időpont)`
                : formatDate(event.dates[0]);
            const card = document.createElement('div');
            card.className = 'card event-card';
            card.innerHTML = `
                <img src="/api/images/${event.id+214}" alt="${event.title}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${event.title}</h5>
                    <p class="card-text text-muted">${event.helyszin} – ${dateText}</p>
                    <a href="/felfedezes?eventId=${event.id}" class="btn btn-primary btn-sm">Részletek</a>
                </div>
            `;
            container.appendChild(card);
        });

        setupScrollArrows();
    } catch (error) {
        console.error('Nem sikerült betölteni az eseményeket:', error);
    }
}

function setupScrollArrows() {
    const wrapper = document.getElementById('homeEvents');
    if (!wrapper) return;

    const leftBtn = document.getElementById('homeScrollLeft');
    const rightBtn = document.getElementById('homeScrollRight');

    if (leftBtn) {
        leftBtn.addEventListener('click', () => {
            wrapper.scrollBy({ left: -300, behavior: 'smooth' });
        });
    }

    if (rightBtn) {
        rightBtn.addEventListener('click', () => {
            wrapper.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
}

fetchHomeEvents();
