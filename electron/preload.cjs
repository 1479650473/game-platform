const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('platformAPI', {
  getGames: () => ipcRenderer.invoke('get-games'),
  openGame: (gameId) => ipcRenderer.invoke('open-game', gameId),
  addGame: () => ipcRenderer.invoke('add-game'),
  removeGame: (gameId) => ipcRenderer.invoke('remove-game', gameId),
  getGamesPath: () => ipcRenderer.invoke('get-games-path'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getUpdateStatus: () => ipcRenderer.invoke('get-update-status'),
  onUpdateStatusChanged: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('update-status-changed', handler);
    return () => ipcRenderer.removeListener('update-status-changed', handler);
  },
  checkGameUpdates: () => ipcRenderer.invoke('check-game-updates'),
  updateGame: (gameId) => ipcRenderer.invoke('update-game', gameId),
  onGameUpdateProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('game-update-progress', handler);
    return () => ipcRenderer.removeListener('game-update-progress', handler);
  },
});
