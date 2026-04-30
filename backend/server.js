//!Module-ok importálása
require('dotenv').config(); //?npm install dotenv - Load environment variables
const express = require('express'); //?npm install express
const session = require('express-session'); //?npm install express-session
const MySQLStore = require('express-mysql-session')(session); //?npm install express-mysql-session
const path = require('path');
const fs = require('fs');
require('dotenv').config(); //?npm install dotenv

//!Beállítások
const app = express();
const router = express.Router();

const ip = '127.0.0.1';
const port = 3000;

app.use(express.json()); //?Middleware JSON
app.set('trust proxy', 1); //?Middleware Proxy

//!Statikus képek route
app.get('/api/images/:id', (req, res) => {
    const imageDir = path.join(__dirname, 'uploads/eventImages');
    const extensions = ['.jpg', '.png'];

    for (const ext of extensions) {
        const filePath = path.join(imageDir, req.params.id + ext);
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }
    }

    res.status(404).json({ error: 'Image not found' });
});

app.use('/api/categories', express.static(path.join(__dirname, 'uploads/categories')));

app.use('/api/devpictures', express.static(path.join(__dirname, 'uploads/devPictures')));

//!Session beállítása:
app.use(
    session({
        key: 'planit_session',
        secret: 'titkos_kulcs', //?Ezt generálni kell a későbbiekben
        store: new MySQLStore({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: '',
            database: 'planit'
        }),
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }
    })
);

//!Routing
//?Főoldal:
router.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/home.html'));
});

//?Jelszó újítása oldal:
router.get('/reset-password', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/home.html'));
});

router.get('/profile', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/profile.html'));
});
  
router.get('/felfedezes', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/felfedezes.html'));
});

router.get('/esemenyeim', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/esemenyeim.html'));
});

router.get('/szervezo', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/szervezo.html'));
});

router.get('/rolunk', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/rolunk.html'));
});

//?Config endpoint for frontend
app.get('/config', (req, res) => {
    res.json({
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    });
});


//!API endpoints
app.use('/', router);
const endpoints = require('./api/api.js');
app.use('/api', endpoints);

//!Static file serving
app.use(express.static(path.join(__dirname, '../frontend'))); //?frontend mappa tartalmának betöltése az oldal működéséhez
app.use('/uploads', express.static(path.join(__dirname, './uploads'))); //?uploads mappa kiszolgálása statikus fájlokként

//!Szerver futtatása
app.listen(port, ip, () => {
    console.log(`Szerver elérhetősége: http://${ip}:${port}`);
});

//?Szerver futtatása terminalból: npm run dev
//?Szerver leállítása (MacBook és Windows): Control + C
//?Terminal ablak tartalmának törlése (MacBook): Command + K