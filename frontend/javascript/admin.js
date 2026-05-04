let allUsers = [];
let allEvents = [];
let allLocations = [];
let allInvites = [];
let pendingDeleteFn = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    initTabs();
});

async function checkAdminAccess() {
    try {
        const res = await fetch('/api/userRole');
        const data = await res.json();
        if (!data.session || data.role !== 'admin') {
            document.getElementById('accessDenied').style.display = 'flex';
            return;
        }
        document.getElementById('adminContent').style.display = 'block';
        loadUsers();
        loadEvents();
        loadLocations();
        loadInvites();
    } catch {
        document.getElementById('accessDenied').style.display = 'flex';
    }
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function initTabs() {
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + tab).classList.add('active');
        });
    });
}

// ── Users ─────────────────────────────────────────────────────────────────────

async function loadUsers() {
    try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        allUsers = data.users || [];
        document.getElementById('totalUsers').textContent = allUsers.length;
        renderUsers(allUsers);
    } catch {
        document.getElementById('usersTableBody').innerHTML =
            '<tr><td colspan="6" class="loading-cell">Hiba a felhasználók betöltése során.</td></tr>';
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    document.getElementById('userCount').textContent = users.length + ' találat';
    tbody.replaceChildren();

    if (users.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.className = 'loading-cell';
        td.textContent = 'Nincs találat.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    users.forEach(u => {
        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = u.id;

        const tdUsername = document.createElement('td');
        const strong = document.createElement('strong');
        strong.textContent = u.username;
        tdUsername.appendChild(strong);

        const tdEmail = document.createElement('td');
        tdEmail.textContent = u.email;

        const tdFullName = document.createElement('td');
        tdFullName.textContent = u.full_name || '–';

        const tdRole = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = 'role-badge role-' + u.role;
        badge.textContent = u.role;
        tdRole.appendChild(badge);

        const tdActions = document.createElement('td');
        const div = document.createElement('div');
        div.className = 'action-buttons';

        const select = document.createElement('select');
        select.className = 'role-select';
        [['user', 'user'], ['szervezo', 'szervező'], ['admin', 'admin']].forEach(([val, label]) => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = label;
            if (u.role === val) opt.selected = true;
            select.appendChild(opt);
        });
        select.addEventListener('change', () => changeRole(u.id, select.value, select));

        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn-admin-delete';
        btnDelete.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/></svg>Törlés';
        btnDelete.addEventListener('click', () => confirmDeleteUser(u.id, u.username));

        div.append(select, btnDelete);
        tdActions.appendChild(div);

        tr.append(tdId, tdUsername, tdEmail, tdFullName, tdRole, tdActions);
        tbody.appendChild(tr);
    });
}

function filterUsers() {
    const q = document.getElementById('userSearch').value.toLowerCase().trim();
    if (!q) {
        renderUsers(allUsers);
        return;
    }
    const filtered = allUsers.filter(u =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q)
    );
    renderUsers(filtered);
}

function confirmDeleteUser(id, username) {
    document.getElementById('deleteModalTitle').textContent = 'Felhasználó törlése';
    document.getElementById('deleteModalBody').textContent =
        `Biztosan törölni szeretnéd „${username}" felhasználót? Ez a művelet nem vonható vissza.`;
    pendingDeleteFn = () => deleteUser(id);
    document.getElementById('confirmDeleteBtn').onclick = () => {
        pendingDeleteFn();
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
    };
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

async function deleteUser(id) {
    try {
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            allUsers = allUsers.filter(u => u.id !== id);
            document.getElementById('totalUsers').textContent = allUsers.length;
            filterUsers();
            showNotification('Felhasználó sikeresen törölve.', 'success');
        } else {
            showNotification(data.message || 'Hiba a törlés során.', 'error');
        }
    } catch {
        showNotification('Hiba a törlés során.', 'error');
    }
}

async function changeRole(id, newRole, selectEl) {
    const previousRole = allUsers.find(u => u.id === id)?.role;
    try {
        const res = await fetch(`/api/admin/users/${id}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
        });
        const data = await res.json();
        if (res.ok) {
            const user = allUsers.find(u => u.id === id);
            if (user) user.role = newRole;
            filterUsers();
            showNotification('Szerepkör sikeresen frissítve.', 'success');
        } else {
            if (selectEl && previousRole) selectEl.value = previousRole;
            showNotification(data.message || 'Hiba a szerepkör frissítése során.', 'error');
        }
    } catch {
        if (selectEl && previousRole) selectEl.value = previousRole;
        showNotification('Hiba a szerepkör frissítése során.', 'error');
    }
}

// ── Events ────────────────────────────────────────────────────────────────────

async function loadEvents() {
    try {
        const res = await fetch('/api/admin/events');
        const data = await res.json();
        allEvents = data.events || [];
        document.getElementById('totalEvents').textContent = allEvents.length;
        renderEvents(allEvents);
    } catch {
        document.getElementById('eventsTableBody').innerHTML =
            '<tr><td colspan="7" class="loading-cell">Hiba az események betöltése során.</td></tr>';
    }
}

function renderEvents(events) {
    const tbody = document.getElementById('eventsTableBody');
    document.getElementById('eventCount').textContent = events.length + ' találat';
    tbody.replaceChildren();

    if (events.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 7;
        td.className = 'loading-cell';
        td.textContent = 'Nincs találat.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    events.forEach(e => {
        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = e.id;

        const tdTitle = document.createElement('td');
        const strong = document.createElement('strong');
        strong.textContent = e.title;
        tdTitle.appendChild(strong);

        const tdCategory = document.createElement('td');
        tdCategory.textContent = e.category || '–';

        const tdType = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = 'event-type-badge type-' + e.type;
        badge.textContent = e.type == 'official' ? 'Hivatalos' : e.type == 'community' ? 'Közösségi' : 'Privát';
        tdType.appendChild(badge);

        const tdDate = document.createElement('td');
        tdDate.textContent = formatDate(e.date);

        const tdLocation = document.createElement('td');
        tdLocation.textContent = e.helyszin || '–';

        const tdActions = document.createElement('td');
        const div = document.createElement('div');
        div.className = 'action-buttons';
        const btn = document.createElement('button');
        btn.className = 'btn-admin-delete';
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/></svg>Törlés';
        btn.addEventListener('click', () => confirmDeleteEvent(e.id, e.title));
        div.appendChild(btn);
        tdActions.appendChild(div);

        tr.append(tdId, tdTitle, tdCategory, tdType, tdDate, tdLocation, tdActions);
        tbody.appendChild(tr);
    });
}

function filterEvents() {
    const q = document.getElementById('eventSearch').value.toLowerCase().trim();
    if (!q) {
        renderEvents(allEvents);
        return;
    }
    const filtered = allEvents.filter(e =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.category || '').toLowerCase().includes(q) ||
        (e.helyszin || '').toLowerCase().includes(q) ||
        (e.type || '').toLowerCase().includes(q)
    );
    renderEvents(filtered);
}

function confirmDeleteEvent(id, title) {
    document.getElementById('deleteModalTitle').textContent = 'Esemény törlése';
    document.getElementById('deleteModalBody').textContent =
        `Biztosan törölni szeretnéd „${title}" eseményt? Ez a művelet nem vonható vissza.`;
    pendingDeleteFn = () => deleteEvent(id);
    document.getElementById('confirmDeleteBtn').onclick = () => {
        pendingDeleteFn();
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
    };
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

async function deleteEvent(id) {
    try {
        const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            allEvents = allEvents.filter(e => e.id !== id);
            document.getElementById('totalEvents').textContent = allEvents.length;
            filterEvents();
            showNotification('Esemény sikeresen törölve.', 'success');
        } else {
            showNotification(data.message || 'Hiba a törlés során.', 'error');
        }
    } catch {
        showNotification('Hiba a törlés során.', 'error');
    }
}

// ── Locations ─────────────────────────────────────────────────────────────────

async function loadLocations() {
    try {
        const res = await fetch('/api/admin/locations');
        const data = await res.json();
        allLocations = data.locations || [];
        document.getElementById('totalLocations').textContent = allLocations.length;
        renderLocations(allLocations);
    } catch {
        document.getElementById('locationsTableBody').innerHTML =
            '<tr><td colspan="6" class="loading-cell">Hiba a helyszínek betöltése során.</td></tr>';
    }
}

function renderLocations(locations) {
    const tbody = document.getElementById('locationsTableBody');
    document.getElementById('locationCount').textContent = locations.length + ' találat';
    tbody.replaceChildren();

    if (locations.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.className = 'loading-cell';
        td.textContent = 'Nincs találat.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    locations.forEach(l => {
        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = l.id;

        const tdName = document.createElement('td');
        const strong = document.createElement('strong');
        strong.textContent = l.name;
        tdName.appendChild(strong);

        const tdCoords = document.createElement('td');
        tdCoords.textContent = l.latitude != null ? l.latitude + ', ' + l.longitude : '–';

        const tdPrivate = document.createElement('td');
        if (l.is_private) {
            const badge = document.createElement('span');
            badge.className = 'role-badge role-admin';
            badge.textContent = 'Privát';
            tdPrivate.appendChild(badge);
        } else {
            tdPrivate.textContent = '–';
        }

        const tdCreator = document.createElement('td');
        tdCreator.textContent = l.creator || '–';

        const tdActions = document.createElement('td');
        const div = document.createElement('div');
        div.className = 'action-buttons';
        const btn = document.createElement('button');
        btn.className = 'btn-admin-delete';
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/></svg>Törlés';
        btn.addEventListener('click', () => confirmDeleteLocation(l.id, l.name));
        div.appendChild(btn);
        tdActions.appendChild(div);

        tr.append(tdId, tdName, tdCoords, tdPrivate, tdCreator, tdActions);
        tbody.appendChild(tr);
    });
}

function filterLocations() {
    const q = document.getElementById('locationSearch').value.toLowerCase().trim();
    if (!q) { renderLocations(allLocations); return; }
    const filtered = allLocations.filter(l =>
        (l.name || '').toLowerCase().includes(q) ||
        (l.creator || '').toLowerCase().includes(q)
    );
    renderLocations(filtered);
}

function confirmDeleteLocation(id, name) {
    document.getElementById('deleteModalTitle').textContent = 'Helyszín törlése';
    document.getElementById('deleteModalBody').textContent =
        'Biztosan törölni szeretnéd „' + name + '" helyszínt? Ez a művelet nem vonható vissza.';
    pendingDeleteFn = () => deleteLocation(id);
    document.getElementById('confirmDeleteBtn').onclick = () => {
        pendingDeleteFn();
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
    };
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

async function deleteLocation(id) {
    try {
        const res = await fetch('/api/admin/locations/' + id, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            allLocations = allLocations.filter(l => l.id !== id);
            document.getElementById('totalLocations').textContent = allLocations.length;
            filterLocations();
            showNotification('Helyszín sikeresen törölve.', 'success');
        } else {
            showNotification(data.message || 'Hiba a törlés során.', 'error');
        }
    } catch {
        showNotification('Hiba a törlés során.', 'error');
    }
}

// ── Invites ───────────────────────────────────────────────────────────────────

async function loadInvites() {
    try {
        const res = await fetch('/api/admin/invites');
        const data = await res.json();
        allInvites = data.invites || [];
        document.getElementById('totalInvites').textContent = allInvites.length;
        renderInvites(allInvites);
    } catch {
        document.getElementById('invitesTableBody').innerHTML =
            '<tr><td colspan="7" class="loading-cell">Hiba a meghívók betöltése során.</td></tr>';
    }
}

function renderInvites(invites) {
    const tbody = document.getElementById('invitesTableBody');
    document.getElementById('inviteCount').textContent = invites.length + ' találat';
    tbody.replaceChildren();

    if (invites.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 7;
        td.className = 'loading-cell';
        td.textContent = 'Nincs találat.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    invites.forEach(i => {
        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = i.id;

        const tdEvent = document.createElement('td');
        const strong = document.createElement('strong');
        strong.textContent = i.event_title || '–';
        tdEvent.appendChild(strong);

        const tdToken = document.createElement('td');
        tdToken.textContent = i.token;

        const tdCap = document.createElement('td');
        tdCap.textContent = i.uses + ' / ' + i.max_capacity;

        const tdExp = document.createElement('td');
        tdExp.textContent = formatDate(i.expires_at);

        const tdCreator = document.createElement('td');
        tdCreator.textContent = i.creator || '–';

        const tdActions = document.createElement('td');
        const div = document.createElement('div');
        div.className = 'action-buttons';
        const btn = document.createElement('button');
        btn.className = 'btn-admin-delete';
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/></svg>Törlés';
        btn.addEventListener('click', () => confirmDeleteInvite(i.id, i.token));
        div.appendChild(btn);
        tdActions.appendChild(div);

        tr.append(tdId, tdEvent, tdToken, tdCap, tdExp, tdCreator, tdActions);
        tbody.appendChild(tr);
    });
}

function openCreateInviteModal() {
    const alreadyHasInvite = new Set(allInvites.map(i => i.event_id));
    const eligibleEvents = allEvents.filter(e => e.is_private && !alreadyHasInvite.has(e.id));

    const select = document.getElementById('inviteEventSelect');
    select.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = eligibleEvents.length ? '– Válassz eseményt –' : '– Nincs elérhető privát esemény –';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);
    eligibleEvents.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = e.title + ' (' + formatDate(e.date) + ')';
        select.appendChild(opt);
    });
    document.getElementById('inviteMaxCapacity').value = '';
    document.getElementById('inviteExpiresAt').value = '';
    document.getElementById('createInviteError').textContent = '';
    new bootstrap.Modal(document.getElementById('createInviteModal')).show();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('createInviteForm').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const eventId = document.getElementById('inviteEventSelect').value;
        const maxCapacity = document.getElementById('inviteMaxCapacity').value;
        const expiresAt = document.getElementById('inviteExpiresAt').value;
        const errorEl = document.getElementById('createInviteError');
        errorEl.textContent = '';
        try {
            const res = await fetch('/api/admin/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, maxCapacity, expiresAt })
            });
            const data = await res.json();
            if (res.ok) {
                allInvites = data.invites || [];
                document.getElementById('totalInvites').textContent = allInvites.length;
                filterInvites();
                bootstrap.Modal.getInstance(document.getElementById('createInviteModal')).hide();
                showNotification('Meghívó létrehozva. Token: ' + data.token, 'success');
            } else {
                errorEl.textContent = data.message || 'Hiba a létrehozás során.';
            }
        } catch {
            errorEl.textContent = 'Hiba a létrehozás során.';
        }
    });
});

function filterInvites() {
    const q = document.getElementById('inviteSearch').value.toLowerCase().trim();
    if (!q) { renderInvites(allInvites); return; }
    const filtered = allInvites.filter(i =>
        (i.event_title || '').toLowerCase().includes(q) ||
        (i.token || '').toLowerCase().includes(q) ||
        (i.creator || '').toLowerCase().includes(q)
    );
    renderInvites(filtered);
}

function confirmDeleteInvite(id, token) {
    document.getElementById('deleteModalTitle').textContent = 'Meghívó törlése';
    document.getElementById('deleteModalBody').textContent =
        'Biztosan törölni szeretnéd a(z) „' + token + '" tokenjű meghívót? Ez a művelet nem vonható vissza.';
    pendingDeleteFn = () => deleteInvite(id);
    document.getElementById('confirmDeleteBtn').onclick = () => {
        pendingDeleteFn();
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
    };
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

async function deleteInvite(id) {
    try {
        const res = await fetch('/api/admin/invites/' + id, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            allInvites = allInvites.filter(i => i.id !== id);
            document.getElementById('totalInvites').textContent = allInvites.length;
            filterInvites();
            showNotification('Meghívó sikeresen törölve.', 'success');
        } else {
            showNotification(data.message || 'Hiba a törlés során.', 'error');
        }
    } catch {
        showNotification('Hiba a törlés során.', 'error');
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDate(dateStr) {
    if (!dateStr) return '–';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

