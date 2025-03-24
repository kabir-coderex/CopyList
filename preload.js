const { contextBridge, ipcRenderer } = require('electron');
const clipboardy = require('clipboardy');

// Expose methods to the renderer process
contextBridge.exposeInMainWorld('electron', {
  getClipboardContent: () => clipboardy.readSync(),
  writeToClipboard: (content) => clipboardy.writeSync(content),
  sendClipboardContent: (content) => ipcRenderer.send('new-clipboard', content),
  onClipboardChange: (callback) => ipcRenderer.on('new-clipboard', callback),
});
