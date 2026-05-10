import { ExternalLink } from "lucide-react";

interface Signal {
  id: number;
  sourceUrl?: string | null;
  headline: string;
  summary: string;
  region?: string | null;
  datePublished: Date;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SignalsFeedProps {
  signals: Signal[];
}

const LANGUAGE_FLAGS: Record<string, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  de: "🇩🇪",
  fr: "🇫🇷",
  pt: "🇵🇹",
  nl: "🇳🇱",
  it: "🇮🇹",
  zh: "🇨🇳",
  ja: "🇯🇵",
  ko: "🇰🇷",
};

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export function SignalsFeed({ signals }: SignalsFeedProps) {
  return (
    <section id="signals" className="section-padding bg-card/30">
      <div className="container">
        <h2 className="text-4xl font-bold mb-4">Live Signals</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl">
          Latest outbreak reports and news from around the world.
        </p>

        {signals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No signals available yet.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {signals.map((signal) => (
              <div
                key={signal.id}
                className="glass-effect rounded-lg p-6 hover:border-accent/50 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg line-clamp-2 mb-1">
                      {signal.headline}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{LANGUAGE_FLAGS[signal.language] || "🌐"}</span>
                      {signal.region && <span>•</span>}
                      {signal.region && <span>{signal.region}</span>}
                      <span>•</span>
                      <span>{timeAgo(signal.datePublished)}</span>
                    </div>
                  </div>
                  {signal.sourceUrl && (
                    <a
                      href={signal.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 hover:bg-white/10 rounded transition-colors"
                      title="Open source"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>

                {/* Summary */}
                <p className="text-sm text-foreground/80 line-clamp-3">
                  {signal.summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
