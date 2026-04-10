import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

const api = {
  preflight: (): Promise<import('../types').PreflightResult> => ipcRenderer.invoke('preflight'),
  readCache: (): Promise<import('../types').RepositoryPullRequests[] | null> =>
    ipcRenderer.invoke('read-cache'),
  cacheAge: (): Promise<number> => ipcRenderer.invoke('cache-age'),
  fetchPullRequests: (
    config: import('../types').Config,
  ): Promise<import('../types').FetchResult> =>
    ipcRenderer.invoke('fetch-pull-requests', config),
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-expect-error global augmentation
  window.electron = electronAPI;
  // @ts-expect-error global augmentation
  window.api = api;
}
