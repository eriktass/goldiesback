import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SidebarFiltersProps {
  filters: {
    language?: string;
    topic?: string;
    size?: string;
    updated?: string;
  };
  onFiltersChange: (filters: any) => void;
}

const languages = [
  { name: "JavaScript", count: "1.2M" },
  { name: "Python", count: "890K" },
  { name: "TypeScript", count: "650K" },
  { name: "Java", count: "580K" },
  { name: "Go", count: "320K" },
  { name: "Rust", count: "180K" },
];

const topics = [
  "react",
  "nodejs",
  "machine-learning",
  "web-development",
  "frontend",
  "backend",
  "api",
  "cli"
];

export default function SidebarFilters({ filters, onFiltersChange }: SidebarFiltersProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const handleLanguageChange = (language: string, checked: boolean) => {
    const updated = checked 
      ? [...selectedLanguages, language]
      : selectedLanguages.filter(l => l !== language);
    
    setSelectedLanguages(updated);
    onFiltersChange({
      ...filters,
      language: updated.length > 0 ? updated.join(",") : undefined
    });
  };

  const handleTopicToggle = (topic: string) => {
    const updated = selectedTopics.includes(topic)
      ? selectedTopics.filter(t => t !== topic)
      : [...selectedTopics, topic];
    
    setSelectedTopics(updated);
    onFiltersChange({
      ...filters,
      topic: updated.length > 0 ? updated.join(",") : undefined
    });
  };

  const handleSizeChange = (size: string) => {
    onFiltersChange({
      ...filters,
      size: size === "any" ? undefined : size
    });
  };

  const handleUpdatedChange = (updated: string) => {
    onFiltersChange({
      ...filters,
      updated: updated === "any" ? undefined : updated
    });
  };

  return (
    <aside className="w-64 flex-shrink-0">
      <Card className="p-4 space-y-6">
        <div>
          <h3 className="font-semibold text-sm text-foreground mb-3">Languages</h3>
          <div className="space-y-2">
            {languages.map((language) => (
              <label 
                key={language.name}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedLanguages.includes(language.name)}
                  onCheckedChange={(checked) => 
                    handleLanguageChange(language.name, checked as boolean)
                  }
                  data-testid={`checkbox-language-${language.name.toLowerCase()}`}
                />
                <span className="text-sm text-foreground">{language.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{language.count}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-foreground mb-3">Topics</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Badge
                key={topic}
                variant={selectedTopics.includes(topic) ? "default" : "secondary"}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleTopicToggle(topic)}
                data-testid={`badge-topic-${topic}`}
              >
                {topic}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-foreground mb-3">Repository size</h3>
          <Select value={filters.size || "any"} onValueChange={handleSizeChange}>
            <SelectTrigger data-testid="select-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any size</SelectItem>
              <SelectItem value="small">Small (&lt; 1 MB)</SelectItem>
              <SelectItem value="medium">Medium (1-10 MB)</SelectItem>
              <SelectItem value="large">Large (&gt; 10 MB)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-foreground mb-3">Last updated</h3>
          <Select value={filters.updated || "any"} onValueChange={handleUpdatedChange}>
            <SelectTrigger data-testid="select-updated">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="day">Last day</SelectItem>
              <SelectItem value="week">Last week</SelectItem>
              <SelectItem value="month">Last month</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </aside>
  );
}
