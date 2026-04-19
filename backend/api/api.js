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

//?POST /api/login
router.post('/login', async (request, response) => {
    const { email, password } = request.body;
    if (!email || !password) {
        return response.status(400).json({ message: 'Hiányzó adatok!' });
    }

    try {

        const rows = await database.selectUser(email);
        if (!rows || rows.length === 0) {
            return response.status(401).json({ message: 'Hibás adatok!' });
        }

        if (await bcrypt.compare(password, rows[0].password)) {
            request.session.user = {
                id: rows[0].id,
                email: rows[0].email,
                username: rows[0].username
            }
            return response.status(200).json({ message: 'Bejelentkezve', user: request.session.user });
        }
        else{
            return response.status(401).json({ message: 'Hibás adatok!' });
        }

    } catch (error) {
        return response.status(500).json({ message: 'Sikertelen bejelentkezés.' });
    }
});

//?POST /api/logout
router.post('/logout', (request, response) => {
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
        if (emailExists) return response.status(409).json({ message: 'E-mail már használatban.' });

        const usernameExists = await database.checkUsernameExists(username);
        if (usernameExists) return response.status(409).json({ message: 'Felhasználónév már foglalt.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await database.register(username, email, hashedPassword, full_name || null);
        const userId = result && result.insertId ? result.insertId : null;

        request.session.user = {
            id: userId,
            email,
            username
        };

        return response.status(201).json({ message: 'Sikeres regisztráció', user: request.session.user });
    } catch (error) {
        return response.status(500).json({ message: 'Regisztráció sikertelen.' });
    }
});

module.exports = router;
