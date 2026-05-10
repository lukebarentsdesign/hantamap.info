import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface OutbreakCase {
  id?: number;
  location: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  confirmed?: number;
  confirmedCount?: number;
  deaths: number;
  severityLevel?: "low" | "moderate" | "high" | "critical";
  dateReported?: Date;
  status?: string;
}

interface MapSectionProps {
  cases?: OutbreakCase[];
}

// Mock coordinates for demonstration
const LOCATION_COORDS: Record<string, [number, number]> = {
  "South Africa": [-30.5595, 22.9375],
  Netherlands: [52.1326, 5.2913],
  Germany: [51.1657, 10.4515],
  "Saint Helena": [-15.9, -5.7],
  Spain: [40.4637, -3.7492],
  Switzerland: [46.8182, 8.2275],
  UK: [55.3781, -3.436],
};

export function MapSection({ cases = [] }: MapSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedCase, setSelectedCase] = useState<OutbreakCase | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 2,
      center: { lat: 20, lng: 0 },
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
        {
          featureType: "administrative",
          elementType: "geometry.stroke",
          stylers: [{ color: "#242c3e" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
      ],
    });

    // Add markers for each case
    cases.forEach((caseData) => {
      const coords = LOCATION_COORDS[caseData.location];
      if (!coords) return;

      const [lat, lng] = coords;
      const confirmed = caseData.confirmed || caseData.confirmedCount || 0;
      const deaths = caseData.deaths || 0;
      
      // Determine severity based on confirmed cases and deaths
      let severity: "low" | "moderate" | "high" | "critical" = "low";
      if (deaths > 1) severity = "critical";
      else if (confirmed > 2) severity = "high";
      else if (confirmed > 0) severity = "moderate";
      
      const color =
        severity === "critical"
          ? "#ef4444"
          : severity === "high"
            ? "#f97316"
            : severity === "moderate"
              ? "#eab308"
              : "#22c55e";

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: caseData.location,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: Math.min(15, 8 + confirmed * 2),
          fillColor: color,
          fillOpacity: 0.8,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => {
        setSelectedCase({
          ...caseData,
          confirmedCount: confirmed,
          severityLevel: severity,
          dateReported: caseData.dateReported || new Date(),
        });
      });
    });
  }, [cases]);

  return (
    <section id="map" className="section-padding bg-background">
      <div className="container">
        <h2 className="text-4xl font-bold mb-4">Global Outbreak Map</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl">
          Interactive map showing confirmed hantavirus cases by location. Click on markers for details.
        </p>

        <div className="relative rounded-lg overflow-hidden border border-border">
          {/* Map Container */}
          <div
            ref={mapRef}
            className="w-full h-96 md:h-[500px] bg-card"
          />

          {/* Info Card */}
          {selectedCase && (
            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-card border border-border rounded-lg p-4 shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{selectedCase.location}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedCase.dateReported ? new Date(selectedCase.dateReported).toLocaleDateString() : "May 2026"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmed Cases:</span>
                  <span className="font-semibold">{selectedCase.confirmedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deaths:</span>
                  <span className="font-semibold text-red-500">{selectedCase.deaths}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Severity:</span>
                  <span className={`font-semibold capitalize px-2 py-1 rounded text-xs ${
                    selectedCase.severityLevel === "critical"
                      ? "bg-red-600 text-white"
                      : selectedCase.severityLevel === "high"
                        ? "bg-orange-600 text-white"
                        : selectedCase.severityLevel === "moderate"
                          ? "bg-yellow-600 text-white"
                          : "bg-green-600 text-white"
                  }`}>
                    {selectedCase.severityLevel}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Critical", color: "bg-red-600" },
            { label: "High", color: "bg-orange-600" },
            { label: "Moderate", color: "bg-yellow-600" },
            { label: "Low", color: "bg-green-600" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
