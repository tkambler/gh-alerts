import { ElectronAPI } from '@electron-toolkit/preload';
import type { Config, FetchResult, PreflightResult, RepositoryPullRequests } from '../types';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      preflight: () => Promise<PreflightResult>;
      readCache: () => Promise<RepositoryPullRequests[] | null>;
      cacheAge: () => Promise<number>;
      fetchPullRequests: (config: Config) => Promise<FetchResult>;
    };
  }
}
