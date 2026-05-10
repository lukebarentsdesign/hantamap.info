import re
import json
from datetime import datetime, timezone

KNOWN_CASE_COUNTRIES = [
    "South Africa", "Netherlands", "Germany", "Spain", "Switzerland",
    "United Kingdom", "France", "Saint Helena", "Argentina", "Canada",
    "United States", "Italy", "Poland", "Portugal", "Australia",
    "Turkey", "Belgium", "Sweden", "Norway",
]

CONFIRMED_PATTERNS = [
    r"(\d+)\s+(?:laboratory[- ])?confirmed\s+case",
    r"confirmed\s+(\d+)\s+case",
    r"(\d+)\s+confirmed\s+case",
    r"total\s+of\s+(\d+)\s+case",
]

DEATH_PATTERNS = [
    r"(\d+)\s+death",
    r"(\d+)\s+(?:people\s+)?(?:have\s+)?died",
    r"resulted\s+in\s+(\d+)\s+death",
    r"(\d+)\s+fatal",
]

SUSPECTED_PATTERNS = [
    r"(\d+)\s+suspected\s+case",
    r"(\d+)\s+probable\s+case",
]


def _extract_number(text: str, patterns: list):
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                return int(match.group(1))
            except ValueError:
                continue
    return None


def _extract_countries(text: str) -> list:
    return [c for c in KNOWN_CASE_COUNTRIES if c.lower() in text.lower()]


def parse_case_counts(entries: list, current: dict) -> dict:
    # Establish ground-truth floors from user verification
    who_confirmed = max(current.get("who_confirmed", 0), 3)
    who_suspected = max(current.get("who_suspected", 0), 3)
    who_deaths    = max(current.get("who_deaths", 0), 3)
    who_countries = current.get("who_countries", [])
    if isinstance(who_countries, str):
        who_countries = json.loads(who_countries)

    authoritative = {"WHO", "WHO DON", "ECDC", "ProMED"}

    for entry in entries:
        if entry.get("source") not in authoritative:
            continue
        text = f"{entry.get('title', '')} {entry.get('summary', '')}"
        
        if "hanta" not in text.lower():
            continue

        c = _extract_number(text, CONFIRMED_PATTERNS)
        if c is not None and c >= who_confirmed:
            who_confirmed = c

        d = _extract_number(text, DEATH_PATTERNS)
        if d is not None and d >= who_deaths:
            who_deaths = d

        s = _extract_number(text, SUSPECTED_PATTERNS)
        if s is not None and s >= who_suspected:
            who_suspected = s

        for country in _extract_countries(text):
            if country not in who_countries:
                who_countries.append(country)

    return {
        "who_confirmed": who_confirmed,
        "who_suspected": who_suspected,
        "who_deaths":    who_deaths,
        "who_countries": who_countries,
    }


def build_summary(who_data: dict, stats: dict) -> str:
    today          = datetime.now(timezone.utc).strftime("%d %B %Y")
    confirmed      = who_data["who_confirmed"]
    deaths         = who_data["who_deaths"]
    countries      = who_data["who_countries"]
    country_count  = len(countries)
    country_sample = ", ".join(countries[:3])
    if country_count > 3:
        country_sample += f" and {country_count - 3} others"

    total     = stats.get("total_signals", 0)
    c_count   = stats.get("active_countries", 0)
    lang_count = stats.get("active_languages", 0)

    if confirmed == 0:
        return (
            f"As of {today}, WHO is investigating a cluster of hantavirus "
            f"cases linked to the MV Hondius cruise ship. This tracker "
            f"monitors {total} signals across {c_count} countries "
            f"in {lang_count} languages."
        )

    return (
        f"As of {today}, WHO has confirmed {confirmed} cases of Andes "
        f"hantavirus linked to the MV Hondius cruise ship, with "
        f"{deaths} death{'s' if deaths != 1 else ''} across "
        f"{country_count} {'countries' if country_count != 1 else 'country'}"
        f"{f' including {country_sample}' if country_sample else ''}. "
        f"The Andes strain is the only hantavirus known to transmit between "
        f"people in rare close-contact settings. WHO assesses global risk as "
        f"low. Monitoring {total} signals across {c_count} countries "
        f"in {lang_count} languages."
    )
