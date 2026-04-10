import { useEffect, useRef, useState, useCallback } from 'react';
import pingUrl from './assets/ping.mp3';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Link,
  Stack,
} from '@mui/material';
import { GridKit, useGridEngine } from '@repo/gridkit-react';
import type { FieldId, RowKey } from '@repo/types';
import type { Config, FetchResult, PreflightResult, PullRequest, RepositoryPullRequests } from '../../types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatAge(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'}`;
}

interface PrDiff {
  changed: boolean;
  newPrs: PullRequest[];
  closedPrCount: number;
}

function diffData(
  prev: RepositoryPullRequests[] | null,
  next: RepositoryPullRequests[],
): PrDiff {
  if (prev === null) return { changed: false, newPrs: [], closedPrCount: 0 };
  const prevIds = new Set(prev.flatMap((r) => r.pullRequests.map((pr) => pr.id)));
  const nextIds = new Set(next.flatMap((r) => r.pullRequests.map((pr) => pr.id)));
  const newPrs = next.flatMap((r) => r.pullRequests.filter((pr) => !prevIds.has(pr.id)));
  const closedPrCount = [...prevIds].filter((id) => !nextIds.has(id)).length;
  const changed =
    newPrs.length > 0 ||
    closedPrCount > 0 ||
    JSON.stringify(prev) !== JSON.stringify(next);
  return { changed, newPrs, closedPrCount };
}

function notifyOS(diff: PrDiff): void {
  let body: string;
  if (diff.newPrs.length === 1 && diff.closedPrCount === 0) {
    body = `New PR: ${diff.newPrs[0].title}`;
  } else if (diff.newPrs.length > 0 && diff.closedPrCount > 0) {
    body = `${diff.newPrs.length} new, ${diff.closedPrCount} closed`;
  } else if (diff.newPrs.length > 0) {
    body = `${diff.newPrs.length} new pull request${diff.newPrs.length > 1 ? 's' : ''}`;
  } else if (diff.closedPrCount > 0) {
    body = `${diff.closedPrCount} pull request${diff.closedPrCount > 1 ? 's' : ''} closed`;
  } else {
    body = 'Pull requests updated';
  }
  new window.Notification('PR Pulse', { body });
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

type PrRow = PullRequest & { repoLabel: string; repoUrl: string };

function AllPRsTable({ repos }: { repos: RepositoryPullRequests[] }): JSX.Element {
  const rows = repos
    .flatMap((data) =>
      data.pullRequests.map((pr) => ({
        ...pr,
        repoLabel: data.label ?? `${data.repo.owner}/${data.repo.name}`,
        repoUrl: `https://github.com/${data.repo.owner}/${data.repo.name}`,
      })),
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const engine = useGridEngine<PrRow>({
    fields: [
      {
        dataKey: 'repoLabel',
        title: 'Repository',
        flex: 1,
        sortable: true,
        visible: false,
        render: ({ data }) =>
          `<a href="${escapeHtml(data.repoUrl)}" target="_blank" rel="noopener" style="color:#1976d2;text-decoration:none">${escapeHtml(data.repoLabel)}</a>`,
      },
      {
        dataKey: 'number',
        title: '#',
        width: 100,
        sortable: true,
        render: ({ data }) =>
          `<a href="${escapeHtml(data.url)}" target="_blank" rel="noopener" style="color:#1976d2;text-decoration:none">${data.number}</a>`,
      },
      {
        dataKey: 'title',
        title: 'Title',
        flex: 2,
        sortable: true,
        render: ({ data }) => {
          const title = `<a href="${escapeHtml(data.url)}" target="_blank" rel="noopener" style="color:#1976d2;text-decoration:none">${escapeHtml(data.title)}</a>`;
          if (data.labels.length === 0) return title;
          const labels = data.labels.map((l) => escapeHtml(l)).join(', ');
          return `<div style="display:flex;flex-direction:column;gap:2px;padding:2px 0"><div>${title}</div><div style="font-size:11px;color:#444">Labels: ${labels}</div></div>`;
        },
      },
      {
        dataKey: 'state',
        title: 'State',
        width: 70,
        sortable: true,
        visible: false,
        format: ({ value }) => String(value).charAt(0).toUpperCase() + String(value).slice(1),
      },
      {
        dataKey: 'draft',
        title: 'Draft',
        width: 65,
        sortable: true,
        format: ({ value }) => (value ? 'Yes' : 'No'),
      },
      {
        dataKey: 'author',
        title: 'Author',
        width: 120,
        sortable: true,
        render: ({ data }) =>
          `<a href="https://github.com/${escapeHtml(data.author)}" target="_blank" rel="noopener" style="color:#1976d2;text-decoration:none">${escapeHtml(data.author)}</a>`,
      },
      {
        dataKey: 'headRefName',
        title: 'Branch',
        flex: 1,
        sortable: true,
        render: ({ data }) =>
          `<a href="${escapeHtml(data.repoUrl)}/tree/${escapeHtml(data.headRefName)}" target="_blank" rel="noopener" style="color:#1976d2;text-decoration:none">${escapeHtml(data.headRefName)}</a>`,
      },
      {
        dataKey: 'createdAt',
        title: 'Created',
        width: 130,
        maxWidth: 150,
        sortable: true,
        format: ({ value }) => `${formatAge(String(value))} ago`,
      },
      {
        dataKey: 'updatedAt',
        title: 'Updated',
        width: 130,
        maxWidth: 150,
        sortable: true,
        format: ({ value }) => `${formatAge(String(value))} ago`,
      },
      {
        dataKey: 'comments',
        title: 'Comments',
        width: 105,
        sortable: true,
        style: { textAlign: 'right' },
      },
      {
        dataKey: 'statusCheckRollup',
        title: 'Status',
        width: 90,
        sortable: true,
        render: ({ value }) => {
          if (!value) return '';
          const colorMap: Record<string, string> = {
            SUCCESS: '#2e7d32',
            FAILURE: '#d32f2f',
            PENDING: '#ed6c02',
          };
          const color = colorMap[String(value)] ?? '#9e9e9e';
          return `<span style="font-weight:bold;color:${color}">${escapeHtml(String(value))}</span>`;
        },
      },
    ],
    rowHeight: 50,
    groupExpandDepth: -1,
    suppressColumnMenu: true,
    panel: {
      tabs: [{ id: 'columns', labelDefault: 'Columns' }],
      defaultTab: 'columns',
      hiddenByDefault: false,
      width: 400,
    },
    rowKeyGetter: (data) => `${data.repo.owner}/${data.repo.name}/${data.number}` as RowKey,
    theme: { base: 'material', colorScheme: 'light', params: { sidebarWidth: '400px' } },
  });

  useEffect(() => {
    engine.closePanelTab();
    engine.setGroupFields(['repoLabel' as FieldId]);
    engine.loadData(rows);
  }, [engine, repos]);

  const statusBarHeight = 37;
  const [gridHeight, setGridHeight] = useState(() => window.innerHeight - statusBarHeight);

  useEffect(() => {
    const onResize = (): void => setGridHeight(window.innerHeight - statusBarHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (rows.length === 0) {
    return <Typography color="text.secondary">No open pull requests.</Typography>;
  }

  return (
    <>
      <style>{'.gk-row { align-items: stretch; } .gk-row:nth-child(even) { background-color: #f5f5f5; } .gk-cell { display: flex; align-items: center; } .gk-grid { border-bottom: none; } .gk-header { border-bottom: 1px solid var(--gk-border-color, #ddd); } .gk-header-cell:last-child, .gk-cell:last-child { border-right: none; } .gk-cell:focus, .gk-cell:focus-visible, .gk-cell-focused { outline: none !important; box-shadow: none !important; border-color: transparent !important; } .gk-filter-btn, .gk-menu-btn, .gk-group-btn { display: none !important; } .gk-row .gk-cell:first-child { padding-left: 12px !important; } .gk-row[data-group="true"] .gk-cell { padding-left: 12px !important; }'}</style>
      <GridKit engine={engine} style={{ height: gridHeight }} />
    </>
  );
}

export default function App(): JSX.Element {
  const [result, setResult] = useState<PreflightResult | null>(null);
  const [repos, setRepos] = useState<RepositoryPullRequests[] | null>(null);
  const [fetchWarnings, setFetchWarnings] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const lastDataRef = useRef<RepositoryPullRequests[] | null>(null);

  const fetchAndNotify = useCallback((config: Config): void => {
    const ping = new Audio(pingUrl);
    setFetching(true);
    window.api
      .fetchPullRequests(config)
      .then((result: FetchResult) => {
        if (result.errors.length > 0) {
          setFetchWarnings(
            result.errors.map(
              (e) =>
                `Failed to fetch ${e.label ?? `${e.repo.owner}/${e.repo.name}`}: ${e.error}`,
            ),
          );
        } else {
          setFetchWarnings([]);
        }

        if (result.repos.length > 0) {
          let mergedData: RepositoryPullRequests[];
          if (result.errors.length > 0 && lastDataRef.current) {
            const freshKeys = new Set(
              result.repos.map((r) => `${r.repo.owner}/${r.repo.name}`),
            );
            const staleRepos = lastDataRef.current.filter(
              (r) => !freshKeys.has(`${r.repo.owner}/${r.repo.name}`),
            );
            mergedData = [...result.repos, ...staleRepos];
          } else {
            mergedData = result.repos;
          }

          const diff = diffData(lastDataRef.current, mergedData);
          setRepos(mergedData);
          lastDataRef.current = mergedData;
          if (diff.changed) {
            ping.currentTime = 0;
            ping.play();
            notifyOS(diff);
          }
        }
      })
      .catch((err) => {
        setFetchWarnings([`Fetch failed: ${String(err)}`]);
      })
      .finally(() => {
        setFetching(false);
        setLastUpdatedAt(new Date());
      });
  }, []);

  useEffect(() => {
    window.api.preflight().then(async (r) => {
      setResult(r);
      if (r.errors.length === 0 && r.config) {
        const [cached, cacheAge] = await Promise.all([
          window.api.readCache(),
          window.api.cacheAge().catch(() => Infinity),
        ]);
        if (cached) {
          setRepos(cached);
          lastDataRef.current = cached;
        }

        const cacheIsFresh = cached && cacheAge < r.config.refreshInterval;
        if (!cacheIsFresh) {
          fetchAndNotify(r.config);
        } else {
          setLastUpdatedAt(new Date(Date.now() - cacheAge));
        }

        const interval = setInterval(() => fetchAndNotify(r.config!), r.config.refreshInterval);
        return () => clearInterval(interval);
      }
    });
  }, [fetchAndNotify]);

  if (!result) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (result.errors.length > 0) {
    return (
      <Container sx={{ p: 0 }}>
        <Stack spacing={2}>
          {result.errors.map((err) => (
            <Alert key={err} severity="error">
              {err}
            </Alert>
          ))}
        </Stack>
      </Container>
    );
  }

  if (!repos) {
    if (fetchWarnings.length > 0) {
      return (
        <Container sx={{ p: 2 }}>
          <Stack spacing={1}>
            {fetchWarnings.map((warning, i) => (
              <Alert key={i} severity="error">
                {warning}
              </Alert>
            ))}
          </Stack>
        </Container>
      );
    }
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {fetchWarnings.length > 0 && (
        <Box sx={{ px: 1, pt: 1, flexShrink: 0 }}>
          {fetchWarnings.map((warning, i) => (
            <Alert
              key={i}
              severity="warning"
              sx={{ mb: 0.5 }}
              onClose={() =>
                setFetchWarnings((prev) => prev.filter((_, j) => j !== i))
              }
            >
              {warning}
            </Alert>
          ))}
        </Box>
      )}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AllPRsTable repos={repos} />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 2,
          py: 0.75,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#F0F0F0',
          minHeight: 36,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {lastUpdatedAt ? `Last updated: ${lastUpdatedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : ''}
          </Typography>
          {result?.config && (
            <Link
              component="button"
              variant="caption"
              underline={fetching ? 'none' : 'hover'}
              onClick={() => fetchAndNotify(result.config!)}
              sx={{
                pointerEvents: fetching ? 'none' : 'auto',
                color: fetching ? 'text.disabled' : undefined,
              }}
            >
              Refresh Now
            </Link>
          )}
        </Box>
        {fetching && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={14} thickness={5} />
            <Typography variant="caption" color="text.secondary">Updating...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
