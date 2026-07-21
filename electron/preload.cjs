const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('platformAPI', {
  getGames: () => ipcRenderer.invoke('get-games'),
  openGame: (gameId) => ipcRenderer.invoke('open-game', gameId),
  addGame: () => ipcRenderer.invoke('add-game'),
  removeGame: (gameId) => ipcRenderer.invoke('remove-game', gameId),
  getGamesPath: () => ipcRenderer.invoke('get-games-path'),
});
