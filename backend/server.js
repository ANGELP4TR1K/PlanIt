//!Module-ok importálása
const express = require('express'); //?npm install express
const session = require('express-session'); //?npm install express-session
const MySQLStore = require('express-mysql-session')(session); //?npm install express-mysql-session
const path = require('path');
require('dotenv').config(); //?npm install dotenv

//!Beállítások
const app = express();
const router = express.Router();

const ip = '127.0.0.1';
const port = 3000;

app.use(express.json()); //?Middleware JSON
app.set('trust proxy', 1); //?Middleware Proxy

//!Statikus képek route
app.use('/api/images', express.static(path.join(__dirname, '../frontend/images')));

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

router.get('/profile', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/profile.html'));
  
router.get('/felfedezes', (request, response) => {
    response.sendFile(path.join(__dirname, '../frontend/html/felfedezes.html'));
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

//!Szerver futtatása
app.use(express.static(path.join(__dirname, '../frontend'))); //?frontend mappa tartalmának betöltése az oldal működéséhez
app.listen(port, ip, () => {
    console.log(`Szerver elérhetősége: http://${ip}:${port}`);
});

//?Szerver futtatása terminalból: npm run dev
//?Szerver leállítása (MacBook és Windows): Control + C
//?Terminal ablak tartalmának törlése (MacBook): Command + K
