const { autoUpdater } = require('electron-updater');
const { BrowserWindow } = require('electron');

let platformWindow = null;
let updateStatus = { state: 'idle', info: null, progress: null, error: null };
let listeners = new Set();

function notifyFrontend(data) {
  const win = platformWindow || (BrowserWindow.getAllWindows().length > 0 ? BrowserWindow.getAllWindows()[0] : null);
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-status-changed', data);
  }
}

function initAutoUpdater(mainWindow) {
  platformWindow = mainWindow;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('checking-for-update', () => {
    updateStatus = { state: 'checking', info: null, progress: null, error: null };
    notifyFrontend(updateStatus);
  });

  autoUpdater.on('update-available', (info) => {
    updateStatus = { state: 'available', info, progress: null, error: null };
    notifyFrontend(updateStatus);
  });

  autoUpdater.on('update-not-available', () => {
    updateStatus = { state: 'uptodate', info: null, progress: null, error: null };
    notifyFrontend(updateStatus);
  });

  autoUpdater.on('download-progress', (progress) => {
    updateStatus = { state: 'downloading', info: updateStatus.info, progress, error: null };
    notifyFrontend(updateStatus);
  });

  autoUpdater.on('update-downloaded', (info) => {
    updateStatus = { state: 'downloaded', info, progress: { percent: 100 }, error: null };
    notifyFrontend(updateStatus);
  });

  autoUpdater.on('error', (err) => {
    updateStatus = { state: 'error', info: updateStatus.info, progress: null, error: err.message };
    notifyFrontend(updateStatus);
  });
}

function checkForUpdates() {
  return autoUpdater.checkForUpdates().catch((err) => {
    updateStatus = { state: 'error', info: null, progress: null, error: err.message };
    notifyFrontend(updateStatus);
  });
}

function downloadUpdate() {
  return autoUpdater.downloadUpdate().catch((err) => {
    updateStatus = { state: 'error', info: updateStatus.info, progress: null, error: err.message };
    notifyFrontend(updateStatus);
  });
}

function installUpdate() {
  autoUpdater.quitAndInstall(false, true);
}

function getUpdateStatus() {
  return updateStatus;
}

module.exports = { initAutoUpdater, checkForUpdates, downloadUpdate, installUpdate, getUpdateStatus };
