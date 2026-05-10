/**
 * SAFE MODE: 
 * Restricts automated news categorization to the minimum baseline 
 * to prevent misleading 'Fatality' or 'Pending' false alarms.
 */

export const getSignalStatus = (text = "") => {
  const lower = (text || "").toLowerCase();

  // HEAVILY RESTRICTED: Only flag highly specific suspect phrasing to keep user trust
  const suspectPhrases = ['suspect case', 'sospech', 'possible case', 'caso probable'];
  if (suspectPhrases.some(ph => lower.includes(ph))) {
    return { id: 'suspected', label: 'Suspect Intel', color: '#f59e0b', priority: 1 };
  }

  // Default to zero-inference baseline. NO LIES.
  return { id: 'monitoring', label: 'Intelligence', color: '#0ea5e9', priority: 0 };
};

export const getRegionStatus = (signals = []) => {
  let topStatus = { id: 'monitoring', label: 'Intelligence', color: '#0ea5e9', priority: 0 };
  signals.forEach(s => {
    const status = getSignalStatus(s.title);
    if (status.priority > topStatus.priority) {
      topStatus = status;
    }
  });
  return topStatus;
};
