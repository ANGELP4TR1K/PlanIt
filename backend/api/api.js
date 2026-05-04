const express = require('express');
const bcrypt = require('bcrypt'); //?npm install bcrypt
const router = express.Router();
const database = require('../sql/database.js');
const fs = require('fs');
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

router.get('/userRole', (request, response) => {
    if (request.session && request.session.user) {
        return response.status(200).json({ session: true, role: request.session.user.role });
    } else {
        return response.status(200).json({ session: false });
    }
});

//?GET /api/locations - Get all locations for autocomplete
router.get('/locations', async (request, response) => {
    try {
        const userId = request.session?.user?.id ?? null;
        const locations = await database.selectAllLocations(userId);
        return response.status(200).json({ locations });
    } catch (error) {
        console.error('Hiba a helyszínek betöltése során:', error);
        return response.status(500).json({ message: 'Hiba a helyszínek betöltése során.' });
    }
});

//?GET /api/userCreatedEvents - Get events created by the logged-in user
router.get('/userCreatedEvents', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }

    try {
        const events = await database.getUserCreatedEvents(request.session.user.id);
        return response.status(200).json({ events });
    } catch (error) {
        console.error('Hiba az események betöltése során:', error);
        return response.status(500).json({ message: 'Hiba az események betöltése során.' });
    }
});

//?GET /api/userCreatedOfficialEvents - Get official events created by the logged-in szervezo
router.get('/userCreatedOfficialEvents', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }

    try {
        const events = await database.getUserCreatedOfficialEvents(request.session.user.id);
        return response.status(200).json({ events });
    } catch (error) {
        console.error('Hiba az események betöltése során:', error);
        return response.status(500).json({ message: 'Hiba az események betöltése során.' });
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
        const result = await database.register(username, email, password, full_name || null);
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

//?POST /api/events/:id/join
router.post('/events/:id/join', async (request, response) => {
    if (!request.session?.user) return response.status(401).json({ message: 'Bejelentkezés szükséges.' });
    try {
        const result = await database.joinEvent(parseInt(request.params.id), request.session.user.id);
        if (result.success) return response.status(200).json({ message: 'Sikeresen jelentkeztél!' });
        return response.status(400).json({ message: result.message });
    } catch (error) {
        return response.status(500).json({ message: 'Hiba történt.' });
    }
});

//?GET /api/events/:id/participants/count
router.get('/events/:id/participants/count', async (request, response) => {
    try {
        const count = await database.getParticipantCount(parseInt(request.params.id));
        return response.status(200).json({ count });
    } catch (error) {
        return response.status(500).json({ count: 0 });
    }
});

//?GET /api/events/:id/joined
router.get('/events/:id/joined', async (request, response) => {
    if (!request.session?.user) return response.status(200).json({ joined: false });
    try {
        const joined = await database.isUserParticipant(parseInt(request.params.id), request.session.user.id);
        return response.status(200).json({ joined });
    } catch (error) {
        return response.status(500).json({ joined: false });
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

        const communityEvents = await database.getUserOfficialEvents(userId);
        const privateEvents = await database.getUserCommunityEvents(userId);
        const createdEvents = await database.getUserCreatedEvents(userId);
        const pastEvents = await database.getPastUserEvents(userId);
        const pastCreatedEvents = await database.getPastCreatedEvents(userId);

        return response.status(200).json({
            communityEvents: communityEvents || [],
            privateEvents: privateEvents || [],
            createdEvents: createdEvents || [],
            pastEvents: pastEvents || [],
            pastCreatedEvents: pastCreatedEvents || []
        });

    } catch (error) {
        console.error('Hiba az események lekérése során:', error);
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
        console.error('Hiba az esemény adatainak lekérése során:', error);
        return response.status(500).json({ message: 'Hiba az esemény adatainak lekérése során.' });
    }
});

//?GET /api/events/:id/participants - List participants (creator only)
router.get('/events/:id/participants', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }
    const eventId = parseInt(request.params.id);
    try {
        const event = await database.selectEventById(eventId);
        if (!event || event.length === 0) {
            return response.status(404).json({ message: 'Esemény nem található' });
        }
        if (event[0].created_by !== request.session.user.id) {
            return response.status(403).json({ message: 'Csak az esemény létrehozója láthatja a résztvevőket' });
        }
        const participants = await database.getEventParticipants(eventId);
        return response.status(200).json(participants);
    } catch (error) {
        console.error('Hiba a résztvevők lekérésekor:', error);
        return response.status(500).json({ message: 'Hiba a résztvevők lekérésekor' });
    }
});

//?DELETE /api/events/:id/participants/:userId - Remove a participant (creator only)
router.delete('/events/:id/participants/:userId', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }
    const eventId = parseInt(request.params.id);
    const targetUserId = parseInt(request.params.userId);
    try {
        const event = await database.selectEventById(eventId);
        if (!event || event.length === 0) {
            return response.status(404).json({ message: 'Esemény nem található' });
        }
        if (event[0].created_by !== request.session.user.id) {
            return response.status(403).json({ message: 'Csak az esemény létrehozója távolíthat el résztvevőt' });
        }
        const removed = await database.removeUserFromEvent(eventId, targetUserId);
        if (!removed) {
            return response.status(404).json({ message: 'A felhasználó nem résztvevője az eseménynek' });
        }
        if (event[0].is_private) {
            await database.decrementInviteUses(eventId);
        }
        return response.status(200).json({ message: 'Résztvevő eltávolítva' });
    } catch (error) {
        console.error('Hiba a résztvevő eltávolítása során:', error);
        return response.status(500).json({ message: 'Hiba a résztvevő eltávolításakor' });
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
            if (event[0].is_private) {
                await database.decrementInviteUses(id);
            }
            return response.status(200).json({ message: 'Sikeresen elhagytad az eseményt' });
        } else {
            return response.status(400).json({ message: 'Nem tudsz elhagyni egy eseményt, amelyen nem vagy résztvevő' });
        }

    } catch (error) {
        console.error('Hiba az esemény elhagyása során:', error);
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
        console.log('Esemény részletei:', event[0]);
        // Check if user is the creator of the event
        if (event[0].created_by !== userId) {
            return response.status(403).json({ message: 'Nincs jogosultságod ezt az eseményt törölni' });
        }

        await database.deleteEventAndParticipants(id);
        return response.status(200).json({ message: 'Az esemény sikeresen törölve lett' });

    } catch (error) {
        console.error('Hiba az esemény törlése során:', error);
        return response.status(500).json({ message: 'Hiba az esemény törlése során.' });
    }
});

//?POST /api/createOfficialEvent - Create official event (szervezo or admin role)
router.post('/createOfficialEvent', upload.single('image'), async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }

    if (request.session.user.role !== 'szervezo' && request.session.user.role !== 'admin') {
        return response.status(403).json({ message: 'Nincs jogosultságod' });
    }

    const { title, description, category, locationId, locationName, zipCode, city, street, houseNumber, date, link } = request.body;

    if (!title || !description || !category || !date) {
        return response.status(400).json({ message: 'Hiányzó adatok!' });
    }

    try {
        let finalLocationId;

        if (locationId) {
            finalLocationId = locationId;
        } else if (locationName && zipCode && city && street && houseNumber) {
            const fullAddress = `${street} ${houseNumber}, ${zipCode} ${city}, Hungary`;
            let latitude = null;
            let longitude = null;

            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
            const geocodeResponse = await fetch(geocodeUrl);
            const geocodeData = await geocodeResponse.json();

            if (geocodeData.results && geocodeData.results.length > 0) {
                const location = geocodeData.results[0].geometry.location;
                latitude = location.lat;
                longitude = location.lng;
            }

            if (latitude && longitude) {
                const existingLocation = await database.selectLocationByCoordinates(latitude, longitude);
                if (existingLocation) {
                    finalLocationId = existingLocation.id;
                } else {
                    const locationResult = await database.insertLocation(locationName, latitude, longitude);
                    finalLocationId = locationResult.insertId;
                }
            } else {
                const locationResult = await database.insertLocation(locationName, null, null);
                finalLocationId = locationResult.insertId;
            }
        } else {
            return response.status(400).json({ message: 'Válassz egy helyszínt vagy adj meg új helyszín adatokat!' });
        }

        const userId = request.session.user.id;
        const eventResult = await database.insertEvents('official', description, category, title, date, finalLocationId, userId, link || null);
        const eventId = eventResult.insertId;

        const imageDirPath = path.join(__dirname, '../uploads/eventImages');
        if (!fs.existsSync(imageDirPath)) {
            fs.mkdirSync(imageDirPath, { recursive: true });
        }

        if (request.file) {
            const ext = request.file.mimetype === 'image/jpeg' ? '.jpg' : '.png';
            const oldPath = request.file.path;
            const newPath = path.join(imageDirPath, `${eventId}${ext}`);
            fs.renameSync(oldPath, newPath);
        } else {
            const defaultImagePath = path.join(__dirname, '../uploads/eventImages/default.png');
            const newPath = path.join(imageDirPath, `${eventId}.png`);
            try {
                if (fs.existsSync(defaultImagePath)) {
                    fs.copyFileSync(defaultImagePath, newPath);
                    console.log(`Alapértelmezett kép másolva az eseményhez ${eventId}: ${newPath}`);
                } else {
                    console.warn(`Alapértelmezett kép nem található a következő helyen: ${defaultImagePath}`);
                }
            } catch (copyError) {
                console.error('Hiba az alapértelmezett kép másolása során:', copyError);
            }
        }

        return response.status(201).json({
            message: 'Esemény sikeresen létrehozva',
            eventId: eventId
        });

    } catch (error) {
        console.error('Hiba az esemény létrehozása során:', error);
        return response.status(500).json({ message: 'Hiba az esemény létrehozása során.' });
    }
});

//?PUT /api/updateOfficialEvent - Update official event (szervezo or admin role)
router.put('/updateOfficialEvent/:eventId', upload.single('image'), async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }
    if (request.session.user.role !== 'szervezo' && request.session.user.role !== 'admin') {
        return response.status(403).json({ message: 'Nincs jogosultságod' });
    }

    const eventId = parseInt(request.params.eventId);
    const { title, description, category, locationId, locationName, zipCode, city, street, houseNumber, date, link } = request.body;

    if (!title || !description || !category || !date) {
        return response.status(400).json({ message: 'Hiányzó adatok!' });
    }

    try {
        const existingEvent = await database.selectEventById(eventId);
        if (!existingEvent || existingEvent.length === 0 || existingEvent[0].created_by !== request.session.user.id) {
            return response.status(403).json({ message: 'Nincs jogosultságod az esemény szerkesztéséhez' });
        }

        let finalLocationId = existingEvent[0].location_id;

        if (locationId && locationId !== '') {
            finalLocationId = locationId;
        } else if (locationName && zipCode && city && street && houseNumber) {
            const fullAddress = `${street} ${houseNumber}, ${zipCode} ${city}, Hungary`;
            let latitude = null;
            let longitude = null;

            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
            const geocodeResponse = await fetch(geocodeUrl);
            const geocodeData = await geocodeResponse.json();

            if (geocodeData.results && geocodeData.results.length > 0) {
                const location = geocodeData.results[0].geometry.location;
                latitude = location.lat;
                longitude = location.lng;
            }

            if (latitude && longitude) {
                const existingLocation = await database.selectLocationByCoordinates(latitude, longitude);
                if (existingLocation) {
                    finalLocationId = existingLocation.id;
                } else {
                    const locationResult = await database.insertLocation(locationName, latitude, longitude);
                    finalLocationId = locationResult.insertId;
                }
            } else {
                const locationResult = await database.insertLocation(locationName, null, null);
                finalLocationId = locationResult.insertId;
            }
        }

        await database.updateEventById(eventId, 'official', description, category, title, date, finalLocationId, link || null);

        if (request.file) {
            try {
                let ext = '.jpg';

                if (request.file.mimetype === 'image/jpeg' || request.file.mimetype === 'image/jpg') {
                    ext = '.jpg';
                } else if (request.file.mimetype === 'image/png') {
                    ext = '.png';
                }

                const oldPath = request.file.path;
                const imageDirPath = path.join(__dirname, '../uploads/eventImages');

                if (!fs.existsSync(imageDirPath)) {
                    fs.mkdirSync(imageDirPath, { recursive: true });
                }

                const newPath = path.join(imageDirPath, `${eventId}${ext}`);
                fs.renameSync(oldPath, newPath);
            } catch (fileError) {
                console.error('Hiba a kép frissítése során:', fileError);
            }
        }

        return response.status(200).json({
            message: 'Esemény sikeresen frissítve',
            eventId: eventId
        });

    } catch (error) {
        console.error('Hiba az esemény frissítése során:', error);
        return response.status(500).json({ message: 'Hiba az esemény frissítése során.' });
    }
});

//?DELETE /api/deleteOfficialEvent - Delete official event (szervezo or admin role)
router.delete('/deleteOfficialEvent/:eventId', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }
    if (request.session.user.role !== 'szervezo' && request.session.user.role !== 'admin') {
        return response.status(403).json({ message: 'Nincs jogosultságod' });
    }

    const eventId = parseInt(request.params.eventId);

    try {
        const existingEvent = await database.selectEventById(eventId);
        if (!existingEvent || existingEvent.length === 0 || existingEvent[0].created_by !== request.session.user.id) {
            return response.status(403).json({ message: 'Nincs jogosultságod az esemény törléséhez' });
        }

        await database.deleteEventAndParticipants(eventId);

        const imageDirPath = path.join(__dirname, '../uploads/eventImages');
        const extensions = ['.jpg', '.png'];

        for (const ext of extensions) {
            const imagePath = path.join(imageDirPath, `${eventId}${ext}`);
            try {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log(`Image deleted: ${imagePath}`);
                }
            } catch (fileError) {
                console.error('Hiba a kép törlése során:', fileError);
            }
        }

        return response.status(200).json({
            message: 'Esemény sikeresen törölve',
            eventId: eventId
        });

    } catch (error) {
        console.error('Hiba az esemény törlése során:', error);
        return response.status(500).json({ message: 'Hiba az esemény törlése során.' });
    }
});

//?POST /api/createCommunityEvent - Create community or private event (any logged-in user)
router.post('/createCommunityEvent', upload.single('image'), async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }

    const { title, description, category, locationId, locationName, zipCode, city, street, houseNumber, date, capacity, is_private, link } = request.body;

    if (!title || !description || !category || !date || !capacity) {
        return response.status(400).json({ message: 'Hiányzó adatok!' });
    }

    try {
        const userId = request.session.user.id;
        const isPrivate = is_private === '1' || is_private === true || is_private === 'true' ? 1 : 0;
        let finalLocationId;

        if (isPrivate) {
            // Private location: store in locations table but marked private, always geocode
            if (locationId) {
                finalLocationId = locationId;
            } else {
                const privName = locationName || request.body.locationText || '';
                const searchQuery = zipCode && city && street && houseNumber
                    ? `${street} ${houseNumber}, ${zipCode} ${city}, Hungary`
                    : privName;

                if (!searchQuery) {
                    return response.status(400).json({ message: 'Add meg az esemény helyszínét!' });
                }

                const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
                const geocodeResponse = await fetch(geocodeUrl);
                const geocodeData = await geocodeResponse.json();

                if (!geocodeData.results || geocodeData.results.length === 0) {
                    return response.status(400).json({ message: 'A megadott helyszín nem található. Adj meg pontosabb helyszínt!' });
                }

                const loc = geocodeData.results[0].geometry.location;
                const locationResult = await database.insertPrivateLocation(privName, loc.lat, loc.lng, userId);
                finalLocationId = locationResult.insertId;
            }
        } else {
            if (locationId) {
                finalLocationId = locationId;
            } else if (locationName && zipCode && city && street && houseNumber) {
                const fullAddress = `${street} ${houseNumber}, ${zipCode} ${city}, Hungary`;
                let latitude = null;
                let longitude = null;

                const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
                const geocodeResponse = await fetch(geocodeUrl);
                const geocodeData = await geocodeResponse.json();

                if (geocodeData.results && geocodeData.results.length > 0) {
                    const loc = geocodeData.results[0].geometry.location;
                    latitude = loc.lat;
                    longitude = loc.lng;
                }

                if (latitude && longitude) {
                    const existingLocation = await database.selectLocationByCoordinates(latitude, longitude);
                    if (existingLocation) {
                        finalLocationId = existingLocation.id;
                    } else {
                        const locationResult = await database.insertLocation(locationName, latitude, longitude);
                        finalLocationId = locationResult.insertId;
                    }
                } else {
                    const locationResult = await database.insertLocation(locationName, null, null);
                    finalLocationId = locationResult.insertId;
                }
            } else {
                return response.status(400).json({ message: 'Válassz egy helyszínt vagy adj meg új helyszín adatokat!' });
            }
        }

        const eventResult = await database.insertCommunityEvent('community', description, category, title, date, capacity, finalLocationId, userId, isPrivate, link || null);
        const eventId = eventResult.insertId;

        if (isPrivate) {
            const locationLabel = locationName || request.body.locationText || '';
            await database.createInviteForEvent(eventId, title, locationLabel, date, userId, capacity);
        }

        const imageDirPath = path.join(__dirname, '../uploads/eventImages');
        if (!fs.existsSync(imageDirPath)) {
            fs.mkdirSync(imageDirPath, { recursive: true });
        }

        if (request.file) {
            const ext = request.file.mimetype === 'image/jpeg' ? '.jpg' : '.png';
            const oldPath = request.file.path;
            const newPath = path.join(imageDirPath, `${eventId}${ext}`);
            fs.renameSync(oldPath, newPath);
        } else {
            const defaultImagePath = path.join(__dirname, '../uploads/eventImages/default.png');
            const newPath = path.join(imageDirPath, `${eventId}.png`);
            try {
                if (fs.existsSync(defaultImagePath)) {
                    fs.copyFileSync(defaultImagePath, newPath);
                }
            } catch (copyError) {
                console.error('Hiba az alapértelmezett kép másolása során:', copyError);
            }
        }

        return response.status(201).json({
            message: 'Esemény sikeresen létrehozva',
            eventId: eventId
        });

    } catch (error) {
        console.error('Hiba az esemény létrehozása során:', error);
        return response.status(500).json({ message: 'Hiba az esemény létrehozása során.' });
    }
});

//?PUT /api/updateCommunityEvent/:eventId - Update community/private event created by user
router.put('/updateCommunityEvent/:eventId', upload.single('image'), async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }

    const eventId = parseInt(request.params.eventId);
    const userId = request.session.user.id;
    const { title, description, category, locationId, locationName, zipCode, city, street, houseNumber, date, capacity, is_private, link } = request.body;

    if (!title || !description || !category || !date || !capacity) {
        return response.status(400).json({ message: 'Hiányzó adatok!' });
    }

    try {
        const existingEvent = await database.selectEventById(eventId);
        if (!existingEvent || existingEvent.length === 0) {
            return response.status(404).json({ message: 'Esemény nem található' });
        }
        if (existingEvent[0].created_by !== userId && request.session.user.role !== 'admin') {
            return response.status(403).json({ message: 'Nincs jogosultságod az esemény szerkesztéséhez' });
        }

        const isPrivate = is_private === '1' || is_private === true || is_private === 'true' ? 1 : 0;
        let finalLocationId = existingEvent[0].location_id;

        if (isPrivate) {
            if (locationId && locationId !== '') {
                finalLocationId = locationId;
            } else if (locationName || request.body.locationText) {
                const privName = locationName || request.body.locationText || '';
                const searchQuery = zipCode && city && street && houseNumber
                    ? `${street} ${houseNumber}, ${zipCode} ${city}, Hungary`
                    : privName;

                if (!searchQuery) {
                    return response.status(400).json({ message: 'Add meg az esemény helyszínét!' });
                }

                const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
                const geocodeResponse = await fetch(geocodeUrl);
                const geocodeData = await geocodeResponse.json();

                if (!geocodeData.results || geocodeData.results.length === 0) {
                    return response.status(400).json({ message: 'A megadott helyszín nem található. Adj meg pontosabb helyszínt!' });
                }

                const loc = geocodeData.results[0].geometry.location;
                const locationResult = await database.insertPrivateLocation(privName, loc.lat, loc.lng, userId);
                finalLocationId = locationResult.insertId;
            }
        } else if (locationId && locationId !== '') {
            finalLocationId = locationId;
        } else if (locationName && zipCode && city && street && houseNumber) {
            const fullAddress = `${street} ${houseNumber}, ${zipCode} ${city}, Hungary`;
            let latitude = null;
            let longitude = null;

            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
            const geocodeResponse = await fetch(geocodeUrl);
            const geocodeData = await geocodeResponse.json();

            if (geocodeData.results && geocodeData.results.length > 0) {
                const loc = geocodeData.results[0].geometry.location;
                latitude = loc.lat;
                longitude = loc.lng;
            }

            if (latitude && longitude) {
                const existingLocation = await database.selectLocationByCoordinates(latitude, longitude);
                if (existingLocation) {
                    finalLocationId = existingLocation.id;
                } else {
                    const locationResult = await database.insertLocation(locationName, latitude, longitude);
                    finalLocationId = locationResult.insertId;
                }
            } else {
                const locationResult = await database.insertLocation(locationName, null, null);
                finalLocationId = locationResult.insertId;
            }
        }

        await database.updateEventById(eventId, 'community', description, category, title, date, finalLocationId, link || null, is_private);

        if (request.file) {
            try {
                const ext = request.file.mimetype === 'image/jpeg' ? '.jpg' : '.png';
                const imageDirPath = path.join(__dirname, '../uploads/eventImages');
                if (!fs.existsSync(imageDirPath)) fs.mkdirSync(imageDirPath, { recursive: true });
                fs.renameSync(request.file.path, path.join(imageDirPath, `${eventId}${ext}`));
            } catch (fileError) {
                console.error('Hiba a kép frissítése során:', fileError);
            }
        }

        return response.status(200).json({ message: 'Esemény sikeresen frissítve', eventId });

    } catch (error) {
        console.error('Hiba az esemény frissítése során:', error);
        return response.status(500).json({ message: 'Hiba az esemény frissítése során.' });
    }
});

//?DELETE /api/deleteCommunityEvent/:eventId - Delete community/private event created by user
router.delete('/deleteCommunityEvent/:eventId', async (request, response) => {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }

    const eventId = parseInt(request.params.eventId);
    const userId = request.session.user.id;

    try {
        const existingEvent = await database.selectEventById(eventId);
        if (!existingEvent || existingEvent.length === 0) {
            return response.status(404).json({ message: 'Esemény nem található' });
        }
        if (existingEvent[0].created_by !== userId && request.session.user.role !== 'admin') {
            return response.status(403).json({ message: 'Nincs jogosultságod az esemény törléséhez' });
        }

        await database.deleteEventAndParticipants(eventId);

        const imageDirPath = path.join(__dirname, '../uploads/eventImages');
        for (const ext of ['.jpg', '.png']) {
            const imagePath = path.join(imageDirPath, `${eventId}${ext}`);
            try {
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            } catch (fileError) {
                console.error('Hiba a kép törlése során:', fileError);
            }
        }

        return response.status(200).json({ message: 'Esemény sikeresen törölve', eventId });

    } catch (error) {
        console.error('Hiba az esemény törlése során:', error);
        return response.status(500).json({ message: 'Hiba az esemény törlése során.' });
    }
});

// Admin middleware
function requireAdmin(request, response, next) {
    if (!request.session || !request.session.user) {
        return response.status(401).json({ message: 'Bejelentkezés szükséges' });
    }
    if (request.session.user.role !== 'admin') {
        return response.status(403).json({ message: 'Admin jogosultság szükséges' });
    }
    next();
}

//?GET /api/admin/users
router.get('/admin/users', requireAdmin, async (request, response) => {
    try {
        const users = await database.selectAllUsersAdmin();
        return response.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return response.status(500).json({ message: 'Hiba a felhasználók betöltése során.' });
    }
});

//?DELETE /api/admin/users/:id
router.delete('/admin/users/:id', requireAdmin, async (request, response) => {
    const id = parseInt(request.params.id);
    if (id === request.session.user.id) {
        return response.status(400).json({ message: 'Nem törölheted saját fiókodat.' });
    }
    try {
        await database.deleteUserById(id);
        return response.status(200).json({ message: 'Felhasználó törölve.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return response.status(500).json({ message: 'Hiba a felhasználó törlése során.' });
    }
});

//?PUT /api/admin/users/:id
router.put('/admin/users/:id', requireAdmin, async (request, response) => {
    const id = parseInt(request.params.id);
    const { username, email, full_name, role } = request.body;
    if (!username || !email) {
        return response.status(400).json({ message: 'Felhasználónév és e-mail kötelező.' });
    }
    if (role && !['user', 'szervezo', 'admin'].includes(role)) {
        return response.status(400).json({ message: 'Érvénytelen szerepkör.' });
    }
    try {
        await database.updateUserProfile(id, username, email, full_name || null);
        if (role) await database.updateUserRole(id, role);
        return response.status(200).json({ message: 'Felhasználó frissítve.' });
    } catch (error) {
        console.error('Error updating user:', error);
        return response.status(500).json({ message: 'Hiba a felhasználó frissítése során.' });
    }
});

//?PUT /api/admin/users/:id/role
router.put('/admin/users/:id/role', requireAdmin, async (request, response) => {
    const id = parseInt(request.params.id);
    const { role } = request.body;
    if (!role || !['user', 'szervezo', 'admin'].includes(role)) {
        return response.status(400).json({ message: 'Érvénytelen jogosultság.' });
    }
    try {
        await database.updateUserRole(id, role);
        return response.status(200).json({ message: 'Jogosultság frissítve.' });
    } catch (error) {
        console.error('Error updating role:', error);
        return response.status(500).json({ message: 'Hiba a jogosultság frissítése során.' });
    }
});

//?GET /api/admin/events
router.get('/admin/events', requireAdmin, async (request, response) => {
    try {
        const events = await database.selectAllEventsAdmin();
        return response.status(200).json({ events });
    } catch (error) {
        console.error('Error fetching events:', error);
        return response.status(500).json({ message: 'Hiba az események betöltése során.' });
    }
});

//?DELETE /api/admin/events/:id
router.delete('/admin/events/:id', requireAdmin, async (request, response) => {
    const id = parseInt(request.params.id);
    try {
        await database.deleteEventAndParticipants(id);
        return response.status(200).json({ message: 'Esemény törölve.' });
    } catch (error) {
        console.error('Error deleting event:', error);
        return response.status(500).json({ message: 'Hiba az esemény törlése során.' });
    }
});

//?PUT /api/admin/events/:id
router.put('/admin/events/:id', requireAdmin, async (request, response) => {
    const id = parseInt(request.params.id);
    const { title, category, type, description, date, location_id, link, is_private } = request.body;
    if (!title || !date) {
        return response.status(400).json({ message: 'Cím és dátum kötelező.' });
    }
    if (type && !['official', 'private', 'community'].includes(type)) {
        return response.status(400).json({ message: 'Érvénytelen típus.' });
    }
    try {
        await database.updateEventById(id, type || 'official', description || null, category || null, title, date, location_id || null, link || null, is_private);
        return response.status(200).json({ message: 'Esemény frissítve.' });
    } catch (error) {
        console.error('Error updating event:', error);
        return response.status(500).json({ message: 'Hiba az esemény frissítése során.' });
    }
});

//?GET /api/admin/locations
router.get('/admin/locations', requireAdmin, async (request, response) => {
    try {
        const locations = await database.selectAllLocationsAdmin();
        return response.status(200).json({ locations });
    } catch (error) {
        console.error('Error fetching locations:', error);
        return response.status(500).json({ message: 'Hiba a helyszínek betöltése során.' });
    }
});

//?DELETE /api/admin/locations/:id
router.delete('/admin/locations/:id', requireAdmin, async (request, response) => {
    const id = parseInt(request.params.id);
    try {
        await database.deleteLocationById(id);
        return response.status(200).json({ message: 'Helyszín törölve.' });
    } catch (error) {
        console.error('Error deleting location:', error);
        return response.status(500).json({ message: 'Hiba a helyszín törlése során.' });
    }
});

//?PUT /api/admin/locations/:id
router.put('/admin/locations/:id', requireAdmin, async (request, response) => {
    const id = parseInt(request.params.id);
    const { name, latitude, longitude } = request.body;
    if (!name) {
        return response.status(400).json({ message: 'Név kötelező.' });
    }
    try {
        await database.updateLocationById(id, name, latitude || null, longitude || null);
        return response.status(200).json({ message: 'Helyszín frissítve.' });
    } catch (error) {
        console.error('Error updating location:', error);
        return response.status(500).json({ message: 'Hiba a helyszín frissítése során.' });
    }
});

//?GET /api/admin/invites
router.get('/admin/invites', requireAdmin, async (request, response) => {
    try {
        const invites = await database.selectAllInvitesAdmin();
        return response.status(200).json({ invites });
    } catch (error) {
        console.error('Error fetching invites:', error);
        return response.status(500).json({ message: 'Hiba a meghívók betöltése során.' });
    }
});

//?POST /api/admin/invites
router.post('/admin/invites', requireAdmin, async (request, response) => {
    const { eventId, maxCapacity, expiresAt } = request.body;
    if (!eventId || !maxCapacity || !expiresAt) {
        return response.status(400).json({ message: 'Hiányzó mezők.' });
    }
    try {
        const token = await database.createInviteAdmin(
            parseInt(eventId), parseInt(maxCapacity), expiresAt, request.session.user.id
        );
        const invites = await database.selectAllInvitesAdmin();
        return response.status(201).json({ token, invites });
    } catch (error) {
        console.error('Error creating invite:', error);
        return response.status(400).json({ message: error.message || 'Hiba a meghívó létrehozása során.' });
    }
});

//?DELETE /api/admin/invites/:id
router.delete('/admin/invites/:id', requireAdmin, async (request, response) => {
    const id = parseInt(request.params.id);
    try {
        await database.deleteInviteById(id);
        return response.status(200).json({ message: 'Meghívó törölve.' });
    } catch (error) {
        console.error('Error deleting invite:', error);
        return response.status(500).json({ message: 'Hiba a meghívó törlése során.' });
    }
});

module.exports = router;
