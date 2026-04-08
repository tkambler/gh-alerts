import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { homedir } from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import type {
  Config,
  PreflightResult,
  PullRequest,
  RepositoryConfig,
  RepositoryPullRequests,
} from '../types';

const execFileAsync = promisify(execFile);

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 1350,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

const GH_ALERTS_DIR = join(homedir(), '.config', 'gh-alerts');
const CONFIG_PATH = join(GH_ALERTS_DIR, 'config.json');
const CACHE_PATH = join(GH_ALERTS_DIR, 'cache.json');

async function readCache(): Promise<RepositoryPullRequests[] | null> {
  try {
    const raw = await readFile(CACHE_PATH, 'utf-8');
    return JSON.parse(raw) as RepositoryPullRequests[];
  } catch {
    return null;
  }
}

async function writeCache(data: RepositoryPullRequests[]): Promise<void> {
  await mkdir(GH_ALERTS_DIR, { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(data, null, 2));
}

async function checkGhCli(): Promise<boolean> {
  try {
    await execFileAsync('gh', ['--version']);
    return true;
  } catch {
    return false;
  }
}

const MIN_REFRESH_INTERVAL = 60_000;

const DEFAULT_CONFIG: Config = {
  repositories: [],
  refreshInterval: MIN_REFRESH_INTERVAL,
};

async function ensureConfig(): Promise<void> {
  try {
    await access(CONFIG_PATH);
  } catch {
    await mkdir(GH_ALERTS_DIR, { recursive: true });
    await writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }
}

async function loadConfig(): Promise<Config | null> {
  try {
    await ensureConfig();
    const raw = await readFile(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    const interval = Number(parsed.refreshInterval);
    parsed.refreshInterval =
      Number.isFinite(interval) && interval >= MIN_REFRESH_INTERVAL
        ? interval
        : MIN_REFRESH_INTERVAL;
    return parsed as Config;
  } catch {
    return null;
  }
}

function parseRepoUrl(url: string): { owner: string; name: string } {
  // Handles git@github.com:owner/repo.git and https://github.com/owner/repo.git
  const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
  if (!match) throw new Error(`Cannot parse repository URL: ${url}`);
  return { owner: match[1], name: match[2] };
}

async function fetchPrsForRepo(repo: RepositoryConfig): Promise<RepositoryPullRequests> {
  const { owner, name } = parseRepoUrl(repo.url);
  const { stdout } = await execFileAsync('gh', [
    'pr',
    'list',
    '--repo',
    `${owner}/${name}`,
    '--json',
    'id,number,title,url,state,isDraft,author,additions,deletions,headRefName,comments,labels,statusCheckRollup,createdAt,updatedAt',
    '--limit',
    '100',
  ]);
  const raw = JSON.parse(stdout) as Array<{
    id: number;
    number: number;
    title: string;
    url: string;
    state: string;
    isDraft: boolean;
    author: { login: string };
    additions: number;
    deletions: number;
    headRefName: string;
    comments: Array<unknown>;
    labels: Array<{ name: string }>;
    statusCheckRollup: Array<{ status: string; conclusion: string }>;
    createdAt: string;
    updatedAt: string;
  }>;
  const authors = repo.authors?.length ? repo.authors : null;
  const filtered = authors
    ? raw.filter((pr) => authors.includes(pr.author.login))
    : raw;
  const pullRequests = filtered.map((pr) => {
    let statusCheckRollup = '';
    if (pr.statusCheckRollup.length > 0) {
      const allCompleted = pr.statusCheckRollup.every((c) => c.status === 'COMPLETED');
      if (!allCompleted) {
        statusCheckRollup = 'PENDING';
      } else {
        const allSuccess = pr.statusCheckRollup.every((c) => c.conclusion === 'SUCCESS');
        statusCheckRollup = allSuccess ? 'SUCCESS' : 'FAILURE';
      }
    }
    return {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      url: pr.url,
      state: pr.state.toLowerCase() as PullRequest['state'],
      draft: pr.isDraft,
      author: pr.author.login,
      additions: pr.additions,
      deletions: pr.deletions,
      headRefName: pr.headRefName,
      comments: pr.comments.length,
      labels: pr.labels.map((l) => l.name),
      statusCheckRollup,
      repo: { owner, name },
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
    };
  });
  pullRequests.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return { repo: { owner, name }, pullRequests };
}

async function fetchAllPullRequests(config: Config): Promise<RepositoryPullRequests[]> {
  const results = await Promise.all(config.repositories.map(fetchPrsForRepo));
  await writeCache(results);
  return results;
}

async function preflight(): Promise<PreflightResult> {
  const [config, ghInstalled] = await Promise.all([loadConfig(), checkGhCli()]);
  const errors: string[] = [];
  if (!config) {
    errors.push(`Config file not found at ${CONFIG_PATH}`);
  }
  if (!ghInstalled) {
    errors.push('GitHub CLI (gh) is not installed or not found in PATH');
  }
  return { config, errors };
}

app.whenReady().then(() => {
  ipcMain.handle('preflight', () => preflight());
  ipcMain.handle('read-cache', () => readCache());
  ipcMain.handle('fetch-pull-requests', async (_event, config: Config) =>
    fetchAllPullRequests(config),
  );

  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

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
