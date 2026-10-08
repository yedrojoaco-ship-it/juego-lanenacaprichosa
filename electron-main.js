// electron-main.js — Ventana local para el juego (requiere `npm install` previo).
const { app, BrowserWindow } = require('electron');
const path = require('path');

function crear() {
  const win = new BrowserWindow({
    width: 1020,
    height: 700,
    backgroundColor: '#0d0714',
    autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false },
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(crear);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
