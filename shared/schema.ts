import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const repositories = pgTable("repositories", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  description: text("description"),
  htmlUrl: text("html_url").notNull(),
  cloneUrl: text("clone_url").notNull(),
  language: text("language"),
  stargazersCount: integer("stargazers_count").notNull().default(0),
  forksCount: integer("forks_count").notNull().default(0),
  openIssuesCount: integer("open_issues_count").notNull().default(0),
  size: integer("size").notNull().default(0),
  defaultBranch: text("default_branch").notNull().default("main"),
  license: text("license"),
  topics: text("topics").array(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  pushedAt: timestamp("pushed_at"),
  isPrivate: boolean("is_private").notNull().default(false),
  owner: jsonb("owner").$type<{
    login: string;
    avatarUrl: string;
    htmlUrl: string;
  }>().notNull(),
});

export const searchResults = pgTable("search_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  query: text("query").notNull(),
  totalCount: integer("total_count").notNull(),
  results: jsonb("results").$type<string[]>().notNull(), // Array of repository IDs
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertRepositorySchema = createInsertSchema(repositories).omit({
  id: true,
});

export const insertSearchResultSchema = createInsertSchema(searchResults).omit({
  id: true,
  createdAt: true,
});

export type Repository = typeof repositories.$inferSelect;
export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type SearchResult = typeof searchResults.$inferSelect;
export type InsertSearchResult = z.infer<typeof insertSearchResultSchema>;

// GitHub API response types
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  default_branch: string;
  license: { name: string } | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir";
  _links: {
    self: string;
    git: string;
    html: string;
  };
}
