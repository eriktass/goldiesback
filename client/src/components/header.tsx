import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, Plus, Github } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
}

export default function Header({ onSearch, initialQuery = "" }: HeaderProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3" data-testid="link-home">
              <Github className="h-8 w-8 text-foreground" />
              <span className="text-xl font-semibold">Repo Explorer</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/" 
                className={`font-medium transition-colors ${
                  isActive("/") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-primary"
                }`}
                data-testid="nav-search"
              >
                Search
              </Link>
              <a 
                href="/trending" 
                className={`font-medium transition-colors ${
                  isActive("/trending") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-primary"
                }`}
                data-testid="nav-trending"
              >
                Trending
              </a>
              <a 
                href="/collections" 
                className={`font-medium transition-colors ${
                  isActive("/collections") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-primary"
                }`}
                data-testid="nav-collections"
              >
                Collections
              </a>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2"
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                data-testid="button-search"
              >
                Search
              </Button>
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              data-testid="button-create"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
