// GitHub API utility functions
export interface GitHubSearchParams {
  q: string;
  sort?: "stars" | "forks" | "updated" | "best-match";
  order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = "GitHubAPIError";
  }
}

export async function searchRepositories(params: GitHubSearchParams) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/search/repositories?${searchParams}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new GitHubAPIError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

export async function getRepository(owner: string, repo: string) {
  const response = await fetch(`/api/repositories/${owner}/${repo}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new GitHubAPIError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

export async function getRepositoryContents(
  owner: string, 
  repo: string, 
  path = "", 
  ref?: string
) {
  const params = new URLSearchParams();
  if (path) params.append("path", path);
  if (ref) params.append("ref", ref);

  const queryString = params.toString();
  const url = `/api/repositories/${owner}/${repo}/contents${queryString ? `?${queryString}` : ""}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new GitHubAPIError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

export async function getRepositoryLanguages(owner: string, repo: string) {
  const response = await fetch(`/api/repositories/${owner}/${repo}/languages`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new GitHubAPIError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

export async function getRepositoryTraffic(owner: string, repo: string) {
  const response = await fetch(`/api/repositories/${owner}/${repo}/traffic/views`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new GitHubAPIError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

export async function getRepositoryClones(owner: string, repo: string) {
  const response = await fetch(`/api/repositories/${owner}/${repo}/traffic/clones`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new GitHubAPIError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

export async function getTrendingRepositories(language?: string, since = "daily") {
  const params = new URLSearchParams();
  if (language) params.append("language", language);
  params.append("since", since);

  const response = await fetch(`/api/trending?${params}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new GitHubAPIError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

// Helper function to handle rate limiting
export function isRateLimited(error: GitHubAPIError): boolean {
  return error.status === 403 && 
         error.response?.message?.includes("rate limit");
}

// Helper function to get reset time for rate limit
export function getRateLimitResetTime(error: GitHubAPIError): Date | null {
  if (!isRateLimited(error)) return null;
  
  const resetHeader = error.response?.headers?.["x-ratelimit-reset"];
  if (!resetHeader) return null;
  
  return new Date(parseInt(resetHeader) * 1000);
}

// Helper function to format repository name for search
export function formatRepoQuery(query: string): string {
  // Remove any GitHub URLs and extract repo name
  const urlMatch = query.match(/github\.com\/([^\/]+\/[^\/]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  return query.trim();
}

// Helper function to build advanced search queries
export function buildAdvancedQuery(params: {
  text?: string;
  language?: string;
  topic?: string;
  user?: string;
  org?: string;
  size?: string;
  stars?: string;
  forks?: string;
  created?: string;
  pushed?: string;
}): string {
  const queryParts: string[] = [];
  
  if (params.text) {
    queryParts.push(params.text);
  }
  
  if (params.language) {
    queryParts.push(`language:${params.language}`);
  }
  
  if (params.topic) {
    queryParts.push(`topic:${params.topic}`);
  }
  
  if (params.user) {
    queryParts.push(`user:${params.user}`);
  }
  
  if (params.org) {
    queryParts.push(`org:${params.org}`);
  }
  
  if (params.size) {
    queryParts.push(`size:${params.size}`);
  }
  
  if (params.stars) {
    queryParts.push(`stars:${params.stars}`);
  }
  
  if (params.forks) {
    queryParts.push(`forks:${params.forks}`);
  }
  
  if (params.created) {
    queryParts.push(`created:${params.created}`);
  }
  
  if (params.pushed) {
    queryParts.push(`pushed:${params.pushed}`);
  }
  
  return queryParts.join(" ");
}
