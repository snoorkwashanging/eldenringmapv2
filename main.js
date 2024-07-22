const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const windowStateKeeper = require('electron-window-state');
const fs = require('fs');
const path = require('path');

let config;
let mainWindow;

// Funktion zum Laden der Konfigurationsdatei
function loadConfig() {
  const data = fs.readFileSync('config.json');
  config = JSON.parse(data);
}

function createWindow () {
  let mainWindowState = windowStateKeeper({
    defaultHeight: 800,
    defaultWidth: 800,
    path: ".\\"
  });

  mainWindow = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    icon: path.join(__dirname, './assets/icons/icon256.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: __dirname + "/preload.js"
    }
  });

  mainWindowState.manage(mainWindow);
  Menu.setApplicationMenu(null);

  // Lade die gewünschte URL
  mainWindow.loadURL('https://eldenring.wiki.fextralife.com/Interactive+Map');

  // Registriere globale Tastaturkürzel
  registerGlobalShortcuts(mainWindow);
}

function registerGlobalShortcuts() {
  for (const action in config.keyMappings) {
    globalShortcut.register(config.keyMappings[action], () => {
      console.log(`Global shortcut for ${action} pressed`);
      const sendAction = action;
      console.log("Sending: " + sendAction);
      mainWindow.webContents.send("key-event", {
        action: sendAction,
        panSpeed: config.panSpeed,
        zoomSpeed: config.zoomSpeed
      });
    });
  }
}

app.on('ready', () => {
  loadConfig();
  createWindow();
});

app.on('window-all-closed', () => {
  // Beende die App, wenn alle Fenster geschlossen sind
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // Erstelle ein neues Fenster, wenn die App aktiviert wird und keine Fenster geöffnet sind
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Deregistriere alle globalen Tastaturkürzel
  globalShortcut.unregisterAll();
});
