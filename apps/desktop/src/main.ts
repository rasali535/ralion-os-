import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  Tray,
  nativeImage,
  Notification,
  shell,
  dialog
} from 'electron';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import Store from 'electron-store';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

// ─── Globals ───────────────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const store = new Store<{
  licenseKey: string;
  deviceId: string;
  lastLicenseCheck: number;
  session: { token: string; userId: string; orgId: string } | null;
  offlinePendingActions: any[];
}>();

const RALION_API = process.env.RALION_API_URL || 'https://ralion.rasalilabs.com';
const OFFLINE_GRACE_DAYS = 7;

log.transports.file.level = 'info';
log.transports.console.level = 'debug';
autoUpdater.logger = log;

// ─── Hardware Device ID ─────────────────────────────────────────────────────────
function getDeviceId(): string {
  const cached = store.get('deviceId');
  if (cached) return cached;

  const raw = `${os.hostname()}-${os.platform()}-${os.arch()}-${os.cpus()[0]?.model || 'cpu'}`;
  const id = 'RALION-' + crypto.createHash('sha256').update(raw).digest('hex').slice(0, 24).toUpperCase();
  store.set('deviceId', id);
  return id;
}

// ─── License Validation ─────────────────────────────────────────────────────────
async function validateLicense(key: string): Promise<{
  valid: boolean;
  edition?: string;
  orgName?: string;
  expiresAt?: string;
  features?: string[];
  error?: string;
}> {
  try {
    const deviceId = getDeviceId();
    const res = await fetch(`${RALION_API}/api/license/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: key, deviceId, platform: process.platform }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();

    // Cache successful validation timestamp
    store.set('lastLicenseCheck', Date.now());
    return data;
  } catch (err: any) {
    log.warn('[License] Could not reach server, checking offline grace period...', err.message);

    const lastCheck = store.get('lastLicenseCheck') || 0;
    const daysSinceCheck = (Date.now() - lastCheck) / (1000 * 60 * 60 * 24);

    if (lastCheck > 0 && daysSinceCheck < OFFLINE_GRACE_DAYS) {
      log.info(`[License] Offline grace period active. ${Math.floor(OFFLINE_GRACE_DAYS - daysSinceCheck)} days remaining.`);
      return {
        valid: true,
        edition: 'offline_grace',
        orgName: 'Offline Mode',
        error: `Offline — ${Math.floor(OFFLINE_GRACE_DAYS - daysSinceCheck)} grace days remaining`
      };
    }

    return { valid: false, error: 'Cannot verify license. Please connect to the internet.' };
  }
}

// ─── Window Creation ────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'Ralion — Empowered to Prosper',
    backgroundColor: '#09090b',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: process.platform !== 'win32',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Load the Ralion web app
  const isProd = process.env.NODE_ENV === 'production';
  const appUrl = isProd
    ? 'https://app.rasalilabs.com'
    : (process.env.ELECTRON_START_URL || 'http://localhost:3000');

  mainWindow.loadURL(appUrl);

  // Inject desktop context flag
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.executeJavaScript(
      `window.__RALION_DESKTOP__ = true; window.__RALION_VERSION__ = '${app.getVersion()}';`
    );
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  // Setup auto-updater after window is ready
  setupAutoUpdater();
}

// ─── System Tray ───────────────────────────────────────────────────────────────
function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../assets/tray-icon.png'));
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Ralion — Empowered to Prosper', enabled: false },
    { type: 'separator' },
    { label: 'Open Ralion', click: () => { mainWindow?.show(); mainWindow?.focus(); } },
    { label: 'Check for Updates', click: () => autoUpdater.checkForUpdatesAndNotify() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setToolTip('Ralion Platform by Ras Ali Labs');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => { mainWindow?.show(); mainWindow?.focus(); });
}

// ─── Auto Updater ──────────────────────────────────────────────────────────────
function setupAutoUpdater() {
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: `${RALION_API}/api/version/releases`,
  });

  autoUpdater.on('update-available', (info) => {
    log.info('[Updater] Update available:', info.version);
    if (Notification.isSupported()) {
      new Notification({
        title: 'Ralion Update Available',
        body: `Version ${info.version} is downloading in the background.`,
      }).show();
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update Ready',
      message: `Ralion ${info.version} is ready to install. Restart now?`,
      buttons: ['Restart Now', 'Later'],
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on('error', (err) => log.error('[Updater] Error:', err));

  // Check on startup + every 4 hours
  setTimeout(() => autoUpdater.checkForUpdatesAndNotify(), 5000);
  setInterval(() => autoUpdater.checkForUpdatesAndNotify(), 4 * 60 * 60 * 1000);
}

// ─── Application Menu ──────────────────────────────────────────────────────────
function buildAppMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Ralion',
      submenu: [
        { label: 'About Ralion', role: 'about' },
        { type: 'separator' },
        { label: 'Check for Updates', click: () => autoUpdater.checkForUpdatesAndNotify() },
        { type: 'separator' },
        { label: 'Quit Ralion', accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4', role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' }, { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Ras Ali Labs Support', click: () => shell.openExternal('https://rasalilabs.com/support') },
        { label: 'Documentation', click: () => shell.openExternal('https://docs.rasalilabs.com') },
        { type: 'separator' },
        { label: 'View Logs', click: () => shell.showItemInFolder(log.transports.file.getFile().path) },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ─── IPC Handlers ──────────────────────────────────────────────────────────────
function registerIpcHandlers() {
  // Device identity
  ipcMain.handle('get-device-id', () => getDeviceId());

  // Platform info
  ipcMain.handle('get-platform-info', () => ({
    platform: process.platform,
    arch: process.arch,
    version: app.getVersion(),
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    osVersion: os.release(),
    hostname: os.hostname(),
  }));

  // License validation
  ipcMain.handle('validate-license', async (_, key: string) => {
    return validateLicense(key);
  });

  // License activation (bind device)
  ipcMain.handle('activate-license', async (_, key: string) => {
    try {
      const deviceId = getDeviceId();
      const res = await fetch(`${RALION_API}/api/license/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: key,
          deviceId,
          deviceName: os.hostname(),
          platform: process.platform,
        }),
      });
      const data = await res.json();
      if (data.success) {
        store.set('licenseKey', key);
        store.set('lastLicenseCheck', Date.now());
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // License deactivation
  ipcMain.handle('deactivate-license', async () => {
    const key = store.get('licenseKey');
    const deviceId = getDeviceId();
    if (!key) return { success: false, error: 'No license stored' };
    try {
      const res = await fetch(`${RALION_API}/api/license/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: key, deviceId }),
      });
      store.delete('licenseKey');
      return res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Offline status
  ipcMain.handle('get-offline-status', () => {
    const lastCheck = store.get('lastLicenseCheck') || 0;
    const daysSince = (Date.now() - lastCheck) / (1000 * 60 * 60 * 24);
    return {
      isOffline: !navigator?.onLine ?? false,
      graceDaysRemaining: Math.max(0, Math.floor(OFFLINE_GRACE_DAYS - daysSince)),
      lastSyncTimestamp: new Date(lastCheck).toISOString(),
      pendingActions: (store.get('offlinePendingActions') || []).length,
    };
  });

  // Store offline action
  ipcMain.handle('queue-offline-action', (_, action: any) => {
    const pending = store.get('offlinePendingActions') || [];
    pending.push({ ...action, queuedAt: new Date().toISOString() });
    store.set('offlinePendingActions', pending);
    return { queued: true, total: pending.length };
  });

  // Get pending offline actions (for sync)
  ipcMain.handle('get-pending-actions', () => {
    return store.get('offlinePendingActions') || [];
  });

  // Clear synced actions
  ipcMain.handle('clear-synced-actions', (_, syncedIds: string[]) => {
    const pending = (store.get('offlinePendingActions') || []).filter(
      (a: any) => !syncedIds.includes(a.id)
    );
    store.set('offlinePendingActions', pending);
    return { remaining: pending.length };
  });

  // Show native notification
  ipcMain.handle('show-notification', (_, { title, body }: { title: string; body: string }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  });

  // Check for updates manually
  ipcMain.handle('check-updates', () => autoUpdater.checkForUpdatesAndNotify());

  // Open file in OS
  ipcMain.handle('open-external', (_, url: string) => shell.openExternal(url));
}

// ─── App Lifecycle ─────────────────────────────────────────────────────────────
// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    log.info(`[Ralion Desktop] Starting v${app.getVersion()} on ${process.platform}`);
    registerIpcHandlers();
    buildAppMenu();
    createTray();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('before-quit', () => {
    log.info('[Ralion Desktop] Application quitting...');
  });
}
