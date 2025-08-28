import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import SidebarFilters from "@/components/sidebar-filters";
import RepositoryCard from "@/components/repository-card";
import RepositoryComparison from "@/components/repository-comparison";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { List, Grid } from "lucide-react";
import type { SearchRepositoriesResponse } from "@/lib/queryClient";
import type { Repository } from "@shared/schema";

interface SearchFilters {
  language?: string;
  topic?: string;
  size?: string;
  updated?: string;
}

interface SearchParams {
  query: string;
  sort: string;
  order: string;
  page: number;
  filters: SearchFilters;
}

export default function Home() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "react",
    sort: "best-match",
    order: "desc",
    page: 1,
    filters: {}
  });
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { data: searchResults, isLoading } = useQuery<SearchRepositoriesResponse>({
    queryKey: ["/api/search/repositories", searchParams.query, searchParams.sort, searchParams.order, searchParams.page],
    enabled: !!searchParams.query,
  });

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, query, page: 1 }));
  };

  const handleSortChange = (sort: string) => {
    setSearchParams(prev => ({ ...prev, sort, page: 1 }));
  };

  const handleFilterChange = (filters: SearchFilters) => {
    setSearchParams(prev => ({ ...prev, filters, page: 1 }));
  };

  const repositories = searchResults?.repositories || [];
  const totalCount = searchResults?.total_count || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} initialQuery={searchParams.query} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <SidebarFilters 
            filters={searchParams.filters}
            onFiltersChange={handleFilterChange}
          />
          
          <main className="flex-1">
            {/* Search Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Repository Search Results</h1>
                <p className="text-muted-foreground mt-1">
                  {isLoading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : (
                    `${totalCount.toLocaleString()} repositories found`
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={searchParams.sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-40" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best-match">Best match</SelectItem>
                    <SelectItem value="stars">Most stars</SelectItem>
                    <SelectItem value="forks">Most forks</SelectItem>
                    <SelectItem value="updated">Recently updated</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border border-border rounded-md">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    data-testid="button-view-list"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    data-testid="button-view-grid"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Applied Filters */}
            {Object.keys(searchParams.filters).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(searchParams.filters).map(([key, value]) => 
                  value && (
                    <Badge key={key} variant="secondary" className="px-3 py-1">
                      {key}: {value}
                      <button
                        onClick={() => handleFilterChange({ ...searchParams.filters, [key]: undefined })}
                        className="ml-2 hover:text-destructive"
                        data-testid={`badge-remove-${key}`}
                      >
                        ×
                      </button>
                    </Badge>
                  )
                )}
              </div>
            )}

            {/* Repository List */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-border rounded-lg p-6">
                    <Skeleton className="h-6 w-80 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <div className="flex space-x-6">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : repositories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No repositories found</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Try adjusting your search query or filters
                </p>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}>
                {repositories.map((repo: Repository) => (
                  <RepositoryCard key={repo.id} repository={repo} />
                ))}
              </div>
            )}

            {/* Repository Comparison Tool */}
            <RepositoryComparison />

            {/* Pagination */}
            {repositories.length > 0 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">1-{repositories.length}</span> of{" "}
                  <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span> repositories
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    disabled={searchParams.page === 1}
                    onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page - 1 }))}
                    data-testid="button-prev-page"
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={repositories.length < 10}
                    data-testid="button-next-page"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
