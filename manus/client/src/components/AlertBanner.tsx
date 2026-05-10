import { AlertCircle, CheckCircle } from "lucide-react";

interface DeltaData {
  newCases: number;
  newCountries: string[];
  hoursSinceChange: number;
  hasChange: boolean;
}

interface AlertBannerProps {
  delta: DeltaData;
}

export function AlertBanner({ delta }: AlertBannerProps) {
  if (delta.hasChange) {
    return (
      <div className="bg-red-600/20 border-b border-red-600/50 text-red-100 py-4 sticky top-16 z-40">
        <div className="container flex items-center gap-3">
          <AlertCircle size={20} className="flex-shrink-0" />
          <div>
            <p className="font-semibold">
              New confirmed cases — {delta.newCases} total as of{" "}
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            {delta.newCountries.length > 0 && (
              <p className="text-sm opacity-90">
                Affected: {delta.newCountries.join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-600/20 border-b border-green-600/50 text-green-100 py-4 sticky top-16 z-40">
      <div className="container flex items-center gap-3">
        <CheckCircle size={20} className="flex-shrink-0" />
        <p className="font-semibold">
          No new confirmed cases in {delta.hoursSinceChange} hours
        </p>
      </div>
    </div>
  );
}
