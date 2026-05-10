/**
 * Centralized heuristics for categorizing signals based on textual intelligence.
 * Maps classifications to a uniform color scheme across the dashboard.
 */

const DEATH_KEYWORDS = ['death', 'died', 'dead', 'fatal', 'mortality', 'muert', 'fallec', 'décès', 'tod', 'morto'];
const CONFIRMED_KEYWORDS = ['confirm', 'positiv', 'diagnos', 'presencia', 'infectado'];
const PENDING_KEYWORDS = ['flight', 'airport', 'vuelo', 'avion', 'repatriat', 'aeropuer', 'pending', 'pendiente', 'await', 'investig', 'under way'];
const SUSPECTED_KEYWORDS = ['suspect', 'sospech', 'possib', 'probabl', 'podr'];

export const getSignalStatus = (text = "") => {
  const lower = (text || "").toLowerCase();

  if (DEATH_KEYWORDS.some(kw => lower.includes(kw))) {
    return { id: 'death', label: 'Fatalities Reported', color: '#000000', priority: 4 };
  }
  
  if (CONFIRMED_KEYWORDS.some(kw => lower.includes(kw))) {
    return { id: 'confirmed', label: 'Confirmed Active', color: '#dc2626', priority: 3 };
  }
  
  if (PENDING_KEYWORDS.some(kw => lower.includes(kw))) {
    return { id: 'pending', label: 'Flights / Pending', color: '#ea580c', priority: 2 };
  }
  
  if (SUSPECTED_KEYWORDS.some(kw => lower.includes(kw))) {
    return { id: 'suspected', label: 'Suspected Case', color: '#f59e0b', priority: 1 };
  }

  return { id: 'monitoring', label: 'Monitoring Only', color: '#0ea5e9', priority: 0 };
};

/**
 * Given an array of signals for a region, aggregates and picks the highest priority status.
 */
export const getRegionStatus = (signals = []) => {
  let topStatus = { id: 'monitoring', label: 'Monitoring Only', color: '#0ea5e9', priority: 0 };
  
  signals.forEach(s => {
    // Combine title and snippet for scanning
    const text = `${s.title || ""} ${s.snippet || ""} ${s.content || ""}`;
    const status = getSignalStatus(text);
    if (status.priority > topStatus.priority) {
      topStatus = status;
    }
  });
  
  return topStatus;
};
