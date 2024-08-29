const { app, BrowserWindow, Menu, globalShortcut, dialog } = require('electron');
const windowStateKeeper = require('electron-window-state');
const fs = require('fs');
const path = require('path');

let config;
let mainWindow;

function loadConfig() {  
  const configPath = path.join(app.getAppPath(), "config.json");

  try {
    const data = fs.readFileSync(configPath, "utf8");
    config = JSON.parse(data);
  } catch {
    dialog.showMessageBoxSync(mainWindow, { message: `Failed to find config in: ${configPath}` });
    app.exit(0);
  }
}

function createWindow () {
  let mainWindowState = windowStateKeeper({
    defaultHeight: 1000,
    defaultWidth: 1000,
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

  mainWindow.loadURL('https://eldenring.wiki.fextralife.com/Interactive+Map');
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
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
