async function fetchHomeEvents() {
    try {
        const response = await fetch('/api/events');
        const data = await response.json();
        const container = document.getElementById('homeEvents');
        groupEvents(data).forEach(event => {
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
                    <a href="/felfedezes" class="btn btn-primary btn-sm">Részletek</a>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Nem sikerült betölteni az eseményeket:', error);
    }
}

fetchHomeEvents();
