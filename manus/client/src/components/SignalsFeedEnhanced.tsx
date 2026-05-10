import { useState, useMemo } from "react";
import { Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Signal {
  id: number;
  headline: string;
  summary: string;
  region: string;
  datePublished: Date;
  sourceUrl: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SignalsFeedEnhancedProps {
  signals: Signal[];
  isLoading?: boolean;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
  pt: "Portuguese",
  it: "Italian",
  nl: "Dutch",
  ru: "Russian",
  ko: "Korean",
  ja: "Japanese",
  tr: "Turkish",
  pl: "Polish",
  el: "Greek",
};

const SkeletonCard = () => (
  <Card className="p-4 bg-card/50 border-border/50 animate-pulse">
    <div className="space-y-3">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-3 bg-muted rounded w-full"></div>
      <div className="h-3 bg-muted rounded w-5/6"></div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-muted rounded w-16"></div>
        <div className="h-6 bg-muted rounded w-20"></div>
      </div>
    </div>
  </Card>
);

export function SignalsFeedEnhanced({ signals, isLoading = false }: SignalsFeedEnhancedProps) {
  const [sortBy, setSortBy] = useState<"date" | "language">("date");
  const [filterLanguage, setFilterLanguage] = useState<string>("all");

  const languages = useMemo(() => {
    const langs = new Set(signals.map(s => s.language));
    return Array.from(langs).sort();
  }, [signals]);

  const filteredAndSorted = useMemo(() => {
    let filtered = signals;
    if (filterLanguage !== "all") {
      filtered = signals.filter(s => s.language === filterLanguage);
    }

    if (sortBy === "date") {
      return filtered.sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime());
    } else {
      return filtered.sort((a, b) => a.language.localeCompare(b.language));
    }
  }, [signals, sortBy, filterLanguage]);

  const shareSignal = (signal: Signal) => {
    const text = `${signal.headline} - Hantavirus Outbreak Tracker`;
    const url = signal.sourceUrl;
    
    if (navigator.share) {
      navigator.share({
        title: "Hantavirus Outbreak Update",
        text: text,
        url: url,
      });
    } else {
      // Fallback: copy to clipboard
      const shareText = `${text}\n${url}`;
      navigator.clipboard.writeText(shareText);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <section id="signals" className="py-16 md:py-24 bg-background/50">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Outbreak Signals</h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "language")}
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground"
            >
              <option value="date">Most Recent</option>
              <option value="language">Language</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Filter by language</label>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground"
            >
              <option value="all">All Languages ({signals.length})</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {LANGUAGE_NAMES[lang] || lang.toUpperCase()} ({signals.filter(s => s.language === lang).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Signals List */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredAndSorted.length > 0 ? (
            filteredAndSorted.map(signal => (
              <Card key={signal.id} className="p-4 hover:bg-card/80 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{signal.headline}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{signal.summary}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-block px-2 py-1 bg-accent/20 text-accent-foreground text-xs rounded">
                        {LANGUAGE_NAMES[signal.language] || signal.language.toUpperCase()}
                      </span>
                      {signal.region && (
                        <span className="inline-block px-2 py-1 bg-primary/20 text-primary-foreground text-xs rounded">
                          {signal.region}
                        </span>
                      )}
                      <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                        {new Date(signal.datePublished).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareSignal(signal)}
                      className="gap-2"
                    >
                      <Share2 size={16} />
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={signal.sourceUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                        <ExternalLink size={16} />
                        <span className="hidden sm:inline">Read</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              No signals found for the selected filters.
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
