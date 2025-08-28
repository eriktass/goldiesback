import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Folder, 
  File, 
  FileText, 
  Download, 
  GitBranch,
  Clock
} from "lucide-react";
import { SiMarkdown, SiJavascript, SiTypescript, SiPython, SiHtml5, SiCss3 } from "react-icons/si";
import type { GitHubContent } from "@shared/schema";

interface FileBrowserProps {
  owner: string;
  repo: string;
}

export default function FileBrowser({ owner, repo }: FileBrowserProps) {
  const [currentPath, setCurrentPath] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("main");

  const { data: contents, isLoading } = useQuery({
    queryKey: ["/api/repositories", owner, repo, "contents", currentPath, selectedBranch],
    enabled: !!(owner && repo),
  });

  const getFileIcon = (fileName: string, type: "file" | "dir") => {
    if (type === "dir") {
      return <Folder className="h-4 w-4 text-blue-500" />;
    }

    const extension = fileName.split(".").pop()?.toLowerCase();
    const iconProps = { className: "h-4 w-4" };

    switch (extension) {
      case "md":
      case "markdown":
        return <SiMarkdown {...iconProps} className="h-4 w-4 text-gray-600" />;
      case "js":
      case "jsx":
        return <SiJavascript {...iconProps} className="h-4 w-4 text-yellow-500" />;
      case "ts":
      case "tsx":
        return <SiTypescript {...iconProps} className="h-4 w-4 text-blue-600" />;
      case "py":
        return <SiPython {...iconProps} className="h-4 w-4 text-green-600" />;
      case "html":
        return <SiHtml5 {...iconProps} className="h-4 w-4 text-orange-600" />;
      case "css":
        return <SiCss3 {...iconProps} className="h-4 w-4 text-blue-600" />;
      case "txt":
      case "log":
        return <FileText {...iconProps} className="h-4 w-4 text-gray-500" />;
      default:
        return <File {...iconProps} className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  const handleFileClick = (content: GitHubContent) => {
    if (content.type === "dir") {
      setCurrentPath(content.path);
    } else {
      // Open file in new tab
      window.open(content.html_url, "_blank");
    }
  };

  const handleBreadcrumbClick = (path: string) => {
    setCurrentPath(path);
  };

  const breadcrumbs = currentPath
    ? currentPath.split("/").reduce((acc: Array<{name: string, path: string}>, part, index, array) => {
        const path = array.slice(0, index + 1).join("/");
        acc.push({ name: part, path });
        return acc;
      }, [])
    : [];

  return (
    <div className="p-6">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <GitBranch className="h-4 w-4" />
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-32" data-testid="select-branch">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">main</SelectItem>
                <SelectItem value="master">master</SelectItem>
                <SelectItem value="develop">develop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => handleBreadcrumbClick("")}
              className="text-primary hover:underline"
              data-testid="breadcrumb-root"
            >
              {repo}
            </button>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center space-x-2">
                <span className="text-muted-foreground">/</span>
                <button
                  onClick={() => handleBreadcrumbClick(crumb.path)}
                  className="text-primary hover:underline"
                  data-testid={`breadcrumb-${crumb.name}`}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        <Button asChild data-testid="button-download">
          <a 
            href={`https://github.com/${owner}/${repo}/archive/refs/heads/${selectedBranch}.zip`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </a>
        </Button>
      </div>

      {/* File Tree */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-2 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Files</span>
            <div className="text-xs text-muted-foreground">
              {Array.isArray(contents) ? `${contents.length} items` : ""}
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-border">
          {isLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 px-4 py-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          ) : Array.isArray(contents) && contents.length > 0 ? (
            <>
              {/* Show parent directory link if not at root */}
              {currentPath && (
                <button
                  onClick={() => {
                    const parentPath = currentPath.split("/").slice(0, -1).join("/");
                    setCurrentPath(parentPath);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  data-testid="button-parent-directory"
                >
                  <Folder className="h-4 w-4 text-blue-500" />
                  <span className="text-primary hover:underline font-medium">..</span>
                  <span className="text-muted-foreground text-sm ml-auto">Parent directory</span>
                </button>
              )}
              
              {/* Sort directories first, then files */}
              {[...contents]
                .sort((a, b) => {
                  if (a.type !== b.type) {
                    return a.type === "dir" ? -1 : 1;
                  }
                  return a.name.localeCompare(b.name);
                })
                .map((content) => (
                  <button
                    key={content.sha}
                    onClick={() => handleFileClick(content)}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                    data-testid={`button-file-${content.name}`}
                  >
                    {getFileIcon(content.name, content.type)}
                    <span className={`font-medium flex-1 ${
                      content.type === "dir" ? "text-primary hover:underline" : "text-foreground hover:text-primary"
                    }`}>
                      {content.name}
                    </span>
                    <div className="text-right">
                      {content.type === "file" && (
                        <div className="text-xs text-muted-foreground">
                          {formatBytes(content.size)}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="h-8 w-8 mx-auto mb-2" />
              <p>This directory is empty</p>
            </div>
          )}
        </div>
      </div>

      {/* File count and tips */}
      {Array.isArray(contents) && contents.length > 0 && (
        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            Showing {contents.length} {contents.length === 1 ? "item" : "items"}
            {currentPath && ` in ${currentPath}`}
          </p>
          <p className="mt-1">
            Click on folders to navigate, click on files to view them on GitHub
          </p>
        </div>
      )}
    </div>
  );
}
