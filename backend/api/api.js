const express = require('express');
const bcrypt = require('bcrypt'); //?npm install bcrypt
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs/promises');
const nodemailer = require('nodemailer'); //?npm install nodemailer

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
    const { name, location, date, max_capacity } = request.body;
    if (!name || !location || !date || !max_capacity) {
        return response.status(400).json({ message: 'Hiányzó adatok!' });
    }
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }
    try {
        const created_by = request.session.user.id;
        const result = await database.createEventInvite(name, location, date, created_by, max_capacity);
        if (result && result.token) {
            return response.status(201).json({ message: 'Sikeres meghívó létrehozás', eventId: result.eventId, token: result.token });
        } else {
            return response.status(500).json({ message: 'Meghívó létrehozása sikertelen.' });
        }
    } catch (error) {
        console.error('createEventInvite error:', error);
        return response.status(500).json({ message: 'Meghívó létrehozása sikertelen.' });
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
            return response.status(200).json({ message: 'Token használata nem lehetséges, mert elérte a limitet.' });
        }
    } catch (error) {
        return response.status(500).json({ message: 'Token használata sikertelen.' });
    }
});

//?GET /api/invite/:token - get invite + event details
router.get('/invite/:token', async (request, response) => {
    const { token } = request.params;
    try {
        const invite = await database.getInviteByToken(token);
        if (!invite) return response.status(404).json({ message: 'Meghívó nem található' });
        return response.status(200).json({ invite });
    } catch (err) {
        console.error(err);
        return response.status(500).json({ message: 'Hiba történt' });
    }
});

//?POST /api/invite/join - join event using token
router.post('/invite/join', async (request, response) => {
    const { token } = request.body;
    if (!token) return response.status(400).json({ message: 'Hiányzó token' });
    if (!request.session || !request.session.user) return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    try {
        const result = await database.joinEventWithToken(token, request.session.user.id);
        if (result.success) return response.status(200).json({ message: 'Sikeres csatlakozás' });
        return response.status(400).json({ message: result.message });
    } catch (err) {
        console.error(err);
        return response.status(500).json({ message: 'Hiba történt' });
    }
});

//?POST /api/forgot-password
router.post('/forgot-password', async (request, response) => {
    const { email } = request.body;
    if (!email) {
        return response.status(400).json({ message: 'E-mail cím szükséges!' });
    }

    try {
        const emailExists = await database.checkEmailExists(email);
        if (!emailExists) {
            return response.status(404).json({ message: 'E-mail cím nem található.' });
        }

        const token = await database.createPasswordResetToken(email);

        // Email küldése
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        console.log('Password reset token created:', token);
        const resetLink = `http://localhost:3000/reset-password?token=${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'PlanIt - Jelszó visszaállítása',
            html: `
                <h2>Jelszó visszaállítása</h2>
                <p>Az alábbi linkre kattintva állíthatod vissza a jelszavadat:</p>
                <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Jelszó visszaállítása
                </a>
                <p>Ez a link 1 óra múlva lejár.</p>
                <p>Ha nem te küldted ezt az e-mailt, hagyd figyelmen kívül.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        return response.status(200).json({ message: 'Jelszó visszaállítási link elküldve az e-mail címedre.' });

    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Hiba a jelszó visszaállítása során.' });
    }
});

//?POST /api/reset-password
router.post('/reset-password', async (request, response) => {
    const { token, newPassword } = request.body;
    if (!token || !newPassword) {
        return response.status(400).json({ message: 'Token és új jelszó szükséges!' });
    }

    try {
        const user = await database.verifyPasswordResetToken(token);
        if (!user) {
            return response.status(400).json({ message: 'Érvénytelen vagy lejárt token.' });
        }

        await database.resetPassword(user.id, newPassword);
        return response.status(200).json({ message: 'Jelszó sikeresen visszaállítva!' });

    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Hiba a jelszó visszaállítása során.' });
    }
});

//?GET /api/userEvents - Get all user events (joined and created)
router.get('/userEvents', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }

    try {
        const userId = request.session.user.id;

        const communityEvents = await database.getUserCommunityEvents(userId);
        const privateEvents = await database.getUserPrivateEvents(userId);
        const createdEvents = await database.getUserCreatedEvents(userId);

        return response.status(200).json({
            communityEvents: communityEvents || [],
            privateEvents: privateEvents || [],
            createdEvents: createdEvents || []
        });

    } catch (error) {
        console.error('Error getting user events:', error);
        return response.status(500).json({ message: 'Hiba az események lekérése során.' });
    }
});

//?GET /api/events/:id - Get single event details
router.get('/events/:id', async (request, response) => {
    const { id } = request.params;
    if (!id) {
        return response.status(400).json({ message: 'Esemény ID szükséges' });
    }

    try {
        const event = await database.getEventDetailsById(id);
        if (!event) {
            return response.status(404).json({ message: 'Esemény nem található' });
        }

        return response.status(200).json(event);

    } catch (error) {
        console.error('Error getting event details:', error);
        return response.status(500).json({ message: 'Hiba az esemény adatainak lekérése során.' });
    }
});

//?POST /api/events/:id/leave - Leave an event
router.post('/events/:id/leave', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }

    const { id } = request.params;
    const userId = request.session.user.id;

    if (!id) {
        return response.status(400).json({ message: 'Esemény ID szükséges' });
    }

    try {
        const event = await database.selectEventById(id);
        if (!event || event.length === 0) {
            return response.status(404).json({ message: 'Esemény nem található' });
        }

        const result = await database.removeUserFromEvent(id, userId);
        if (result) {
            return response.status(200).json({ message: 'Sikeresen elhagytad az eseményt' });
        } else {
            return response.status(400).json({ message: 'Nem tudsz elhagyni egy eseményt, amelyen nem vagy résztvevő' });
        }

    } catch (error) {
        console.error('Error leaving event:', error);
        return response.status(500).json({ message: 'Hiba az esemény elhagyása során.' });
    }
});

//?DELETE /api/events/:id - Delete an event
router.delete('/events/:id', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }

    const { id } = request.params;
    const userId = request.session.user.id;

    if (!id) {
        return response.status(400).json({ message: 'Esemény ID szükséges' });
    }

    try {
        const event = await database.getPrivateEvent(id);
        if (!event || event.length === 0) {
            return response.status(404).json({ message: 'Esemény nem található' });
        }
        console.log('Event details:', event[0]);
        // Check if user is the creator of the event
        if (event[0].created_by !== userId) {
            return response.status(403).json({ message: 'Nincs jogosultságod ezt az eseményt törölni' });
        }

        await database.deleteEventAndParticipants(id);
        return response.status(200).json({ message: 'Az esemény sikeresen törölve lett' });

    } catch (error) {
        console.error('Error deleting event:', error);
        return response.status(500).json({ message: 'Hiba az esemény törlése során.' });
    }
});

module.exports = router;