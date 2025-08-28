import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import FileBrowser from "@/components/file-browser";
import RepositoryAnalytics from "@/components/repository-analytics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, GitFork, AlertCircle, Code, BarChart, Download, ExternalLink } from "lucide-react";
import { SiGithub } from "react-icons/si";

export default function Repository() {
  const { owner, repo } = useParams();

  const { data: repository, isLoading } = useQuery({
    queryKey: ["/api/repositories", owner, repo],
    enabled: !!(owner && repo),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="border-b border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Skeleton className="h-8 w-80 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-foreground mb-2">Repository not found</h1>
            <p className="text-muted-foreground">
              The repository {owner}/{repo} could not be found or you don't have access to it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getLanguageColor = (language: string | null) => {
    if (!language) return "bg-gray-400";
    
    const colors: Record<string, string> = {
      javascript: "bg-yellow-400",
      typescript: "bg-blue-500",
      python: "bg-green-500",
      java: "bg-orange-600",
      go: "bg-cyan-500",
      rust: "bg-orange-400",
      cpp: "bg-pink-500",
      c: "bg-gray-500",
      html: "bg-red-500",
      css: "bg-purple-500",
      php: "bg-indigo-500",
      ruby: "bg-red-600",
      swift: "bg-orange-500",
      kotlin: "bg-purple-600",
      shell: "bg-green-400",
    };
    
    return colors[language.toLowerCase()] || "bg-gray-400";
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Unknown";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Repository Header */}
          <div className="border-b border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <SiGithub className="h-5 w-5 text-muted-foreground" />
                  <h1 className="text-2xl font-bold text-foreground" data-testid="text-repo-name">
                    {repository.fullName}
                  </h1>
                  <Badge variant={repository.isPrivate ? "destructive" : "secondary"}>
                    {repository.isPrivate ? "Private" : "Public"}
                  </Badge>
                </div>
                {repository.description && (
                  <p className="text-foreground mb-3" data-testid="text-repo-description">
                    {repository.description}
                  </p>
                )}
                <div className="flex items-center space-x-2 mb-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={repository.owner.avatarUrl} alt={repository.owner.login} />
                    <AvatarFallback>{repository.owner.login[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <a 
                    href={repository.owner.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    data-testid="link-owner"
                  >
                    {repository.owner.login}
                  </a>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button variant="outline" asChild data-testid="button-star">
                  <a href={repository.htmlUrl} target="_blank" rel="noopener noreferrer">
                    <Star className="h-4 w-4 mr-2" />
                    Star
                    <Badge variant="secondary" className="ml-2">
                      {formatNumber(repository.stargazersCount)}
                    </Badge>
                  </a>
                </Button>
                <Button variant="outline" asChild data-testid="button-fork">
                  <a href={`${repository.htmlUrl}/fork`} target="_blank" rel="noopener noreferrer">
                    <GitFork className="h-4 w-4 mr-2" />
                    Fork
                    <Badge variant="secondary" className="ml-2">
                      {formatNumber(repository.forksCount)}
                    </Badge>
                  </a>
                </Button>
                <Button asChild data-testid="button-view-github">
                  <a href={repository.htmlUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on GitHub
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              {repository.language && (
                <div className="flex items-center space-x-1">
                  <span className={`w-3 h-3 rounded-full ${getLanguageColor(repository.language)}`}></span>
                  <span>{repository.language}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>{formatNumber(repository.stargazersCount)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <GitFork className="h-4 w-4" />
                <span>{formatNumber(repository.forksCount)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{formatNumber(repository.openIssuesCount)} issues</span>
              </div>
              {repository.license && (
                <div className="flex items-center space-x-1">
                  <span>{repository.license}</span>
                </div>
              )}
              <span>Updated {formatDate(repository.updatedAt)}</span>
            </div>

            {/* Topics */}
            {repository.topics && repository.topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {repository.topics.map((topic: string) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Repository Navigation Tabs */}
          <Tabs defaultValue="code" className="w-full">
            <div className="border-b border-border">
              <TabsList className="h-auto p-0 bg-transparent space-x-0">
                <TabsTrigger 
                  value="code" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
                  data-testid="tab-code"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
                  data-testid="tab-analytics"
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="code" className="mt-0">
              <FileBrowser owner={owner!} repo={repo!} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <RepositoryAnalytics owner={owner!} repo={repo!} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
