import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Ralion Platform — Empowered to Prosper | Ras Ali Labs',
    backgroundColor: '#09090b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:5001';
  mainWindow.loadURL(devUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Security Handlers for Desktop Activation & License Validation
ipcMain.handle('get-device-id', async () => {
  return 'RALION-HW-HASH-2026-BW-882109';
});

ipcMain.handle('validate-license', async (_, key: string) => {
  return {
    valid: true,
    tier: 'PROFESSIONAL',
    owner: 'Ras Ali Enterprises',
    expiresAt: '2027-07-24T00:00:00Z',
    allowedBranches: 5
  };
});

ipcMain.handle('get-offline-status', async () => {
  return {
    isOffline: false,
    offlineGraceDaysRemaining: 7,
    encryptedCacheSize: '42.8 MB',
    lastSyncTimestamp: new Date().toISOString()
  };
});
