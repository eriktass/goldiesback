import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, GitFork, AlertCircle, Clock, BookOpen } from "lucide-react";
import type { Repository } from "@shared/schema";

interface RepositoryCardProps {
  repository: Repository;
}

export default function RepositoryCard({ repository }: RepositoryCardProps) {
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Unknown";
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    }
    
    return d.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const [owner, repo] = repository.fullName.split("/");

  return (
    <Card className="hover:border-gray-300 transition-all" data-testid={`card-repository-${repository.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <Link 
                href={`/repository/${owner}/${repo}`}
                className="text-lg font-semibold text-primary hover:underline"
                data-testid={`link-repository-${repository.id}`}
              >
                {repository.fullName}
              </Link>
              <Badge variant={repository.isPrivate ? "destructive" : "secondary"} className="text-xs">
                {repository.isPrivate ? "Private" : "Public"}
              </Badge>
            </div>
            
            {repository.description && (
              <p className="text-foreground mb-3 line-clamp-2" data-testid={`text-description-${repository.id}`}>
                {repository.description}
              </p>
            )}
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
              {repository.language && (
                <div className="flex items-center space-x-1">
                  <span className={`w-3 h-3 rounded-full ${getLanguageColor(repository.language)}`}></span>
                  <span>{repository.language}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span data-testid={`text-stars-${repository.id}`}>
                  {formatNumber(repository.stargazersCount)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <GitFork className="h-4 w-4" />
                <span data-testid={`text-forks-${repository.id}`}>
                  {formatNumber(repository.forksCount)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span data-testid={`text-issues-${repository.id}`}>
                  {formatNumber(repository.openIssuesCount)} issues
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDate(repository.updatedAt)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-3">
              <Avatar className="h-5 w-5">
                <AvatarImage src={repository.owner.avatarUrl} alt={repository.owner.login} />
                <AvatarFallback className="text-xs">
                  {repository.owner.login[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <a 
                href={repository.owner.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary"
                data-testid={`link-owner-${repository.id}`}
              >
                {repository.owner.login}
              </a>
            </div>
          </div>
          
          <div className="flex space-x-2 ml-4">
            <Button 
              variant="outline" 
              size="sm"
              asChild
              data-testid={`button-star-${repository.id}`}
            >
              <a href={repository.htmlUrl} target="_blank" rel="noopener noreferrer">
                <Star className="h-3 w-3 mr-1" />
                Star
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              asChild
              data-testid={`button-fork-${repository.id}`}
            >
              <a href={`${repository.htmlUrl}/fork`} target="_blank" rel="noopener noreferrer">
                <GitFork className="h-3 w-3 mr-1" />
                Fork
              </a>
            </Button>
          </div>
        </div>
        
        {repository.topics && repository.topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {repository.topics.slice(0, 4).map((topic) => (
              <Badge key={topic} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
            {repository.topics.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{repository.topics.length - 4} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
