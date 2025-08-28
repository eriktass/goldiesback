import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Eye, Download, Code } from "lucide-react";
import type { RepositoryLanguagesResponse, RepositoryTrafficResponse } from "@/lib/queryClient";

interface RepositoryAnalyticsProps {
  owner: string;
  repo: string;
}

export default function RepositoryAnalytics({ owner, repo }: RepositoryAnalyticsProps) {
  const { data: languages, isLoading: languagesLoading } = useQuery<RepositoryLanguagesResponse>({
    queryKey: ["/api/repositories", owner, repo, "languages"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: traffic, isLoading: trafficLoading } = useQuery<RepositoryTrafficResponse>({
    queryKey: ["/api/repositories", owner, repo, "traffic", "views"],
    staleTime: 60 * 1000, // 1 minute
  });

  const { data: clones, isLoading: clonesLoading } = useQuery<RepositoryTrafficResponse>({
    queryKey: ["/api/repositories", owner, repo, "traffic", "clones"],
    staleTime: 60 * 1000, // 1 minute
  });

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: "#f1e05a",
      typescript: "#3178c6",
      python: "#3572a5",
      java: "#b07219",
      go: "#00add8",
      rust: "#dea584",
      cpp: "#f34b7d",
      c: "#555555",
      html: "#e34c26",
      css: "#563d7c",
      php: "#4f5d95",
      ruby: "#701516",
      swift: "#fa7343",
      kotlin: "#a97bff",
      shell: "#89e051",
    };
    
    return colors[language.toLowerCase()] || "#666666";
  };

  const calculateLanguagePercentages = (languages: Record<string, number>) => {
    const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    return Object.entries(languages)
      .map(([language, bytes]) => ({
        language,
        bytes,
        percentage: (bytes / total) * 100,
        color: getLanguageColor(language),
      }))
      .sort((a, b) => b.percentage - a.percentage);
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repository Traffic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Repository Traffic</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trafficLoading || clonesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Views (2 weeks)</span>
                  </div>
                  <span className="font-medium text-foreground" data-testid="text-views">
                    {traffic?.count ? formatNumber(traffic.count) : "N/A"}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: "85%" }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Unique visitors</span>
                  </div>
                  <span className="font-medium text-foreground" data-testid="text-unique-visitors">
                    {traffic?.uniques ? formatNumber(traffic.uniques) : "N/A"}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: "65%" }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Clones (2 weeks)</span>
                  </div>
                  <span className="font-medium text-foreground" data-testid="text-clones">
                    {clones?.count ? formatNumber(clones.count) : "N/A"}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Language Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Language Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {languagesLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : languages && Object.keys(languages).length > 0 ? (
              <div className="space-y-3">
                {calculateLanguagePercentages(languages).slice(0, 6).map((lang) => (
                  <div key={lang.language} className="flex items-center space-x-3">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: lang.color }}
                    ></span>
                    <span className="text-sm text-foreground flex-1">
                      {lang.language}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {lang.percentage.toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(lang.bytes)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Language breakdown bar */}
                <div className="mt-4">
                  <div className="w-full bg-muted rounded-full h-2 flex overflow-hidden">
                    {calculateLanguagePercentages(languages).map((lang) => (
                      <div
                        key={lang.language}
                        className="h-full"
                        style={{
                          backgroundColor: lang.color,
                          width: `${lang.percentage}%`,
                        }}
                        title={`${lang.language}: ${lang.percentage.toFixed(1)}%`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Code className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No language data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-2" data-testid="text-total-traffic">
                {traffic?.count ? formatNumber(traffic.count) : "0"}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-2" data-testid="text-total-visitors">
                {traffic?.uniques ? formatNumber(traffic.uniques) : "0"}
              </div>
              <div className="text-sm text-muted-foreground">Unique Visitors</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-2" data-testid="text-total-clones">
                {clones?.count ? formatNumber(clones.count) : "0"}
              </div>
              <div className="text-sm text-muted-foreground">Total Clones</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
