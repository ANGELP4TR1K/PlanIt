const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { get } = require('browser-sync');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'planit',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//!SQL Queries
async function selectallUser() {
    const query = 'SELECT * FROM users;';
    const [rows] = await pool.execute(query);
    return rows;
}

//Insertek
async function insertLocation(name, latitude, longitude, link) {
    const query = 'INSERT INTO locations (name, latitude, longitude, link) VALUES (?, ?, ?, ?);';
    const [rows] = await pool.execute(query, [name, latitude, longitude, link]);
    return rows;
}

async function insertEvents(type, description, category, title, date, location_id, created_by) {
    const query = 'INSERT INTO events (type, description, category, title, date, location_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?);';
    const [rows] = await pool.execute(query, [type, description, category, title, date, location_id, created_by]);
    return rows;
}

//Selectek
async function selectAllEvents() {
    const query = 'SELECT events.*, locations.name AS helyszin, locations.latitude, locations.longitude FROM events JOIN locations ON events.location_id = locations.id WHERE events.date >= CURDATE() AND events.is_private = 0 ORDER BY events.date ASC;';
    const [rows] = await pool.execute(query);
    return rows;
}

async function selectUser(id) {
    const query = 'SELECT * FROM users WHERE id = ?;';
    const [rows] = await pool.execute(query, [id]);
    return rows;
}

async function selectEventById(id) {
    const query = 'SELECT * FROM events WHERE id = ?;';
    const [rows] = await pool.execute(query, [id]);
    return rows;
}

async function selectLocationById(id) {
    const query = 'SELECT * FROM locations WHERE id = ?;';
    const [rows] = await pool.execute(query, [id]);
    return rows;
}

async function selectLocationByCoordinates(latitude, longitude) {
    const query = 'SELECT * FROM locations WHERE latitude = ? AND longitude = ? AND (is_private = 0 OR is_private IS NULL) LIMIT 1;';
    const [rows] = await pool.execute(query, [latitude, longitude]);
    return rows.length > 0 ? rows[0] : null;
}

async function selectAllLocations(userId = null) {
    const query = 'SELECT * FROM locations WHERE (is_private = 0 OR is_private IS NULL) OR (is_private = 1 AND created_by = ?);';
    const [rows] = await pool.execute(query, [userId]);
    return rows;
}

async function insertPrivateLocation(name, latitude, longitude, link, created_by) {
    const query = 'INSERT INTO locations (name, latitude, longitude, link, is_private, created_by) VALUES (?, ?, ?, ?, 1, ?);';
    const [rows] = await pool.execute(query, [name, latitude, longitude, link, created_by]);
    return rows;
}

//Deletek
async function deleteEventById(id) {
    const query = 'DELETE FROM events WHERE id = ?;';
    const [rows] = await pool.execute(query, [id]);
    return rows;
}

async function deleteLocationById(id) {
    const query = 'DELETE FROM locations WHERE id = ?;';
    const [rows] = await pool.execute(query, [id]);
    return rows;
}

async function deleteUserById(id) {
    const query = 'DELETE FROM users WHERE id = ?;';
    const [rows] = await pool.execute(query, [id]);
    return rows;
}

//Updatek
async function updateEventById(id, type, description, category, title, date, location_id) {
    const query = 'UPDATE events SET type = ?, description = ?, category = ?, title = ?, date = ?, location_id = ? WHERE id = ?;';
    const [rows] = await pool.execute(query, [type, description, category, title, date, location_id, id]);
    return rows;
}

async function updateLocationById(id, name, latitude, longitude, link) {
    const query = 'UPDATE locations SET name = ?, latitude = ?, longitude = ?, link = ? WHERE id = ?;';
    const [rows] = await pool.execute(query, [name, latitude, longitude, link, id]);
    return rows;
}

async function updateUserProfile(id, username, email, full_name) {
    const query = 'UPDATE users SET username = ?, email = ?, full_name = ? WHERE id = ?;';
    const [rows] = await pool.execute(query, [username, email, full_name, id]);
    return rows;
}

async function updateUserPassword(id, password) {
    const query = 'UPDATE users SET password = ? WHERE id = ?;';
    const [rows] = await pool.execute(query, [password, id]);
    return rows;
}

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function updateUserPasswordSecure(id, currentPassword, newPassword) {
    const userData = await selectUser(id);
    if (!userData || userData.length === 0) {
        throw new Error('Felhasználó nem található');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, userData[0].password);
    if (!isPasswordValid) {
        throw new Error('Hibás jelenlegi jelszó');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(id, hashedPassword);
    return true;
}

async function updateUserById(id, username, email, password, role, full_name) {
    const query = 'UPDATE users SET username = ?, email = ?, password = ?, role = ?, full_name = ? WHERE id = ?;';
    const [rows] = await pool.execute(query, [username, email, password, role, full_name, id]);
    return rows;
}

//Login
async function login(email, password) {
    const query = 'SELECT * FROM users WHERE email = ?;';
    const [rows] = await pool.execute(query, [email]);
    return await bcrypt.compare(password, rows[0].password) ? rows[0] : null;
}


//Regisztráció
async function register(username, email, password, full_name) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, "user", ?);';
    const [rows] = await pool.execute(query, [username, email, hashedPassword, full_name]);
    return rows;
}

//Checkek
async function checkEmailExists(email) {
    const query = 'SELECT * FROM users WHERE email = ?;';
    const [rows] = await pool.execute(query, [email]);
    return rows.length > 0;
}

async function checkUsernameExists(username) {
    const query = 'SELECT * FROM users WHERE username = ?;';
    const [rows] = await pool.execute(query, [username]);
    return rows.length > 0;
}

async function checkLocationExists(name) {
    const query = 'SELECT * FROM locations WHERE name = ?;';
    const [rows] = await pool.execute(query, [name]);
    return rows.length > 0;
}

async function checkEventExistsById(id) {
    const query = 'SELECT * FROM events WHERE id = ?;';
    const [rows] = await pool.execute(query, [id]);
    return rows.length > 0;
}

async function checkIfUserIsAdmin(email) {
    const query = 'SELECT role FROM users WHERE email = ?;';
    const [rows] = await pool.execute(query, [email]);
    return rows.length > 0 && rows[0].role === 'admin';
}

//36 karakteres egyedi token létrehozása
async function createPrivateEvent( description, category, title, date)
{
    const query = 'INSERT INTO events (type, description, category, title, date, location_id) VALUES ("private", ?, ?, ?, ?, NULL);';
    const [rows] = await pool.execute(query, [description, category, title, date]);
    return rows;
}

async function useToken(token){
    const query = 'UPDATE event_invites SET uses = uses + 1 WHERE token = ? AND uses < max_capacity AND expires_at > NOW();';
    const [rows] = await pool.execute(query, [token]);
    return rows.affectedRows > 0;
}

async function getInviteByToken(token) {
    const query = `
        SELECT ei.*, e.id AS event_id, e.title AS event_title, e.date AS event_date
        FROM event_invites ei
        JOIN events e ON ei.event_id = e.id
        WHERE ei.token = ?
    `;
    const [rows] = await pool.execute(query, [token]);
    return rows.length > 0 ? rows[0] : null;
}

// Atomically join an event using the invite token: check capacity/expiry and insert participant
async function joinEventWithToken(token, user_id) {
    const [rows] = await pool.execute('SELECT * FROM event_invites WHERE token = ?', [token]);
    if (!rows || rows.length === 0) return { success: false, message: 'Érvénytelen token' };

    const invite = rows[0];
    if (invite.created_by === user_id) return { success: false, message: 'Nem csatlakozhatsz a saját eseményedhez' };
    if (new Date(invite.expires_at) <= new Date()) return { success: false, message: 'A meghívó lejárt' };
    if (invite.uses >= invite.max_capacity) return { success: false, message: 'A meghívó elérte a kapacitást' };

    const [existing] = await pool.execute('SELECT id FROM event_participants WHERE event_id = ? AND user_id = ?', [invite.event_id, user_id]);
    if (existing && existing.length > 0) return { success: false, message: 'Már részt veszel az eseményen' };

    await pool.execute('INSERT INTO event_participants (event_id, user_id) VALUES (?, ?)', [invite.event_id, user_id]);
    await pool.execute('UPDATE event_invites SET uses = uses + 1 WHERE id = ?', [invite.id]);

    return { success: true };
}

//Password Reset
async function createPasswordResetToken(email) {
    const token = crypto.randomBytes(32).toString('hex');

    const query = 'UPDATE users SET password_reset_token = ?, password_reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?;';
    await pool.execute(query, [token, email]);
    return token;
}

async function verifyPasswordResetToken(token) {
    const query = 'SELECT id, email FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW();';
    const [rows] = await pool.execute(query, [token]);
    return rows.length > 0 ? rows[0] : null;
}

async function resetPassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = 'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?;';
    await pool.execute(query, [hashedPassword, userId]);
    return true;
}

// User Events Functions
async function getPastUserEvents(userId) {
    const query = `
        SELECT e.*, l.name AS location, l.latitude, l.longitude
        FROM events e
        LEFT JOIN locations l ON e.location_id = l.id
        JOIN event_participants ep ON e.id = ep.event_id
        WHERE ep.user_id = ? AND e.date < CURDATE()
        ORDER BY e.date DESC;
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
}

async function getUserCommunityEvents(userId) {
    const query = `
        SELECT e.*, l.name AS location, l.latitude, l.longitude
        FROM events e
        LEFT JOIN locations l ON e.location_id = l.id
        JOIN event_participants ep ON e.id = ep.event_id
        WHERE ep.user_id = ? AND e.type = 'official' AND e.date >= CURDATE()
        ORDER BY e.date ASC;
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
}

async function getUserPrivateEvents(userId) {
    const query = `
        SELECT e.*, l.name AS location, l.latitude, l.longitude,
            (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) AS participant_count
        FROM events e
        LEFT JOIN locations l ON e.location_id = l.id
        JOIN event_participants ep ON e.id = ep.event_id
        WHERE ep.user_id = ?
          AND (e.type = 'private' OR (e.type = 'community' AND e.is_private = 1))
          AND e.date >= CURDATE()
        ORDER BY e.date ASC;
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
}

async function getPastCreatedEvents(userId) {
    const query = `
        SELECT DISTINCT e.*, l.name AS location, l.latitude, l.longitude,
            (SELECT token FROM event_invites WHERE event_id = e.id LIMIT 1) AS invite_token,
            (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) AS participant_count
        FROM events e
        LEFT JOIN locations l ON e.location_id = l.id
        WHERE (
            (e.created_by = ? AND e.type LIKE 'community')
            OR
            e.id IN (SELECT event_id FROM event_invites WHERE created_by = ?)
        )
        AND e.date < CURDATE()
        ORDER BY e.date DESC;
    `;
    const [rows] = await pool.execute(query, [userId, userId]);
    return rows;
}

async function getUserCreatedEvents(userId) {
    const query = `
        SELECT DISTINCT e.*, l.name AS location, l.latitude, l.longitude,
            (SELECT token FROM event_invites WHERE event_id = e.id LIMIT 1) AS invite_token,
            (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) AS participant_count
        FROM events e
        LEFT JOIN locations l ON e.location_id = l.id
        WHERE (
            (e.created_by = ? AND e.type LIKE 'community')
            OR
            e.id IN (SELECT event_id FROM event_invites WHERE created_by = ?)
        )
        AND e.date >= CURDATE()
        ORDER BY e.date ASC;
    `;
    const [rows] = await pool.execute(query, [userId, userId]);
    return rows;
}

async function insertCommunityEvent(type, description, category, title, date, capacity, location_id, created_by, is_private) {
    const query = 'INSERT INTO events (type, description, category, title, date, capacity, location_id, created_by, is_private) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);';
    const [rows] = await pool.execute(query, [type, description, category, title, date, capacity, location_id, created_by, is_private]);
    return rows;
}

async function getUserCreatedOfficialEvents(userId) {
    const query = `
        SELECT e.*, l.name AS location, l.latitude, l.longitude
        FROM events e
        LEFT JOIN locations l ON e.location_id = l.id
        WHERE e.created_by = ? AND e.date >= CURDATE() AND e.type = 'Official'
        ORDER BY e.date ASC;
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
}

async function getEventDetailsById(eventId) {
    const query = `
        SELECT e.*, l.name AS location, l.latitude, l.longitude,
               COUNT(DISTINCT ep.user_id) AS participant_count
        FROM events e
        LEFT JOIN locations l ON e.location_id = l.id
        LEFT JOIN event_participants ep ON e.id = ep.event_id
        WHERE e.id = ?
        GROUP BY e.id;
    `;
    const [rows] = await pool.execute(query, [eventId]);
    return rows.length > 0 ? rows[0] : null;
}

async function removeUserFromEvent(eventId, userId) {
    const query = 'DELETE FROM event_participants WHERE event_id = ? AND user_id = ?;';
    const [rows] = await pool.execute(query, [eventId, userId]);
    return rows.affectedRows > 0;
}

async function decrementInviteUses(eventId) {
    const query = 'UPDATE event_invites SET uses = GREATEST(uses - 1, 0) WHERE event_id = ?;';
    await pool.execute(query, [eventId]);
}

async function getPrivateEvent(eventId) {
    const query = 'SELECT events.*, event_invites.created_by FROM events INNER JOIN event_invites ON event_invites.event_id = events.id WHERE events.is_private = 1 AND events.id = ?;';
    const [rows] = await pool.execute(query, [eventId]);
    return rows;
}

async function createInviteForEvent(eventId, name, location, date, created_by, max_capacity) {
    const datum = new Date(date);
    if (isNaN(datum.getTime())) throw new Error('Invalid date');
    const expires_at = datum.toISOString().slice(0, 19).replace('T', ' ');

    let token;
    let tries = 0;
    do {
        token = String(Math.floor(1000000000 + Math.random() * 9000000000));
        const [existing] = await pool.execute('SELECT id FROM event_invites WHERE token = ?', [token]);
        if (existing.length === 0) break;
        tries++;
    } while (tries < 5);

    if (!token) throw new Error('Could not generate unique invite code');

    const query = 'INSERT INTO event_invites (event_id, name, location, date, created_by, expires_at, max_capacity, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
    await pool.execute(query, [eventId, name, location || '', date, created_by, expires_at, max_capacity, token]);
    return token;
}

async function selectAllUsersAdmin() {
    const query = 'SELECT id, username, email, full_name, role, creation_date FROM users ORDER BY id ASC;';
    const [rows] = await pool.execute(query);
    return rows;
}


async function selectAllEventsAdmin() {
    const query = `
        SELECT events.id, events.title, events.category, events.type, events.is_private, events.date, events.created_by,
               locations.name AS helyszin
        FROM events
        LEFT JOIN locations ON events.location_id = locations.id
        ORDER BY events.date DESC;
    `;
    const [rows] = await pool.execute(query);
    return rows;
}

async function updateUserRole(id, role) {
    const query = 'UPDATE users SET role = ? WHERE id = ?;';
    const [rows] = await pool.execute(query, [role, id]);
    return rows;
}

async function getParticipantCount(eventId) {
    const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM event_participants WHERE event_id = ?', [eventId]);
    return rows[0].count;
}

async function getEventParticipants(eventId) {
    const [rows] = await pool.execute(
        `SELECT u.id, u.username, u.full_name
         FROM event_participants ep
         JOIN users u ON ep.user_id = u.id
         WHERE ep.event_id = ?
         ORDER BY ep.created_at ASC`,
        [eventId]
    );
    return rows;
}

async function joinEvent(eventId, userId) {
    const [existing] = await pool.execute('SELECT id FROM event_participants WHERE event_id = ? AND user_id = ?', [eventId, userId]);
    if (existing.length > 0) return { success: false, message: 'Már jelentkeztél erre az eseményre.' };
    await pool.execute('INSERT INTO event_participants (event_id, user_id) VALUES (?, ?)', [eventId, userId]);
    return { success: true };
}

async function isUserParticipant(eventId, userId) {
    const [rows] = await pool.execute('SELECT id FROM event_participants WHERE event_id = ? AND user_id = ?', [eventId, userId]);
    return rows.length > 0;
}

async function deleteEventAndParticipants(eventId) {
    await pool.execute('DELETE FROM event_participants WHERE event_id = ?', [eventId]);
    await pool.execute('DELETE FROM event_invites WHERE event_id = ?', [eventId]);
    await pool.execute('DELETE FROM events WHERE id = ?', [eventId]);
    return true;
}

async function selectAllLocationsAdmin() {
    const query = `
        SELECT l.id, l.name, l.latitude, l.longitude, l.link,
               l.is_private, l.created_by, u.username AS creator
        FROM locations l
        LEFT JOIN users u ON l.created_by = u.id
        ORDER BY l.id ASC;
    `;
    const [rows] = await pool.execute(query);
    return rows;
}

async function selectAllInvitesAdmin() {
    const query = `
        SELECT ei.id, ei.token, ei.name, ei.location, ei.date,
               ei.max_capacity, ei.uses, ei.expires_at, ei.created_by,
               u.username AS creator, e.title AS event_title, e.id AS event_id
        FROM event_invites ei
        LEFT JOIN users u ON ei.created_by = u.id
        LEFT JOIN events e ON ei.event_id = e.id
        ORDER BY ei.id DESC;
    `;
    const [rows] = await pool.execute(query);
    return rows;
}

async function deleteInviteById(id) {
    const query = 'DELETE FROM event_invites WHERE id = ?;';
    const [rows] = await pool.execute(query, [id]);
    return rows;
}

async function createInviteAdmin(eventId, maxCapacity, expiresAt, createdBy) {
    const [eventRows] = await pool.execute(
        'SELECT e.title, e.is_private, l.name AS location, e.date FROM events e LEFT JOIN locations l ON e.location_id = l.id WHERE e.id = ?',
        [eventId]
    );
    if (!eventRows.length) throw new Error('Esemény nem található');
    const event = eventRows[0];

    if (!event.is_private) throw new Error('Csak privát eseményhez lehet meghívót létrehozni.');

    const [existing] = await pool.execute('SELECT id FROM event_invites WHERE event_id = ?', [eventId]);
    if (existing.length) throw new Error('Az eseményhez már tartozik meghívó.');

    let token;
    let tries = 0;
    do {
        token = String(Math.floor(1000000000 + Math.random() * 9000000000));
        const [existing] = await pool.execute('SELECT id FROM event_invites WHERE token = ?', [token]);
        if (existing.length === 0) break;
        tries++;
    } while (tries < 5);

    const expiresFormatted = new Date(expiresAt).toISOString().slice(0, 19).replace('T', ' ');
    const eventDateFormatted = new Date(event.date).toISOString().slice(0, 10);

    await pool.execute(
        'INSERT INTO event_invites (event_id, name, location, date, created_by, expires_at, max_capacity, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [eventId, event.title, event.location || '', eventDateFormatted, createdBy, expiresFormatted, maxCapacity, token]
    );
    return token;
}

//!Export
module.exports = {
    selectallUser,
    selectAllEvents,
    selectAllLocations,
    insertLocation,
    insertEvents,
    selectUser,
    selectEventById,
    selectLocationById,
    selectLocationByCoordinates,
    selectAllLocations,
    deleteEventById,
    deleteLocationById,
    deleteUserById,
    updateEventById,
    updateLocationById,
    updateUserById,
    updateUserProfile,
    updateUserPassword,
    updateUserPasswordSecure,
    hashPassword,
    register,
    login,
    checkEmailExists,
    checkUsernameExists,
    checkLocationExists,
    checkEventExistsById,
    getInviteByToken,
    joinEventWithToken,
    checkIfUserIsAdmin,
    useToken,
    createPasswordResetToken,
    verifyPasswordResetToken,
    resetPassword,
    getPastUserEvents,
    getPastCreatedEvents,
    getUserCommunityEvents,
    getUserPrivateEvents,
    getUserCreatedEvents,
    getUserCreatedOfficialEvents,
    getEventDetailsById,
    removeUserFromEvent,
    decrementInviteUses,
    deleteEventAndParticipants,
    getPrivateEvent,
    insertCommunityEvent,
    selectLocationByCoordinates,
    insertPrivateLocation,
    createInviteForEvent,
    selectAllUsersAdmin,
    selectAllEventsAdmin,
    updateUserRole,
    selectAllLocationsAdmin,
    selectAllInvitesAdmin,
    deleteInviteById,
    createInviteAdmin,
    joinEvent,
    isUserParticipant,
    getParticipantCount,
    getEventParticipants
};