import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ralionDesktop', {
  getDeviceId: () => ipcRenderer.invoke('get-device-id'),
  validateLicense: (key: string) => ipcRenderer.invoke('validate-license', key),
  getOfflineStatus: () => ipcRenderer.invoke('get-offline-status'),
  isDesktop: true
});
