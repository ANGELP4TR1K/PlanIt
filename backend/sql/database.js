const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

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
    const query = 'SELECT events.*, locations.name AS helyszin, locations.latitude, locations.longitude FROM events JOIN locations ON events.location_id = locations.id;';
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
    checkIfUserIsAdmin
};