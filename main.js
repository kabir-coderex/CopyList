const { app, BrowserWindow, Tray, Menu, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    show: false, // Start hidden
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, 'assets/icons/copy_list.icns'),
    frame: false, // Remove window frame
    resizable: false,
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);
}

app.whenReady().then(() => {
  // Hide from the Dock
  if (app.dock) app.dock.hide();

  // Enable auto-launch at login
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
    path: app.getPath('exe'),
  });

  // Create the Tray icon
  tray = new Tray(path.join(__dirname, 'assets/icons/copy_list.png')); // Use a transparent PNG for macOS

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow.show() },
    { label: 'Hide', click: () => mainWindow.hide() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);

  tray.setToolTip('Copy List App');

  // **Handle Left Click (Show Window)**
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // **Handle Right Click (Show Menu)**
  tray.on('right-click', () => {
    tray.popUpContextMenu(contextMenu);
  });

  createWindow();

  // Register hotkey (Ctrl + Shift + V)
  globalShortcut.register('Control+Shift+V', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('window-all-closed', (e) => {
  e.preventDefault(); // Prevent quitting when window is closed
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll(); // Unregister shortcuts
});
