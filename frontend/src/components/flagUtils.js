export function getCountryFlag(iso2) {
  if (!iso2) return null;
  const clean = iso2.toLowerCase();
  // Use FlagCDN for reliable, crisp vector/png rendering
  return `https://flagcdn.com/w40/${clean}.png`;
}

export const REGIONS_MAP = {
  'GB': 'United Kingdom',
  'US': 'United States',
  'CA': 'Canada',
  'AU': 'Australia',
  'DE': 'Germany',
  'FR': 'France',
  'ES': 'Spain',
  'IT': 'Italy',
  'BR': 'Brazil',
  'AR': 'Argentina',
  'CL': 'Chile',
  'PL': 'Poland',
  'RU': 'Russia',
  'KR': 'South Korea',
  'MX': 'Mexico'
};
