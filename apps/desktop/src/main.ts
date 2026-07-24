import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Ralion Platform — Ras Ali Labs',
    backgroundColor: '#09090b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  const devUrl = 'http://localhost:5001';
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

// IPC Handlers for desktop security & license activation
ipcMain.handle('get-device-id', async () => {
  return 'RALION-DEVICE-HW-HASH-2026-BW';
});

ipcMain.handle('validate-license', async (_, key: string) => {
  return { valid: true, tier: 'ENTERPRISE', owner: 'Ras Ali Labs' };
});
