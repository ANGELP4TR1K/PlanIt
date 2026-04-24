async function fetchHomeEvents() {
    try {
        const response = await fetch('/api/events');
        const data = await response.json();
        const container = document.getElementById('homeEvents');
        data.forEach(event => {
            const card = document.createElement('div');
            card.className = 'card event-card';
            card.innerHTML = `
                <img src="/api/images/${event.id+214}" alt="${event.title}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${event.title}</h5>
                    <p class="card-text text-muted">${event.helyszin} – ${formatDate(event.date)}</p>
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