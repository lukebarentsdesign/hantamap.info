export function getCountryFlag(iso2) {
  if (!iso2) return null;
  const clean = iso2.toLowerCase();
  // Use FlagCDN for reliable, crisp vector/png rendering
  return `https://flagcdn.com/w40/${clean}.png`;
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function getCountryName(iso2) {
  if (!iso2) return '';
  try {
    // Handle manual edge cases or fallback to built-in Intl map
    if (iso2 === 'GB') return 'United Kingdom';
    if (iso2 === 'US') return 'United States';
    return regionNames.of(iso2.toUpperCase()) || iso2;
  } catch (e) {
    return iso2;
  }
}

const CONTINENT_MAP = {
  // Europe
  'GB': 'Europe', 'FR': 'Europe', 'DE': 'Europe', 'ES': 'Europe', 'IT': 'Europe', 
  'NL': 'Europe', 'BE': 'Europe', 'PL': 'Europe', 'PT': 'Europe', 'GR': 'Europe', 
  'AT': 'Europe', 'CH': 'Europe', 'SE': 'Europe', 'NO': 'Europe', 'RU': 'Europe',
  // North America
  'US': 'Americas', 'CA': 'Americas', 'MX': 'Americas',
  // South America
  'BR': 'Americas', 'AR': 'Americas', 'CL': 'Americas', 'CO': 'Americas', 'PE': 'Americas',
  // Asia / Oceania
  'AU': 'Asia-Pacific', 'NZ': 'Asia-Pacific', 'CN': 'Asia-Pacific', 'JP': 'Asia-Pacific', 'KR': 'Asia-Pacific', 
  'IN': 'Asia-Pacific', 'ID': 'Asia-Pacific', 'TR': 'Middle East', 'SA': 'Middle East',
  // Africa
  'ZA': 'Africa', 'NG': 'Africa', 'EG': 'Africa'
};

const NAME_TO_ISO = {
  'south africa': 'ZA', 'netherlands': 'NL', 'germany': 'DE', 'spain': 'ES',
  'switzerland': 'CH', 'united kingdom': 'GB', 'france': 'FR', 'italy': 'IT',
  'poland': 'PL', 'argentina': 'AR', 'canada': 'CA', 'united states': 'US',
  'australia': 'AU', 'turkey': 'TR', 'türkiye': 'TR', 'greece': 'GR', 'portugal': 'PT',
  'brazil': 'BR', 'chile': 'CL', 'russia': 'RU', 'south korea': 'KR'
};

export function getIsoCode(val) {
  if (!val) return '';
  if (val.length === 2) return val.toUpperCase();
  const lower = val.toLowerCase();
  return NAME_TO_ISO[lower] || val;
}

export function getContinent(iso2) {
  if (!iso2) return 'Other';
  const key = getIsoCode(iso2);
  return CONTINENT_MAP[key] || 'Other';
}
