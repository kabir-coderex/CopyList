const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { checkForUpdates } = require("./updateManager");


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
    frame: true, // Allow window frame
    resizable: true, // Allow window resizing
    maximizable: false, // Prevent maximize button
    fullscreenable: true, // Prevent fullscreen button
    title: 'Copy List App',
  });

  // Handle the close event to hide the window instead of quitting the app
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide(); // Hide the window when close is clicked
    }
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Minimize button functionality
  ipcMain.on('minimize', () => {
    mainWindow.minimize();
  });

  // Maximize/Fullscreen button functionality
  ipcMain.on('fullscreen', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  });

  // Quit/Hide button functionality
  ipcMain.on('quit', () => {
    app.isQuiting = true;
    app.quit(); // Quit the app if 'Quit' is selected from tray
  });

  // Handle window movement
  ipcMain.on('move-window', (event, { x, y }) => {
    const bounds = mainWindow.getBounds();
    mainWindow.setBounds({
      x: bounds.x + x,
      y: bounds.y + y,
      width: bounds.width,
      height: bounds.height
    });
  });

  // Hide the window when it loses focus (click outside)
  mainWindow.on('blur', () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.hide();
    }
  });
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
    { label: "Update Copy List", click: () => checkForUpdates(tray) },
    { label: 'Quit', click: () => {
        app.isQuiting = true;
        app.quit(); // Quit the app if 'Quit' is selected from tray
      } 
    }
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

  // Register hotkey (Ctrl + V)
  globalShortcut.register('Control+G', () => {
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
