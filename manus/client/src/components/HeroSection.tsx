import { Loader2 } from "lucide-react";

interface Summary {
  totalConfirmed: number;
  totalDeaths: number;
  affectedCountries: number;
  lastUpdated: Date;
}

interface HeroSectionProps {
  summary?: Summary;
  isLoading: boolean;
}

export function HeroSection({ summary, isLoading }: HeroSectionProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section id="hero" className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-background via-background to-background/50">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-gradient">Hantavirus</span>
            <br />
            Outbreak Tracker
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Real-time monitoring of hantavirus cases worldwide. Track confirmed cases, affected regions, and latest developments.
          </p>

          {/* Statistics Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : summary ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Confirmed Cases */}
              <div className="glass-effect rounded-lg p-8">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                  {summary.totalConfirmed}
                </div>
                <p className="text-muted-foreground font-medium">Confirmed Cases</p>
              </div>

              {/* Deaths */}
              <div className="glass-effect rounded-lg p-8">
                <div className="text-4xl md:text-5xl font-bold text-red-500 mb-2">
                  {summary.totalDeaths}
                </div>
                <p className="text-muted-foreground font-medium">Deaths</p>
              </div>

              {/* Affected Countries */}
              <div className="glass-effect rounded-lg p-8">
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                  {summary.affectedCountries}
                </div>
                <p className="text-muted-foreground font-medium">Countries Affected</p>
              </div>
            </div>
          ) : null}

          {/* Summary Text */}
          <div className="text-center text-muted-foreground text-sm">
            {summary && (
              <p>
                Updated {formatDate(summary.lastUpdated)} · Sources: WHO, CDC, Hantaflow
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
