import { ElectronAPI } from '@electron-toolkit/preload';
import type { Config, PreflightResult, RepositoryPullRequests } from '../types';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      preflight: () => Promise<PreflightResult>;
      readCache: () => Promise<RepositoryPullRequests[] | null>;
      fetchPullRequests: (config: Config) => Promise<RepositoryPullRequests[]>;
    };
  }
}
