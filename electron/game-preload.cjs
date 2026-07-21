const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (_event, action) => callback(action));
  },
  getVersion: () => ipcRenderer.invoke('get-game-version'),
});

contextBridge.exposeInMainWorld('gamePlatformAPI', {
  closeGame: () => ipcRenderer.invoke('close-game'),
});
