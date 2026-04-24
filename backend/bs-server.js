const browserSync = require('browser-sync').create();
const chokidar = require('chokidar');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '../frontend');
const BACKEND_DIR = __dirname; // backend folder

browserSync.init({
  proxy: '127.0.0.1:3000',
  port: 3001,
  ui: false,
  online: false,
  open: true,
  notify: false
});

// Watch frontend files: reload immediately
chokidar
  .watch(path.join(FRONTEND_DIR, '**/*.*'), { ignoreInitial: true })
  .on('change', (file) => {
    browserSync.reload();
  });

// Watch backend files: delay reload to allow nodemon to restart the server
chokidar
  .watch([
    path.join(BACKEND_DIR, '**/*.js'),
    '!' + path.join(BACKEND_DIR, 'node_modules/**'),
    '!' + path.join(BACKEND_DIR, 'bs-server.js')
  ], { ignoreInitial: true })
  .on('change', (file) => {
    setTimeout(() => {
      browserSync.reload();
    }, 1000);
  });

// BrowserSync server started (proxy 127.0.0.1:3000)