const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { get } = require('http');

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

async function insertEvents(type, description, category, title, date, capacity, location_id ) {
    const query = 'INSERT INTO events (type, description, category, title, date, capacity, location_id) VALUES (?, ?, ?, ?, ?, ?, ?);';
    const [rows] = await pool.execute(query, [type, description, category, title, date, capacity, location_id]);
    return rows;
}

//Selectek
async function selectAllEvents() {
    const query = 'SELECT events.*, locations.name AS helyszin, locations.latitude, locations.longitude FROM events JOIN locations ON events.location_id = locations.id WHERE events.date >= CURDATE() ORDER BY events.date ASC;';
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
async function updateEventById(id, type, description, category, title, date, capacity, location_id) {
    const query = 'UPDATE events SET type = ?, description = ?, category = ?, title = ?, date = ?, capacity = ?, location_id = ? WHERE id = ?;';
    const [rows] = await pool.execute(query, [type, description, category, title, date, capacity, location_id, id]);
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
    const query = 'INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, "user", ?);';
    const [rows] = await pool.execute(query, [username, email, password, full_name]);
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

async function createEventInvite(name, location, date, created_by, max_capacity) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // create private event
        const insertEventQuery = 'INSERT INTO events (type, description, category, title, date, location_id, is_private) VALUES (?, ?, ?, ?, ?, NULL, ?);';
        const [eventResult] = await conn.execute(insertEventQuery, ['private', location || '', 'private', name, date, 1]);
        const eventId = eventResult.insertId;

            // compute expires_at (up to event date) and format for MySQL DATETIME
            const stringdatum = date;
            const datum = new Date(stringdatum);
            if (isNaN(datum.getTime())) throw new Error('Invalid date');
            const ujDatum = datum.toISOString().slice(0, 19).replace('T', ' ');

        // generate unique 10-digit numeric code
        let token;
        let tries = 0;
        do {
            token = String(Math.floor(1000000000 + Math.random() * 9000000000)); // 10-digit
            const [existing] = await conn.execute('SELECT id FROM event_invites WHERE token = ?', [token]);
            if (existing.length === 0) break;
            tries++;
        } while (tries < 5);

        if (!token) throw new Error('Could not generate unique invite code');

        const insertInviteQuery = 'INSERT INTO event_invites (event_id, name, location, date, created_by, expires_at, max_capacity, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
        const [inviteResult] = await conn.execute(insertInviteQuery, [eventId, name, location, date, created_by, ujDatum, max_capacity, token]);

        await conn.commit();
        return { eventId, token };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
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
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // lock the invite row
        const [rows] = await conn.execute('SELECT * FROM event_invites WHERE token = ? FOR UPDATE', [token]);
        if (!rows || rows.length === 0) {
            await conn.rollback();
            return { success: false, message: 'Érvénytelen token' };
        }
        const invite = rows[0];
        if (new Date(invite.expires_at) <= new Date()) {
            await conn.rollback();
            return { success: false, message: 'A meghívó lejárt' };
        }
        if (invite.uses >= invite.max_capacity) {
            await conn.rollback();
            return { success: false, message: 'A meghívó elérte a kapacitást' };
        }

        // check if user already joined
        const [existing] = await conn.execute('SELECT * FROM event_participants WHERE event_id = ? AND user_id = ?', [invite.event_id, user_id]);
        if (existing && existing.length > 0) {
            await conn.rollback();
            return { success: false, message: 'Már részt veszel az eseményen' };
        }

        // insert participant
        await conn.execute('INSERT INTO event_participants (event_id, user_id) VALUES (?, ?)', [invite.event_id, user_id]);

        // increment uses
        await conn.execute('UPDATE event_invites SET uses = uses + 1 WHERE id = ?', [invite.id]);

        await conn.commit();
        return { success: true };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
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
        SELECT e.*, l.name AS location, l.latitude, l.longitude
        FROM events e
        LEFT JOIN locations l ON e.location_id = l.id
        JOIN event_participants ep ON e.id = ep.event_id
        WHERE ep.user_id = ? AND e.type = 'private' AND e.date >= CURDATE()
        ORDER BY e.date ASC;
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
}

async function getUserCreatedEvents(userId) {
    const query = `
        SELECT e.*, l.name AS location, l.latitude, l.longitude
        FROM events e
        LEFT JOIN locations l ON e.location_id = l.id
        JOIN event_invites ON event_invites.event_id = e.id
        WHERE event_invites.created_by = ? AND e.date >= CURDATE()
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

async function getPrivateEvent(eventId) {
    const query = 'SELECT events.*, event_invites.created_by FROM events INNER JOIN event_invites ON event_invites.event_id = events.id WHERE events.is_private = 1 AND events.id = ?;';
    const [rows] = await pool.execute(query, [eventId]);
    return rows;
}

async function deleteEventAndParticipants(eventId) {
    await pool.execute('DELETE FROM event_participants WHERE event_id = ?', [eventId]);
    await pool.execute('DELETE FROM event_invites WHERE event_id = ?', [eventId]);
    await pool.execute('DELETE FROM events WHERE id = ?', [eventId]);
    return true;
}

//!Export
module.exports = {
    selectallUser,
    selectAllEvents,
    insertLocation,
    insertEvents,
    selectUser,
    selectEventById,
    selectLocationById,
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
    createEventInvite,
    getInviteByToken,
    joinEventWithToken,
    checkIfUserIsAdmin,
    useToken,
    createPasswordResetToken,
    verifyPasswordResetToken,
    resetPassword,
    getUserCommunityEvents,
    getUserPrivateEvents,
    getUserCreatedEvents,
    getEventDetailsById,
    removeUserFromEvent,
    deleteEventAndParticipants,
    getPrivateEvent
};