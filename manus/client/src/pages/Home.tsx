import { useEffect, useState } from "react";
import { StickyNav } from "@/components/StickyNav";
import { AlertBanner } from "@/components/AlertBanner";
import { HeroSection } from "@/components/HeroSection";
import { MapSection } from "@/components/MapSection";
import { SignalsFeedEnhanced } from "@/components/SignalsFeedEnhanced";
import { EmailCapture } from "@/components/EmailCapture";
import { InfoSection } from "@/components/InfoSection";
import { Footer } from "@/components/Footer";

// Get API URL from env or construct from current origin
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Use /api proxy that Vite dev server provides
  return '/api';
};
const API_URL = getApiUrl();

interface Snapshot {
  id: number;
  created_at: string;
  who_confirmed: number;
  who_suspected: number;
  who_deaths: number;
  who_countries: string[];
  situation_summary: string;
  total_signals: number;
  active_countries: number;
  active_languages: number;
  feeds_healthy: number;
  feeds_total: number;
}

interface Delta {
  newCases: number;
  newCountries: string[];
  hasChange: boolean;
  hoursSinceChange: number;
}

interface Signal {
  id: number;
  headline?: string;
  title?: string;
  url?: string;
  sourceUrl?: string;
  source?: string;
  language?: string;
  country_iso2?: string;
  published_at?: string;
  ingested_at?: string;
  summary?: string;
}

export default function Home() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [delta, setDelta] = useState<Delta | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setSignalsLoading(true);
      try {
        const [snapshotRes, deltaRes, signalsRes] = await Promise.all([
          fetch(`${API_URL}/snapshot`),
          fetch(`${API_URL}/delta`),
          fetch(`${API_URL}/signals?limit=30`),
        ]);

        if (snapshotRes.ok) {
          const data = await snapshotRes.json();
          setSnapshot(data);
        }
        if (deltaRes.ok) {
          const data = await deltaRes.json();
          setDelta(data);
        }
        if (signalsRes.ok) {
          const data = await signalsRes.json();
          setSignals(data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
        setSignalsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StickyNav scrolled={scrolled} />

      {delta && (
        <AlertBanner delta={delta} />
      )}

      {snapshot && (
        <>
          <HeroSection
            summary={{
              totalConfirmed: snapshot.who_confirmed,
              totalDeaths: snapshot.who_deaths,
              affectedCountries: snapshot.who_countries.length,
              lastUpdated: new Date(snapshot.created_at),
            }}
            isLoading={false}
          />

          <MapSection cases={snapshot.who_countries.map((country, idx) => ({
            id: idx,
            location: country,
            confirmed: snapshot.who_confirmed,
            deaths: snapshot.who_deaths,
            dateReported: new Date(snapshot.created_at),
            status: snapshot.situation_summary,
          }))} />

          <SignalsFeedEnhanced 
            signals={signals.map(s => ({
              id: s.id,
              headline: s.headline || s.title || 'Outbreak Update',
              summary: s.summary || s.title || 'New outbreak signal',
              region: s.country_iso2 || 'XX',
              datePublished: new Date(s.published_at || Date.now()),
              sourceUrl: s.url || s.sourceUrl || '#',
              language: s.language || 'en',
              createdAt: new Date(s.ingested_at || Date.now()),
              updatedAt: new Date(s.ingested_at || Date.now()),
            }))}
            isLoading={signalsLoading}
          />

          <EmailCapture />

          <InfoSection />

          <Footer lastUpdated={new Date(snapshot.created_at)} />
        </>
      )}

      {loading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading outbreak data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
