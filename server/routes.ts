import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertRepositorySchema } from "@shared/schema";
import { GitHubRepository, GitHubSearchResponse, GitHubContent } from "@shared/schema";

const GITHUB_API_BASE = "https://api.github.com";

async function fetchFromGitHub(endpoint: string, token?: string) {
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "GitHub-Repo-Explorer/1.0"
  };
  
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }
  
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

function transformGitHubRepo(ghRepo: GitHubRepository) {
  return {
    name: ghRepo.name,
    fullName: ghRepo.full_name,
    description: ghRepo.description,
    htmlUrl: ghRepo.html_url,
    cloneUrl: ghRepo.clone_url,
    language: ghRepo.language,
    stargazersCount: ghRepo.stargazers_count,
    forksCount: ghRepo.forks_count,
    openIssuesCount: ghRepo.open_issues_count,
    size: ghRepo.size,
    defaultBranch: ghRepo.default_branch,
    license: ghRepo.license?.name || null,
    topics: ghRepo.topics || [],
    createdAt: new Date(ghRepo.created_at),
    updatedAt: new Date(ghRepo.updated_at),
    pushedAt: ghRepo.pushed_at ? new Date(ghRepo.pushed_at) : null,
    isPrivate: ghRepo.private,
    owner: {
      login: ghRepo.owner.login,
      avatarUrl: ghRepo.owner.avatar_url,
      htmlUrl: ghRepo.owner.html_url,
    },
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_API_KEY;

  // Search repositories
  app.get("/api/search/repositories", async (req, res) => {
    try {
      const { q, sort, order, per_page = "10", page = "1" } = req.query;
      
      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const searchParams = new URLSearchParams({
        q: q as string,
        sort: (sort as string) || "best-match",
        order: (order as string) || "desc",
        per_page: per_page as string,
        page: page as string,
      });

      const searchResponse: GitHubSearchResponse = await fetchFromGitHub(
        `/search/repositories?${searchParams}`,
        githubToken
      );

      // Store repositories in local storage
      const repositories = [];
      for (const ghRepo of searchResponse.items) {
        const repoData = transformGitHubRepo(ghRepo);
        let existingRepo = await storage.getRepositoryByFullName(ghRepo.full_name);
        
        if (existingRepo) {
          existingRepo = await storage.updateRepository(existingRepo.id, repoData);
        } else {
          existingRepo = await storage.createRepository(repoData);
        }
        
        repositories.push(existingRepo);
      }

      // Store search result
      await storage.createSearchResult({
        query: q as string,
        totalCount: searchResponse.total_count,
        results: repositories.map(r => r!.id),
      });

      res.json({
        total_count: searchResponse.total_count,
        repositories,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search repositories" });
    }
  });

  // Get repository details
  app.get("/api/repositories/:owner/:repo", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const fullName = `${owner}/${repo}`;
      
      let repository = await storage.getRepositoryByFullName(fullName);
      
      if (!repository) {
        // Fetch from GitHub if not in storage
        const ghRepo: GitHubRepository = await fetchFromGitHub(
          `/repos/${owner}/${repo}`,
          githubToken
        );
        
        const repoData = transformGitHubRepo(ghRepo);
        repository = await storage.createRepository(repoData);
      }
      
      res.json(repository);
    } catch (error) {
      console.error("Repository fetch error:", error);
      res.status(500).json({ error: "Failed to fetch repository" });
    }
  });

  // Get repository contents
  app.get("/api/repositories/:owner/:repo/contents", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const { path = "", ref } = req.query;
      
      let endpoint = `/repos/${owner}/${repo}/contents`;
      if (path) {
        endpoint += `/${path}`;
      }
      
      const params = new URLSearchParams();
      if (ref) {
        params.append("ref", ref as string);
      }
      
      if (params.toString()) {
        endpoint += `?${params}`;
      }
      
      const contents: GitHubContent[] = await fetchFromGitHub(endpoint, githubToken);
      res.json(contents);
    } catch (error) {
      console.error("Contents fetch error:", error);
      res.status(500).json({ error: "Failed to fetch repository contents" });
    }
  });

  // Get repository languages
  app.get("/api/repositories/:owner/:repo/languages", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      
      const languages = await fetchFromGitHub(
        `/repos/${owner}/${repo}/languages`,
        githubToken
      );
      
      res.json(languages);
    } catch (error) {
      console.error("Languages fetch error:", error);
      res.status(500).json({ error: "Failed to fetch repository languages" });
    }
  });

  // Get repository traffic (views)
  app.get("/api/repositories/:owner/:repo/traffic/views", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      
      const traffic = await fetchFromGitHub(
        `/repos/${owner}/${repo}/traffic/views`,
        githubToken
      );
      
      res.json(traffic);
    } catch (error) {
      console.error("Traffic fetch error:", error);
      res.status(500).json({ error: "Failed to fetch repository traffic" });
    }
  });

  // Get repository clones
  app.get("/api/repositories/:owner/:repo/traffic/clones", async (req, res) => {
    try {
      const { owner, repo } = req.params;
      
      const clones = await fetchFromGitHub(
        `/repos/${owner}/${repo}/traffic/clones`,
        githubToken
      );
      
      res.json(clones);
    } catch (error) {
      console.error("Clones fetch error:", error);
      res.status(500).json({ error: "Failed to fetch repository clones" });
    }
  });

  // Get trending repositories
  app.get("/api/trending", async (req, res) => {
    try {
      const { language, since = "daily" } = req.query;
      
      const today = new Date();
      let dateQuery = "";
      
      switch (since) {
        case "weekly":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateQuery = `created:>${weekAgo.toISOString().split('T')[0]}`;
          break;
        case "monthly":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateQuery = `created:>${monthAgo.toISOString().split('T')[0]}`;
          break;
        default:
          const dayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
          dateQuery = `created:>${dayAgo.toISOString().split('T')[0]}`;
      }
      
      let query = `stars:>1 ${dateQuery}`;
      if (language) {
        query += ` language:${language}`;
      }
      
      const searchParams = new URLSearchParams({
        q: query,
        sort: "stars",
        order: "desc",
        per_page: "30",
      });
      
      const searchResponse: GitHubSearchResponse = await fetchFromGitHub(
        `/search/repositories?${searchParams}`,
        githubToken
      );
      
      const repositories = searchResponse.items.map(transformGitHubRepo);
      res.json({ repositories });
    } catch (error) {
      console.error("Trending fetch error:", error);
      res.status(500).json({ error: "Failed to fetch trending repositories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
