export interface RepositoryConfig {
  url: string;
  label?: string;
  authors?: string[];
}

export interface Config {
  username?: string;
  repositories: RepositoryConfig[];
  refreshInterval: number;
}

export interface PreflightResult {
  config: Config | null;
  errors: string[];
}

export interface Repository {
  owner: string;
  name: string;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  url: string;
  state: 'open' | 'closed' | 'merged';
  draft: boolean;
  author: string;
  additions: number;
  deletions: number;
  headRefName: string;
  comments: number;
  labels: string[];
  statusCheckRollup: string;
  repo: Repository;
  createdAt: string;
  updatedAt: string;
}

export interface RepositoryPullRequests {
  repo: Repository;
  label?: string;
  pullRequests: PullRequest[];
}

export interface RepoFetchError {
  repo: Repository;
  label?: string;
  error: string;
}

export interface FetchResult {
  repos: RepositoryPullRequests[];
  errors: RepoFetchError[];
}
