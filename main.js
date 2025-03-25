const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, 'assets/icons/copy_list.icns'),
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Register hotkey (Ctrl + Shift + V)
  globalShortcut.register('Control+Shift+V', () => {
    if (mainWindow.isVisible()) {
      mainWindow.show();  // Show the window if it's hidden
    } else {
      mainWindow.show();  // Show the window if it's not open
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  // Unregister the hotkey when the app quits
  globalShortcut.unregisterAll();
});
