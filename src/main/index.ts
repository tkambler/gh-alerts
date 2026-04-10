import { app, shell, BrowserWindow, ipcMain, Menu, MenuItem } from 'electron';
import { join } from 'path';
import { readFile, writeFile, mkdir, access, stat } from 'fs/promises';
import { homedir } from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import type {
  Config,
  FetchResult,
  PreflightResult,
  PullRequest,
  RepoFetchError,
  RepositoryConfig,
  RepositoryPullRequests,
} from '../types';

const execFileAsync = promisify(execFile);

const GH_CANDIDATE_PATHS = [
  '/opt/homebrew/bin/gh',
  '/usr/local/bin/gh',
  '/usr/bin/gh',
];

let resolvedGhPath: string | null = null;

async function resolveGh(): Promise<string> {
  if (resolvedGhPath) return resolvedGhPath;
  for (const candidate of GH_CANDIDATE_PATHS) {
    try {
      await access(candidate);
      resolvedGhPath = candidate;
      return resolvedGhPath;
    } catch {
      // not found at this path
    }
  }
  // fall back to relying on PATH (works in dev)
  resolvedGhPath = 'gh';
  return resolvedGhPath;
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1900,
    height: 1100,
    minWidth: 1200,
    minHeight: 800,
    show: false,
    icon: join(__dirname, '../../resources/pr-pulse-logo.png'),
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
    const gh = await resolveGh();
    await execFileAsync(gh, ['--version']);
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

type RawPR = {
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
};

const JSON_FIELDS =
  'id,number,title,url,state,isDraft,author,additions,deletions,headRefName,comments,labels,statusCheckRollup,createdAt,updatedAt';

async function fetchPRsForAuthor(
  owner: string,
  name: string,
  author: string | null,
): Promise<RawPR[]> {
  const args = ['pr', 'list', '--repo', `${owner}/${name}`, '--json', JSON_FIELDS, '--limit', '25'];
  if (author) args.push('--author', author);
  const gh = await resolveGh();
  const { stdout } = await execFileAsync(gh, args);
  return JSON.parse(stdout) as RawPR[];
}

async function fetchPRsForReviewer(
  owner: string,
  name: string,
  username: string,
): Promise<RawPR[]> {
  const args = [
    'pr',
    'list',
    '--repo',
    `${owner}/${name}`,
    '--json',
    JSON_FIELDS,
    '--limit',
    '25',
    '--search',
    `review-requested:${username}`,
  ];
  const gh = await resolveGh();
  const { stdout } = await execFileAsync(gh, args);
  return JSON.parse(stdout) as RawPR[];
}

async function fetchPrsForRepo(
  repo: RepositoryConfig,
  username?: string,
): Promise<RepositoryPullRequests> {
  const { owner, name } = parseRepoUrl(repo.url);
  const authors = repo.authors?.length ? repo.authors : null;
  const requests = authors
    ? authors.map((author) => fetchPRsForAuthor(owner, name, author))
    : [fetchPRsForAuthor(owner, name, null)];
  if (username) requests.push(fetchPRsForReviewer(owner, name, username));
  const results = await Promise.all(requests);
  const seen = new Set<number>();
  const filtered: RawPR[] = [];
  for (const batch of results) {
    for (const pr of batch) {
      if (!seen.has(pr.id)) {
        seen.add(pr.id);
        filtered.push(pr);
      }
    }
  }
  const pullRequests = filtered.map((pr) => {
    let statusCheckRollup = '';
    if (pr.statusCheckRollup.length > 0) {
      const allCompleted = pr.statusCheckRollup.every((c) => c.status === 'COMPLETED');
      if (!allCompleted) {
        statusCheckRollup = 'PENDING';
      } else {
        const allSuccess = pr.statusCheckRollup.every((c) =>
          ['SUCCESS', 'SKIPPED', 'NEUTRAL'].includes(c.conclusion),
        );
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
  return { repo: { owner, name }, label: repo.label, pullRequests };
}

async function fetchAllPullRequests(config: Config): Promise<FetchResult> {
  const settled = await Promise.allSettled(
    config.repositories.map((repo) => fetchPrsForRepo(repo, config.username)),
  );

  const repos: RepositoryPullRequests[] = [];
  const errors: RepoFetchError[] = [];

  settled.forEach((result, index) => {
    const repoConfig = config.repositories[index];
    if (result.status === 'fulfilled') {
      repos.push(result.value);
    } else {
      const { owner, name } = parseRepoUrl(repoConfig.url);
      errors.push({
        repo: { owner, name },
        label: repoConfig.label,
        error: String(result.reason),
      });
    }
  });

  if (repos.length > 0) {
    const existingCache = await readCache();
    if (existingCache && errors.length > 0) {
      const freshKeys = new Set(repos.map((r) => `${r.repo.owner}/${r.repo.name}`));
      const staleEntries = existingCache.filter(
        (cached) => !freshKeys.has(`${cached.repo.owner}/${cached.repo.name}`),
      );
      await writeCache([...repos, ...staleEntries]);
    } else {
      await writeCache(repos);
    }
  }

  return { repos, errors };
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
  ipcMain.handle('cache-age', async () => {
    try {
      const s = await stat(CACHE_PATH);
      return Date.now() - s.mtimeMs;
    } catch {
      return Infinity;
    }
  });
  ipcMain.handle('fetch-pull-requests', async (_event, config: Config) =>
    fetchAllPullRequests(config),
  );

  electronApp.setAppUserModelId('com.electron');

  const defaultMenu = Menu.getApplicationMenu();
  if (defaultMenu && defaultMenu.items.length > 0) {
    const appMenu = defaultMenu.items[0];
    appMenu.submenu?.insert(
      1,
      new MenuItem({
        label: 'Settings',
        accelerator: 'CmdOrCtrl+,',
        click: () => shell.openPath(CONFIG_PATH),
      }),
    );
    Menu.setApplicationMenu(defaultMenu);
  }

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
