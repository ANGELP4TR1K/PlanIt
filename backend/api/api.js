const express = require('express');
const bcrypt = require('bcrypt'); //?npm install bcrypt
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs/promises');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, path.join(__dirname, '../uploads'));
    },
    filename: (request, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname); //?egyedi név: dátum - file eredeti neve
    }
});

const upload = multer({ storage });
const saltRounds = 10;

//!Endpoints:
//?GET /api/test
router.get('/test', (request, response) => {
    response.status(200).json({
        message: 'Ez a végpont működik.'
    });
});

//?GET /api/testsql
router.get('/testsql', async (request, response) => {
    try {
        const selectall = await database.selectallUser();
        response.status(200).json({
            message: 'Ez a végpont működik.',
            results: selectall
        });
    } catch (error) {
        response.status(500).json({
            message: 'Ez a végpont nem működik.'
        });
    }
});

//?GET /api/userSession
router.get('/userSession', (request, response) => {
    if (request.session && request.session.user) {
        return response.status(200).json({ session: true});
    } else {
        return response.status(200).json({ session: false });
    }
});


//?POST /api/login
router.post('/login', async (request, response) => {
    const { email, password } = request.body;
    if (!email || !password) {
        return response.status(400).json({ message: 'Hiányzó adatok!' });
    }

    try {

        const rows = await database.login(email, password);
        if (!rows) {
            return response.status(401).json({ message: 'Hibás felhasználónév vagy jelszó.' });
        }
        else{
            request.session.user = {
                id: rows.id,
                role: rows.role
            }
            console.log('Bejelentkezett:', request.session.user);
            return response.status(200).json({ message: 'Bejelentkezve', user: request.session.user });
        }

    } catch (error) {
        return response.status(500).json({ message: 'Hibás felhasználónév vagy jelszó.' });
    }
});

//?GET /api/logout
router.get('/logout', (request, response) => {
    if (request.session) {
        request.session.destroy(err => {
            if (err) return response.status(500).json({ message: 'Sikertelen kijelentkezés.' });
            response.clearCookie('planit_session');
            return response.status(200).json({ message: 'Kijelentkezve.' });
        });
    } else {
        return response.status(200).json({ message: 'Nincs aktív munkamenet.' });
    }
});

//?POST /api/register
router.post('/register', async (request, response) => {
    const { username, email, password, full_name } = request.body;
    if (!username || !email || !password) {
        return response.status(400).json({ message: 'Hiányzó adatok!' });
    }

    try {
        const emailExists = await database.checkEmailExists(email);
        if (emailExists) return response.status(400).json({ message: 'Az e-mail már használatban.' });

        const usernameExists = await database.checkUsernameExists(username);
        if (usernameExists) return response.status(400).json({ message: 'A felhasználónév már foglalt.' });
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await database.register(username, email, hashedPassword, full_name || null);
        const userId = result && result.insertId ? result.insertId : null;
        request.session.user = {
            id: userId,
            role: 'user'
        };

        return response.status(201).json({ message: 'Sikeres regisztráció', user: request.session.user });
    } catch (error) {
        return response.status(500).json({ message: 'Regisztráció sikertelen.' });
    }
});

//?GET /api/events
router.get('/events', async (request, response) => {
    try {
        const events = await database.selectAllEvents();
        response.status(200).json(events);
    } catch (error) {
        response.status(500).json({ message: 'Nem sikerült lekérni az eseményeket.' });
    }
});
router.get('/profile', async (request, response) =>{
    if(request.session && request.session.user)
    {   
        const data = await database.selectUser(request.session.user.id);
        if (data && data.length > 0) {
            response.status(200).json({
                id: data[0].id,
                username: data[0].username,
                email: data[0].email,
                full_name: data[0].full_name,
                created_at: data[0].creation_date
            });
        } else {
            response.status(404).json({ message: 'Felhasználó nem található' });
        }
    }
    else
    {
        response.status(401).json({ message: 'Nincs bejelentkezve.' });
    }
});

router.put('/usernameupdate', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }
    const { username, full_name, email } = request.body;
    if (!username) {
        return response.status(400).json({ message: 'Hiányzó adatok!' });
    }
    try {
        const usernameExists = await database.checkUsernameExists(username);
        if (usernameExists) {
            return response.status(400).json({ message: 'A felhasználónév már foglalt.' });
        }
        await database.updateUserProfile(request.session.user.id, username, email, full_name);

        return response.status(200).json({ message: 'Felhasználónév frissítve', username });
    } catch (error) {
        return response.status(500).json({ message: 'Hiba a felhasználónév frissítésekor.' });
    }
});

router.put('/fullnameupdate', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }
    const { full_name, username, email } = request.body;
    if (!full_name) {
        return response.status(400).json({ message: 'Hiányzó adatok!' });
    }
    try {
        await database.updateUserProfile(request.session.user.id, username, email, full_name);

        return response.status(200).json({ message: 'Teljes név frissítve', full_name });
    } catch (error) {
        return response.status(500).json({ message: 'Hiba a teljes név frissítésekor.' });
    }
});

//?PUT /api/profile/password
router.put('/passwordupdate', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }
    const { current_password, new_password } = request.body;
    if (!current_password || !new_password) {
        return response.status(400).json({ message: 'Hiányzó adatok!' });
    }
    try {
        await database.updateUserPasswordSecure(request.session.user.id, current_password, new_password);
        return response.status(200).json({ message: 'Jelszó sikeresen frissítve!' });
    } catch (error) {
        return response.status(400).json({ message: error.message || 'Hiba a jelszó frissítésekor.' });
    }
});

//?DELETE /api/profile
router.delete('/profile', async (request, response) => {
    try {
        if (!request.session.user) {
            return response.status(401).json({ message: 'Bejelentkezés szükséges' });
        }

        const userId = request.session.user.id;

        // Delete user from database
        await database.deleteUserById(userId);

        // Destroy session
        request.session.destroy((err) => {
            if (err) {
                return response.status(500).json({ message: 'Hiba a kijelentkezéskor' });
            }

            response.clearCookie('planit_session');
            response.status(200).json({ message: 'Profil sikeresen törölve' });
        });

    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Hiba a profil törléskor' });
    }
});

//?POST /api/createEventInvite
router.post('/createEventInvite', async (request, response) => {
    const { event_id, created_by, expires_at, max_capacity } = request.body;
    if (!event_id || !created_by || !expires_at || !max_capacity) {
        return response.status(400).json({ message: 'Hiányzó adatok!' });
    }
    try {
        const result = await database.createEventInvite(event_id, created_by, expires_at, max_capacity);
        if (result) {
            return response.status(201).json({ message: 'Sikeres meghívó létrehozás' });
        }
        else {
            return response.status(500).json({ message: 'Meghívó létrehozása sikertelen.' });

        }
    } catch (error) {
        return response.status(500).json({ message: 'Meghívó létrehozása sikertelen.' });
    }
});

//?GET /api/checkTokenExistsandUsed
router.get('/checkTokenExistsandUsed', async (request, response) => {
    const { token } = request.query;
    if (!token) {
        return response.status(400).json({ message: 'Hiányzó token!' });
    }
    try {
        const exists = await database.checkTokenExistsandUsed(token);
        return response.status(200).json({ exists });
    } catch (error) {
        return response.status(500).json({ message: 'Token ellenőrzése sikertelen.' });
    }
});

//?PUT /api/useToken
router.put('/useToken', async (request, response) => {
    const { token } = request.body;
    if (!token) {
        return response.status(400).json({ message: 'Hiányzó token!' });
    }
    try {
        const result = await database.useToken(token);
        if (result) {
            return response.status(200).json({ message: 'Token sikeresen használva' });
        }
        else {
            return response.status(500).json({ message: 'Token használata sikertelen.' });
        }
    } catch (error) {
        return response.status(500).json({ message: 'Token használata sikertelen.' });
    }
});

module.exports = router;
