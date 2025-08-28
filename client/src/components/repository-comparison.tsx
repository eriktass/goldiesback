import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, GitCompare, Star, GitFork, AlertCircle, Scale } from "lucide-react";

export default function RepositoryComparison() {
  const [repo1Query, setRepo1Query] = useState("");
  const [repo2Query, setRepo2Query] = useState("");
  const [repo1, setRepo1] = useState<string | null>(null);
  const [repo2, setRepo2] = useState<string | null>(null);

  const { data: repo1Data, isLoading: repo1Loading } = useQuery({
    queryKey: ["/api/repositories", ...repo1?.split("/") || []],
    enabled: !!repo1 && repo1.includes("/"),
  });

  const { data: repo2Data, isLoading: repo2Loading } = useQuery({
    queryKey: ["/api/repositories", ...repo2?.split("/") || []],
    enabled: !!repo2 && repo2.includes("/"),
  });

  const { data: searchResults1, isLoading: searchLoading1 } = useQuery({
    queryKey: ["/api/search/repositories", repo1Query],
    enabled: repo1Query.length > 2,
    staleTime: 5000,
  });

  const { data: searchResults2, isLoading: searchLoading2 } = useQuery({
    queryKey: ["/api/search/repositories", repo2Query],
    enabled: repo2Query.length > 2,
    staleTime: 5000,
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${bytes} B`;
  };

  const handleRepo1Select = (repoFullName: string) => {
    setRepo1(repoFullName);
    setRepo1Query(repoFullName);
  };

  const handleRepo2Select = (repoFullName: string) => {
    setRepo2(repoFullName);
    setRepo2Query(repoFullName);
  };

  const getComparisonColor = (value1: number, value2: number, higher = true) => {
    if (value1 === value2) return "text-foreground";
    const isValue1Better = higher ? value1 > value2 : value1 < value2;
    return isValue1Better ? "text-green-600" : "text-red-600";
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GitCompare className="h-5 w-5" />
          <span>Compare Repositories</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Repository 1 Search */}
          <div>
            <div className="relative mb-4">
              <Input
                placeholder="Search repository to compare..."
                value={repo1Query}
                onChange={(e) => setRepo1Query(e.target.value)}
                className="pl-10"
                data-testid="input-repo1-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            {/* Search Results 1 */}
            {repo1Query.length > 2 && !repo1 && (
              <div className="mb-4 max-h-48 overflow-y-auto border border-border rounded-md">
                {searchLoading1 ? (
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : searchResults1?.repositories?.length > 0 ? (
                  <div className="divide-y">
                    {searchResults1.repositories.slice(0, 5).map((repo: any) => (
                      <button
                        key={repo.id}
                        onClick={() => handleRepo1Select(repo.fullName)}
                        className="w-full p-3 text-left hover:bg-accent transition-colors"
                        data-testid={`button-select-repo1-${repo.fullName}`}
                      >
                        <div className="font-medium text-foreground">{repo.fullName}</div>
                        {repo.description && (
                          <div className="text-sm text-muted-foreground truncate">
                            {repo.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No repositories found</div>
                )}
              </div>
            )}

            {/* Repository 1 Info */}
            <div className="bg-muted rounded-lg p-4">
              {repo1Loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              ) : repo1Data ? (
                <>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="font-medium text-foreground" data-testid="text-repo1-name">
                      {repo1Data.fullName}
                    </div>
                    <Badge variant={repo1Data.isPrivate ? "destructive" : "secondary"}>
                      {repo1Data.isPrivate ? "Private" : "Public"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Stars:</span>
                      <span className={`font-medium ml-1 ${getComparisonColor(
                        repo1Data.stargazersCount, 
                        repo2Data?.stargazersCount || 0
                      )}`} data-testid="text-repo1-stars">
                        {formatNumber(repo1Data.stargazersCount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Forks:</span>
                      <span className={`font-medium ml-1 ${getComparisonColor(
                        repo1Data.forksCount, 
                        repo2Data?.forksCount || 0
                      )}`} data-testid="text-repo1-forks">
                        {formatNumber(repo1Data.forksCount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Issues:</span>
                      <span className={`font-medium ml-1 ${getComparisonColor(
                        repo1Data.openIssuesCount, 
                        repo2Data?.openIssuesCount || 0,
                        false
                      )}`} data-testid="text-repo1-issues">
                        {formatNumber(repo1Data.openIssuesCount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium text-foreground ml-1" data-testid="text-repo1-size">
                        {formatBytes(repo1Data.size * 1024)}
                      </span>
                    </div>
                    {repo1Data.language && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Language:</span>
                        <span className="font-medium text-foreground ml-1">
                          {repo1Data.language}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Scale className="h-8 w-8 mx-auto mb-2" />
                  <p>Search for a repository to compare</p>
                </div>
              )}
            </div>
          </div>

          {/* Repository 2 Search */}
          <div>
            <div className="relative mb-4">
              <Input
                placeholder="Search second repository..."
                value={repo2Query}
                onChange={(e) => setRepo2Query(e.target.value)}
                className="pl-10"
                data-testid="input-repo2-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            {/* Search Results 2 */}
            {repo2Query.length > 2 && !repo2 && (
              <div className="mb-4 max-h-48 overflow-y-auto border border-border rounded-md">
                {searchLoading2 ? (
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : searchResults2?.repositories?.length > 0 ? (
                  <div className="divide-y">
                    {searchResults2.repositories.slice(0, 5).map((repo: any) => (
                      <button
                        key={repo.id}
                        onClick={() => handleRepo2Select(repo.fullName)}
                        className="w-full p-3 text-left hover:bg-accent transition-colors"
                        data-testid={`button-select-repo2-${repo.fullName}`}
                      >
                        <div className="font-medium text-foreground">{repo.fullName}</div>
                        {repo.description && (
                          <div className="text-sm text-muted-foreground truncate">
                            {repo.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No repositories found</div>
                )}
              </div>
            )}

            {/* Repository 2 Info */}
            <div className="bg-muted rounded-lg p-4">
              {repo2Loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              ) : repo2Data ? (
                <>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="font-medium text-foreground" data-testid="text-repo2-name">
                      {repo2Data.fullName}
                    </div>
                    <Badge variant={repo2Data.isPrivate ? "destructive" : "secondary"}>
                      {repo2Data.isPrivate ? "Private" : "Public"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Stars:</span>
                      <span className={`font-medium ml-1 ${getComparisonColor(
                        repo2Data.stargazersCount, 
                        repo1Data?.stargazersCount || 0
                      )}`} data-testid="text-repo2-stars">
                        {formatNumber(repo2Data.stargazersCount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Forks:</span>
                      <span className={`font-medium ml-1 ${getComparisonColor(
                        repo2Data.forksCount, 
                        repo1Data?.forksCount || 0
                      )}`} data-testid="text-repo2-forks">
                        {formatNumber(repo2Data.forksCount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Issues:</span>
                      <span className={`font-medium ml-1 ${getComparisonColor(
                        repo2Data.openIssuesCount, 
                        repo1Data?.openIssuesCount || 0,
                        false
                      )}`} data-testid="text-repo2-issues">
                        {formatNumber(repo2Data.openIssuesCount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium text-foreground ml-1" data-testid="text-repo2-size">
                        {formatBytes(repo2Data.size * 1024)}
                      </span>
                    </div>
                    {repo2Data.language && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Language:</span>
                        <span className="font-medium text-foreground ml-1">
                          {repo2Data.language}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Scale className="h-8 w-8 mx-auto mb-2" />
                  <p>Search for a second repository</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comparison Summary */}
        {repo1Data && repo2Data && (
          <div className="mt-6 p-4 bg-accent rounded-lg">
            <h4 className="font-semibold text-foreground mb-3">Comparison Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-muted-foreground mb-1">More Popular</div>
                <div className="font-medium text-foreground">
                  {repo1Data.stargazersCount > repo2Data.stargazersCount 
                    ? repo1Data.fullName 
                    : repo2Data.stargazersCount > repo1Data.stargazersCount
                    ? repo2Data.fullName
                    : "Tied"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground mb-1">More Active</div>
                <div className="font-medium text-foreground">
                  {repo1Data.openIssuesCount < repo2Data.openIssuesCount 
                    ? repo1Data.fullName 
                    : repo2Data.openIssuesCount < repo1Data.openIssuesCount
                    ? repo2Data.fullName
                    : "Tied"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground mb-1">More Forked</div>
                <div className="font-medium text-foreground">
                  {repo1Data.forksCount > repo2Data.forksCount 
                    ? repo1Data.fullName 
                    : repo2Data.forksCount > repo1Data.forksCount
                    ? repo2Data.fullName
                    : "Tied"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clear Comparison */}
        {(repo1 || repo2) && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => {
                setRepo1(null);
                setRepo2(null);
                setRepo1Query("");
                setRepo2Query("");
              }}
              data-testid="button-clear-comparison"
            >
              Clear Comparison
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
