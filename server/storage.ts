import { type Repository, type InsertRepository, type SearchResult, type InsertSearchResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Repository methods
  getRepository(id: string): Promise<Repository | undefined>;
  getRepositoryByFullName(fullName: string): Promise<Repository | undefined>;
  createRepository(repository: InsertRepository): Promise<Repository>;
  updateRepository(id: string, updates: Partial<InsertRepository>): Promise<Repository | undefined>;
  searchRepositories(query: string): Promise<Repository[]>;
  getRepositoriesByLanguage(language: string): Promise<Repository[]>;
  getRepositoriesByTopic(topic: string): Promise<Repository[]>;
  
  // Search results methods
  getSearchResult(id: string): Promise<SearchResult | undefined>;
  createSearchResult(searchResult: InsertSearchResult): Promise<SearchResult>;
  getRecentSearches(limit?: number): Promise<SearchResult[]>;
}

export class MemStorage implements IStorage {
  private repositories: Map<string, Repository>;
  private searchResults: Map<string, SearchResult>;

  constructor() {
    this.repositories = new Map();
    this.searchResults = new Map();
  }

  async getRepository(id: string): Promise<Repository | undefined> {
    return this.repositories.get(id);
  }

  async getRepositoryByFullName(fullName: string): Promise<Repository | undefined> {
    return Array.from(this.repositories.values()).find(
      (repo) => repo.fullName === fullName
    );
  }

  async createRepository(insertRepository: InsertRepository): Promise<Repository> {
    const id = randomUUID();
    const repository: Repository = { ...insertRepository, id };
    this.repositories.set(id, repository);
    return repository;
  }

  async updateRepository(id: string, updates: Partial<InsertRepository>): Promise<Repository | undefined> {
    const existing = this.repositories.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.repositories.set(id, updated);
    return updated;
  }

  async searchRepositories(query: string): Promise<Repository[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.repositories.values()).filter(repo =>
      repo.name.toLowerCase().includes(searchTerm) ||
      repo.fullName.toLowerCase().includes(searchTerm) ||
      repo.description?.toLowerCase().includes(searchTerm) ||
      repo.language?.toLowerCase().includes(searchTerm) ||
      repo.topics?.some(topic => topic.toLowerCase().includes(searchTerm))
    );
  }

  async getRepositoriesByLanguage(language: string): Promise<Repository[]> {
    return Array.from(this.repositories.values()).filter(
      repo => repo.language?.toLowerCase() === language.toLowerCase()
    );
  }

  async getRepositoriesByTopic(topic: string): Promise<Repository[]> {
    return Array.from(this.repositories.values()).filter(
      repo => repo.topics?.some(t => t.toLowerCase() === topic.toLowerCase())
    );
  }

  async getSearchResult(id: string): Promise<SearchResult | undefined> {
    return this.searchResults.get(id);
  }

  async createSearchResult(insertSearchResult: InsertSearchResult): Promise<SearchResult> {
    const id = randomUUID();
    const searchResult: SearchResult = { 
      ...insertSearchResult, 
      id,
      createdAt: new Date()
    };
    this.searchResults.set(id, searchResult);
    return searchResult;
  }

  async getRecentSearches(limit: number = 10): Promise<SearchResult[]> {
    return Array.from(this.searchResults.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
