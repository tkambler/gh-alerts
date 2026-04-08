import { useEffect, useRef, useState, useCallback } from 'react';
import pingUrl from './assets/ping.mp3';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
} from '@mui/material';
import type { Config, PreflightResult, RepositoryPullRequests } from '../../types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

function dataChanged(
  prev: RepositoryPullRequests[] | null,
  next: RepositoryPullRequests[],
): boolean {
  return JSON.stringify(prev) !== JSON.stringify(next);
}

function StatusChip({ status }: { status: string }): JSX.Element | null {
  if (!status) return null;
  const colorMap: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
    SUCCESS: 'success',
    FAILURE: 'error',
    PENDING: 'warning',
  };
  return <Chip label={status} size="small" color={colorMap[status] ?? 'default'} />;
}

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

  if (rows.length === 0) {
    return <Typography color="text.secondary">No open pull requests.</Typography>;
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderLeft: 'none', borderRight: 'none', borderRadius: 0 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#F0F0F0' }}>
            <TableCell>Repository</TableCell>
            <TableCell>#</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Draft</TableCell>
            <TableCell>Author</TableCell>
            <TableCell align="right">Additions</TableCell>
            <TableCell align="right">Deletions</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Ref</TableCell>
            <TableCell align="right">Comments</TableCell>
            <TableCell>Labels</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((pr, index) => (
            <TableRow key={`${pr.repo.owner}/${pr.repo.name}/${pr.number}`} sx={{ backgroundColor: index % 2 === 0 ? '#fff' : '#F4F7FA' }}>
              <TableCell>
                <Link href={pr.repoUrl} target="_blank" rel="noopener" underline="hover">
                  {pr.repoLabel}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={pr.url} target="_blank" rel="noopener" underline="hover">
                  {pr.number}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={pr.url} target="_blank" rel="noopener" underline="hover">
                  {pr.title}
                </Link>
              </TableCell>
              <TableCell>{pr.state}</TableCell>
              <TableCell>{pr.draft ? 'Yes' : 'No'}</TableCell>
              <TableCell>{pr.author}</TableCell>
              <TableCell align="right">{pr.additions}</TableCell>
              <TableCell align="right">{pr.deletions}</TableCell>
              <TableCell>{formatDate(pr.createdAt)}</TableCell>
              <TableCell>{formatDate(pr.updatedAt)}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {pr.headRefName}
              </TableCell>
              <TableCell align="right">{pr.comments}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {pr.labels.map((label) => (
                    <Chip key={label} label={label} size="small" />
                  ))}
                </Stack>
              </TableCell>
              <TableCell>
                <StatusChip status={pr.statusCheckRollup} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function App(): JSX.Element {
  const [result, setResult] = useState<PreflightResult | null>(null);
  const [repos, setRepos] = useState<RepositoryPullRequests[] | null>(null);
  const [prError, setPrError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const lastDataRef = useRef<RepositoryPullRequests[] | null>(null);

  const fetchAndNotify = useCallback((config: Config): void => {
    const ping = new Audio(pingUrl);
    setFetching(true);
    window.api
      .fetchPullRequests(config)
      .then((data) => {
        const changed = dataChanged(lastDataRef.current, data);
        setRepos(data);
        lastDataRef.current = data;
        if (changed) {
          ping.currentTime = 0;
          ping.play();
        }
      })
      .catch((err) => setPrError(String(err)))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    window.api.preflight().then(async (r) => {
      setResult(r);
      if (r.errors.length === 0 && r.config) {
        const cached = await window.api.readCache();
        if (cached) {
          setRepos(cached);
          lastDataRef.current = cached;
        }

        fetchAndNotify(r.config);

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

  if (prError) {
    return (
      <Container sx={{ p: 0 }}>
        <Alert severity="error">{prError}</Alert>
      </Container>
    );
  }

  if (!repos) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <AllPRsTable repos={repos} />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1,
          px: 2,
          py: 0.75,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#F0F0F0',
          minHeight: 36,
        }}
      >
        {fetching && (
          <>
            <CircularProgress size={14} thickness={5} />
            <Typography variant="caption" color="text.secondary">Updating...</Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
