let allLocations = [];
let editingEventId = null;
let deletingEventId = null;

document.addEventListener('DOMContentLoaded', async function () {
    const session = await userRole();
    if (session && (session.role === 'szervezo' || session.role === 'admin')) {
        await fetchUserCreatedEvents();
        setupForm();
        setupImagePreview();
        setupLocationAutocomplete();
        setupDeleteModal();
    } 
    else{
        showAuthError();
    } 
});

async function userRole() {
    try {
        const response = await fetch('/api/userRole', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return data.session ? { authenticated: true, role: data.role } : null;
    } catch (error) {
        console.error('Session check error:', error);
        return null;
    }
}

async function fetchUserCreatedEvents() {
    try {
        const response = await fetch('/api/userCreatedEvents', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (response.ok && data.events && data.events.length > 0) {
            displayCreatedEvents(data.events);
            document.getElementById('createdEventsSection').style.display = 'block';
        } else {
            showNoEventsMessage();
        }
    } catch (error) {
        console.error('Error fetching created events:', error);
    }
}

function displayCreatedEvents(events) {
    const eventsList = document.getElementById('createdEventsList');
    eventsList.innerHTML = '';

    events.forEach(event => {
        const imageId = event.id + 214;

        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';

        const img = document.createElement('img');
        img.alt = event.title;
        img.className = 'event-card-image';

        let extensionIndex = 0;
        const extensions = ['.jpg', '.png'];

        function loadImage() {
            if (extensionIndex < extensions.length) {
                img.src = `/uploads/eventImages/${imageId}${extensions[extensionIndex]}`;
                extensionIndex++;
            } else {
                img.style.display = 'none';
            }
        }

        img.onerror = () => {
            loadImage();
        };

        loadImage();

        const content = document.createElement('div');
        content.className = 'event-card-content';

        const title = document.createElement('h3');
        title.className = 'event-card-title';
        title.textContent = event.title;

        const category = document.createElement('span');
        category.className = 'event-card-category';
        category.textContent = event.category;

        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const dateDiv = document.createElement('div');
        dateDiv.className = 'event-card-date';
        dateDiv.textContent = '📅 ' + formattedDate;

        const description = document.createElement('div');
        description.className = 'event-card-description';
        description.textContent = event.description;

        content.appendChild(title);
        content.appendChild(category);
        content.appendChild(dateDiv);

        if (event.location) {
            const locationDiv = document.createElement('div');
            locationDiv.className = 'event-card-location';
            locationDiv.textContent = '📍 ' + event.location;
            content.appendChild(locationDiv);
        }

        content.appendChild(description);
        eventCard.appendChild(img);
        eventCard.appendChild(content);

        eventCard.style.cursor = 'pointer';
        eventCard.addEventListener('click', () => {
            editEvent(event);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'event-delete-btn';
        deleteBtn.type = 'button';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Esemény törlése';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deletingEventId = event.id;
            const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
            modal.show();
        });

        eventCard.appendChild(deleteBtn);
        eventsList.appendChild(eventCard);
    });
}

function showNoEventsMessage() {
    const eventsList = document.getElementById('createdEventsList');
    eventsList.innerHTML = '';
    const noEvents = document.createElement('div');
    noEvents.className = 'no-events';
    noEvents.textContent = 'Még nem hoztál létre eseményt.';
    eventsList.appendChild(noEvents);
    document.getElementById('createdEventsSection').style.display = 'block';
}

function editEvent(event) {
    editingEventId = event.id;

    document.getElementById('title').value = event.title;
    document.getElementById('description').value = event.description;
    document.getElementById('category').value = event.category;
    document.getElementById('locationInput').value = event.location || '';
    document.getElementById('selectedLocationId').value = event.location_id || '';

    const dateStr = event.date.includes('T') ? event.date : event.date.replace(' ', 'T');
    const dateObj = new Date(dateStr);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    document.getElementById('date').value = `${year}-${month}-${day}T${hours}:${minutes}`;

    document.getElementById('newLocationFields').style.display = 'none';
    clearNewLocationFields();

    document.getElementById('formTitle').textContent = 'Esemény szerkesztése';
    document.getElementById('formSubtitle').textContent = 'Módosítsd az esemény adatait';

    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.textContent = 'Esemény frissítése';

    if (!document.getElementById('cancelBtn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancelBtn';
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn-cancel';
        cancelBtn.textContent = 'Mégse';
        cancelBtn.addEventListener('click', cancelEdit);
        document.querySelector('.form-actions').appendChild(cancelBtn);
    }

    window.scrollTo({ top: document.getElementById('createEventForm').offsetTop, behavior: 'smooth' });
}

function cancelEdit() {
    editingEventId = null;
    resetForm();
    document.getElementById('formTitle').textContent = 'Új hivatalos esemény létrehozása';
    document.getElementById('formSubtitle').textContent = 'Tölts ki az összes kötelező mezőt az esemény létrehozásához';
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.textContent = 'Esemény létrehozása';
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.remove();
    }
}

async function deleteEvent(eventId) {
    try {
        const response = await fetch(`/api/deleteOfficialEvent/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            showNotification(data.message || 'Hiba az esemény törlése során.', 'error');
            return;
        }

        showNotification('Esemény sikeresen törölve!', 'success');
        editingEventId = null;
        resetForm();
        document.getElementById('formTitle').textContent = 'Új hivatalos esemény létrehozása';
        document.getElementById('formSubtitle').textContent = 'Tölts ki az összes kötelező mezőt az esemény létrehozásához';
        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.textContent = 'Esemény létrehozása';
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.remove();
        }
        await fetchUserCreatedEvents();

    } catch (error) {
        console.error('Error deleting event:', error);
        showNotification('Hálózati hiba az esemény törlése során.', 'error');
    }
}

function showAuthError() {
    document.getElementById('createEventForm').style.display = 'none';
    document.getElementById('authError').style.display = 'flex';
}

async function setupLocationAutocomplete() {
    try {
        const response = await fetch('/api/locations');
        const data = await response.json();
        allLocations = data.locations || [];
    } catch (error) {
        console.error('Error fetching locations:', error);
    }

    const locationInput = document.getElementById('locationInput');
    const locationDropdown = document.getElementById('locationDropdown');
    const newLocationFields = document.getElementById('newLocationFields');
    const selectedLocationId = document.getElementById('selectedLocationId');

    locationInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();

        if (query.length === 0) {
            locationDropdown.style.display = 'none';
            return;
        }

        const filtered = allLocations.filter(loc =>
            loc.name.toLowerCase().includes(query)
        );

        locationDropdown.innerHTML = '';

        if (filtered.length > 0) {
            filtered.forEach(location => {
                const item = document.createElement('div');
                item.className = 'location-item';
                item.textContent = location.name;
                item.addEventListener('click', () => selectLocation(location.id, location.name));
                locationDropdown.appendChild(item);
            });
        }

        const newItem = document.createElement('div');
        newItem.className = 'location-item location-item-new';
        newItem.textContent = `"${query}" - Új helyszín létrehozása`;
        newItem.addEventListener('click', () => createNewLocation(query));
        locationDropdown.appendChild(newItem);

        locationDropdown.style.display = 'block';
    });

    document.addEventListener('click', function(e) {
        if (e.target !== locationInput && !locationDropdown.contains(e.target)) {
            locationDropdown.style.display = 'none';
        }
    });

    function selectLocation(locId, locName) {
        locationInput.value = locName;
        selectedLocationId.value = locId;
        newLocationFields.style.display = 'none';
        locationDropdown.style.display = 'none';
        clearNewLocationFields();
    }

    function createNewLocation(name) {
        locationInput.value = name;
        selectedLocationId.value = '';
        newLocationFields.style.display = 'block';
        locationDropdown.style.display = 'none';
    }
}

function clearNewLocationFields() {
    document.getElementById('locationName').value = '';
    document.getElementById('zipCode').value = '';
    document.getElementById('city').value = '';
    document.getElementById('street').value = '';
    document.getElementById('houseNumber').value = '';
}

function setupDeleteModal() {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
            modal.hide();
            if (deletingEventId) {
                await deleteEvent(deletingEventId);
                deletingEventId = null;
            }
        });
    }
}

function setupForm() {
    const form = document.getElementById('eventForm');
    const createEventForm = document.getElementById('createEventForm');

    if (createEventForm) {
        createEventForm.style.display = 'block';
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitForm();
        });
    }
}

function setupImagePreview() {
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const removeImageBtn = document.getElementById('removeImageBtn');

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    imagePreview.src = event.target.result;
                    imagePreviewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            imageInput.value = '';
            imagePreviewContainer.style.display = 'none';
            imagePreview.src = '';
        });
    }
}

async function submitForm() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const locationInput = document.getElementById('locationInput').value;
    const selectedLocationId = document.getElementById('selectedLocationId').value;
    const date = document.getElementById('date').value;
    const imageInput = document.getElementById('image');
    const formError = document.getElementById('formError');

    formError.style.display = 'none';
    formError.textContent = '';

    if (!title || !description || !category || !locationInput || !date) {
        showFormError('Tölts ki az összes kötelező mezőt!');
        return;
    }

    if (!selectedLocationId) {
        const locationName = document.getElementById('locationName').value;
        const zipCode = document.getElementById('zipCode').value;
        const city = document.getElementById('city').value;
        const street = document.getElementById('street').value;
        const houseNumber = document.getElementById('houseNumber').value;

        if (!locationName || !zipCode || !city || !street || !houseNumber) {
            showFormError('Tölts ki az összes helyszín adatot vagy válassz egy meglévő helyszínt!');
            return;
        }
    }

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('date', date);

        if (selectedLocationId) {
            formData.append('locationId', selectedLocationId);
        } else {
            formData.append('locationName', document.getElementById('locationName').value);
            formData.append('zipCode', document.getElementById('zipCode').value);
            formData.append('city', document.getElementById('city').value);
            formData.append('street', document.getElementById('street').value);
            formData.append('houseNumber', document.getElementById('houseNumber').value);
        }

        if (imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }

        let endpoint = '/api/createOfficialEvent';
        let method = 'POST';

        if (editingEventId) {
            endpoint = `/api/updateOfficialEvent/${editingEventId}`;
            method = 'PUT';
        }

        const response = await fetch(endpoint, {
            method: method,
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = editingEventId ? 'Hiba az esemény frissítése során.' : 'Hiba az esemény létrehozása során.';
            showFormError(data.message || errorMsg);
            return;
        }

        const successMsg = editingEventId ? 'Esemény sikeresen frissítve!' : 'Esemény sikeresen létrehozva!';
        showNotification(successMsg, 'success');

        editingEventId = null;
        resetForm();
        document.getElementById('formTitle').textContent = 'Új hivatalos esemény létrehozása';
        document.getElementById('formSubtitle').textContent = 'Tölts ki az összes kötelező mezőt az esemény létrehozásához';
        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.textContent = 'Esemény létrehozása';
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.remove();
        }
        await fetchUserCreatedEvents();

    } catch (error) {
        console.error('Error submitting form:', error);
        showFormError('Hálózati hiba az esemény létrehozása során.');
    }
}

function showFormError(message) {
    const formError = document.getElementById('formError');
    formError.textContent = message;
    formError.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('eventForm').reset();
    document.getElementById('locationInput').value = '';
    document.getElementById('selectedLocationId').value = '';
    document.getElementById('newLocationFields').style.display = 'none';
    clearNewLocationFields();
    document.getElementById('image').value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imagePreview').src = '';
    document.getElementById('formError').style.display = 'none';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
