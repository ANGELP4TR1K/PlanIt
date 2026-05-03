document.addEventListener('DOMContentLoaded', async function () {
    if (window.location.pathname === '/profile') {
        if (await userSessionCheck())
        {
            await loadProfileData();
            setupProfileEventListeners();
        }
        else
        {
            showProfileAuthError();
        }
    }
});

function showNotification(message, type = 'success', duration = 3000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

function showProfileAuthError() {
    const errorContainer = document.querySelector('.auth-error-container');
    if (errorContainer) {
        errorContainer.classList.add('show');
    }

    const loginBtn = document.getElementById('authErrorLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const loginModalEl = document.getElementById('loginModal');
            const modal = new bootstrap.Modal(loginModalEl);
            modal.show();
            loginModal();
            registerModal();
        });
    }
}

async function loadProfileData() {
    try {
        const response = await fetch('/api/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Hiba a profil lekérésekor');
            return;
        }

        const userData = await response.json();

        // Display profile content
        document.getElementById('profileContent').style.display = 'block';

        // Display user data
        document.getElementById('displayUsername').textContent = userData.username;
        document.getElementById('displayFullName').textContent = userData.full_name;
        document.getElementById('displayEmail').textContent = userData.email;
        console.log(userData.created_at);
        // Display created date if available
        if (userData.created_at) {
            const createdDate = new Date(userData.created_at);
            const formattedDate = createdDate.toLocaleDateString('hu-HU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            document.getElementById('displayCreatedAt').textContent = formattedDate;
        }

        // Fill form fields
        document.getElementById('editUsername').value = userData.username;
        document.getElementById('editFullName').value = userData.full_name;

        // Store current user data for comparison
        window.currentUserData = userData;

    } catch (error) {
        console.error('Hiba a profil betöltésekor:', error);
    }
}

function setupProfileEventListeners() {
    // Username Edit
    const editUsernameBtn = document.getElementById('editUsernameBtn');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const usernameEditForm = document.getElementById('usernameEditForm');
    const cancelUsernameBtn = document.getElementById('cancelUsernameBtn');

    editUsernameBtn.addEventListener('click', () => {
        usernameDisplay.style.display = 'none';
        usernameEditForm.style.display = 'block';
        document.getElementById('editUsername').focus();
    });

    cancelUsernameBtn.addEventListener('click', () => {
        usernameDisplay.style.display = 'block';
        usernameEditForm.style.display = 'none';
    });

    usernameEditForm.addEventListener('submit', handleUsernameSubmit);

    // Full Name Edit
    const editFullNameBtn = document.getElementById('editFullNameBtn');
    const fullNameDisplay = document.getElementById('fullNameDisplay');
    const fullNameEditForm = document.getElementById('fullNameEditForm');
    const cancelFullNameBtn = document.getElementById('cancelFullNameBtn');

    editFullNameBtn.addEventListener('click', () => {
        fullNameDisplay.style.display = 'none';
        fullNameEditForm.style.display = 'block';
        document.getElementById('editFullName').focus();
    });

    cancelFullNameBtn.addEventListener('click', () => {
        fullNameDisplay.style.display = 'block';
        fullNameEditForm.style.display = 'none';
    });

    fullNameEditForm.addEventListener('submit', handleFullNameSubmit);

    // Password Change Form
    document.getElementById('passwordChangeForm').addEventListener('submit', handlePasswordChange);

    // Password visibility toggles
    showPassword();

    // Delete Profile Button
    const deleteProfileBtn = document.getElementById('deleteProfileBtn');
    if (deleteProfileBtn) {
        deleteProfileBtn.addEventListener('click', handleDeleteProfile);
    }

    // Create Event Button
    const createEventBtn = document.getElementById('createEventBtn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', () => {
            const modalEl = document.getElementById('createEventModal');
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        });
    }

    // Create Event Form
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', handleCreateEventSubmit);
    }

    // Join by code button
    const joinByCodeBtn = document.getElementById('joinByCodeBtn');
    if (joinByCodeBtn) {
        joinByCodeBtn.addEventListener('click', () => {
            const modalEl = document.getElementById('joinCodeModal');
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        });
    }

    const joinCodeForm = document.getElementById('joinCodeForm');
    if (joinCodeForm) joinCodeForm.addEventListener('submit', handleJoinByCodeSubmit);
}

async function handleUsernameSubmit(e) {
    e.preventDefault();

    const username = document.getElementById('editUsername').value;
    const errorDiv = document.getElementById('usernameEditError');

    if (!username || username.trim() === '') {
        errorDiv.classList.add('show');
        errorDiv.textContent = 'A felhasználónév nem lehet üres';
        return;
    }

    try {
        const response = await fetch('/api/usernameupdate', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                full_name: window.currentUserData.full_name,
                email: window.currentUserData.email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.classList.add('show');
            errorDiv.textContent = data.message || 'Hiba a felhasználónév frissítésekor';
            return;
        }

        // Update display
        document.getElementById('displayUsername').textContent = username;
        window.currentUserData.username = username;

        // Hide form, show display
        document.getElementById('usernameDisplay').style.display = 'block';
        document.getElementById('usernameEditForm').style.display = 'none';

        // Clear messages
        errorDiv.classList.remove('show');
        errorDiv.textContent = '';

        // Show success message
        showNotification('Felhasználónév sikeresen frissítve!', 'success');

    } catch (error) {
        console.error('Hiba:', error);
        errorDiv.classList.add('show');
        errorDiv.textContent = 'Hálózati hiba történt';
    }
}

async function handleFullNameSubmit(e) {
    e.preventDefault();

    const full_name = document.getElementById('editFullName').value;
    const errorDiv = document.getElementById('fullNameEditError');

    if (!full_name || full_name.trim() === '') {
        errorDiv.classList.add('show');
        errorDiv.textContent = 'A teljes név nem lehet üres';
        return;
    }

    try {
        const response = await fetch('/api/fullnameupdate', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: window.currentUserData.username,
                full_name,
                email: window.currentUserData.email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.classList.add('show');
            errorDiv.textContent = data.message || 'Hiba a teljes név frissítésekor';
            return;
        }

        // Update display
        document.getElementById('displayFullName').textContent = full_name;
        window.currentUserData.full_name = full_name;

        // Hide form, show display
        document.getElementById('fullNameDisplay').style.display = 'block';
        document.getElementById('fullNameEditForm').style.display = 'none';

        // Clear messages
        errorDiv.classList.remove('show');
        errorDiv.textContent = '';

        // Show success message
        showNotification('Teljes név sikeresen frissítve!', 'success');

    } catch (error) {
        console.error('Hiba:', error);
        errorDiv.classList.add('show');
        errorDiv.textContent = 'Hálózati hiba történt';
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();

    const current_password = document.getElementById('currentPassword').value;
    const new_password = document.getElementById('newPassword').value;
    const confirm_password = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('passwordChangeError');

    errorDiv.classList.remove('show');
    errorDiv.textContent = '';

    if (new_password !== confirm_password) {
        errorDiv.classList.add('show');
        errorDiv.textContent = 'Az új jelszavak nem egyeznek';
        return;
    }

    try {
        const response = await fetch('/api/passwordupdate', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ current_password, new_password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.classList.add('show');
            errorDiv.textContent = data.message || 'Hiba a jelszó frissítésekor';
            return;
        }

        // Clear form and show success
        document.getElementById('passwordChangeForm').reset();
        showNotification('Jelszó sikeresen frissítve!', 'success');

    } catch (error) {
        console.error('Hiba:', error);
        errorDiv.classList.add('show');
        errorDiv.textContent = 'Hálózati hiba történt';
    }
}


function handleDeleteProfile() {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteProfileModal'));
    deleteModal.show();

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.onclick = async () => {
        await performDeleteProfile(deleteModal);
    };
}

async function performDeleteProfile(modal) {
    const errorDiv = document.getElementById('deleteProfileError');
    errorDiv.classList.remove('show');

    try {
        const response = await fetch('/api/profile', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            modal.hide();
            errorDiv.classList.add('show');
            errorDiv.textContent = data.message || 'Hiba a profil törléskor';
            return;
        }

        // Profil sikeresen törölve - átirányítás
        showNotification('Profilod sikeresen törölve. Átirányítunk...', 'success', 2000);
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);

    } catch (error) {
        console.error('Hiba:', error);
        modal.hide();
        errorDiv.classList.add('show');
        errorDiv.textContent = 'Hálózati hiba történt';
    }
}

async function handleCreateEventSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('eventName').value.trim();
    const location = document.getElementById('eventLocation').value.trim();
    const max_capacity = parseInt(document.getElementById('eventMaxCapacity').value, 10);
    const date = document.getElementById('eventDateTime').value;
    const errorDiv = document.getElementById('createEventError');

    errorDiv.classList.remove('show');
    errorDiv.textContent = '';

    if (!name || !location || !date || !max_capacity || isNaN(max_capacity) || max_capacity < 1) {
        errorDiv.classList.add('show');
        errorDiv.textContent = 'Kérlek tölts ki minden mezőt helyesen.';
        return;
    }

    const payload = {
        name,
        location,
        date,
        max_capacity,
        created_by: window.currentUserData && window.currentUserData.id ? window.currentUserData.id : null
    };

    try {
        const response = await fetch('/api/createEventInvite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            errorDiv.classList.add('show');
            errorDiv.textContent = data.message || 'Hiba történt az esemény létrehozásakor.';
            return;
        }

        // close modal
        const modalEl = document.getElementById('createEventModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        // append to my events list with eventId and token (token is 10-digit code)
        appendEventToList({ name, location, date, max_capacity, eventId: data.eventId, token: data.token });

        // reset form
        document.getElementById('createEventForm').reset();

        showNotification('Esemény sikeresen létrehozva', 'success');

    } catch (err) {
        console.error(err);
        errorDiv.classList.add('show');
        errorDiv.textContent = 'Hálózati hiba történt.';
    }
}

function appendEventToList(event) {
    const list = document.getElementById('myEventsList');
    if (!list) return;

    const card = document.createElement('div');
    card.className = 'card mb-2';
    const inviteBtnHtml = event.token ? `<button class="btn btn-outline-primary btn-sm invite-btn" data-token="${event.token}" data-eventid="${event.eventId}">Meghívó küldése</button>` : '';
    card.innerHTML = `
        <div class="card-body d-flex justify-content-between align-items-start">
            <div>
                <h5 class="card-title">${escapeHtml(event.name)}</h5>
                <p class="card-text">Helyszín: ${escapeHtml(event.location)} — Kapacitás: ${event.max_capacity}</p>
                <p class="card-text"><small class="text-muted">${formatDateTime(event.date)}</small></p>
            </div>
            <div class="ms-3">
                ${inviteBtnHtml}
            </div>
        </div>
    `;
    list.prepend(card);

    // attach invite button handler
    if (event.token) {
        const btn = card.querySelector('.invite-btn');
        btn.addEventListener('click', () => {
            openInviteModal(event.token);
        });
    }
}

function appendJoinedEventToList(event) {
    const list = document.getElementById('joinedEventsList');
    if (!list) return;

    const card = document.createElement('div');
    card.className = 'card mb-2';
    card.innerHTML = `
        <div class="card-body d-flex justify-content-between align-items-start">
            <div>
                <h5 class="card-title">${escapeHtml(event.name)}</h5>
                <p class="card-text">Helyszín: ${escapeHtml(event.location)} — Kapacitás: ${event.max_capacity}</p>
                <p class="card-text"><small class="text-muted">${formatDateTime(event.date)}</small></p>
            </div>
            <div class="ms-3">
            </div>
        </div>
    `;
    list.prepend(card);
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"]+/g, function (s) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[s];
    });
}

function formatDateTime(value) {
    try {
        const d = new Date(value);
        return d.toLocaleString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return value;
    }
}

function openInviteModal(token) {
    const modalEl = document.getElementById('inviteModal');
    const modal = new bootstrap.Modal(modalEl);
    const codeInput = document.getElementById('inviteCodeInput');
    codeInput.value = token; // token is the 10-digit code
    modal.show();

    const copyBtn = document.getElementById('copyInviteBtn');
    copyBtn.onclick = async () => {
        try {
            await navigator.clipboard.writeText(codeInput.value);
            showNotification('Kód kimásolva a vágólapra', 'success');
        } catch (e) {
            showNotification('Másolás sikertelen', 'error');
        }
    };
}

async function handleJoinByCodeSubmit(e) {
    e.preventDefault();
    const code = document.getElementById('joinCodeInputField').value.trim();
    const preview = document.getElementById('joinCodePreview');
    const errorDiv = document.getElementById('joinCodeError');
    preview.textContent = '';
    errorDiv.textContent = '';
    if (!/^[0-9]{10}$/.test(code)) {
        errorDiv.textContent = 'Kérlek egy érvényes 10 jegyű kódot adj meg.';
        return;
    }

    try {
        const r = await fetch(`/api/invite/${code}`);
        const data = await r.json();
        if (!r.ok) {
            errorDiv.textContent = data.message || 'Meghívó nem található';
            return;
        }

        // show preview
        const invite = data.invite;
        preview.innerHTML = `<strong>${escapeHtml(invite.name)}</strong> — ${escapeHtml(invite.location)} — ${formatDateTime(invite.date)}`;

        // if logged in, attempt join
        if (await userSessionCheck()) {
            const joinRes = await fetch('/api/invite/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: code })
            });
            const jd = await joinRes.json();
            if (!joinRes.ok) {
                errorDiv.textContent = jd.message || 'Csatlakozás sikertelen';
                return;
            }

            // close modal and append event to Eseményeim (joined events)
            const modalEl = document.getElementById('joinCodeModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            appendJoinedEventToList({ name: invite.name, location: invite.location, date: invite.date, max_capacity: invite.max_capacity, eventId: invite.event_id, token: code });
            showNotification('Sikeresen csatlakoztál az eseményhez', 'success');
        } else {
            // not logged in -> show login
            const loginModalEl = document.getElementById('loginModal');
            const loginModal = new bootstrap.Modal(loginModalEl);
            loginModal.show();
            errorDiv.textContent = 'Előbb jelentkezz be, majd próbáld újra.';
        }

    } catch (err) {
        console.error(err);
        errorDiv.textContent = 'Hiba történt';
    }
}