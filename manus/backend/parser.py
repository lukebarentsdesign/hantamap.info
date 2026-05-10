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


def _extract_number(text: str, patterns: list) -> int | None:
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                return int(match.group(1))
            except ValueError:
                continue
    return None


def _extract_countries(text: str) -> list:
    found = []
    for country in KNOWN_CASE_COUNTRIES:
        if country.lower() in text.lower():
            found.append(country)
    return found


def parse_case_counts(entries: list, current: dict) -> dict:
    who_confirmed = current.get("who_confirmed", 0)
    who_suspected = current.get("who_suspected", 0)
    who_deaths = current.get("who_deaths", 0)
    who_countries = current.get("who_countries", [])
    if isinstance(who_countries, str):
        who_countries = json.loads(who_countries)

    authoritative_sources = {"WHO", "WHO DON", "ECDC", "ProMED"}

    for entry in entries:
        if entry.get("source") not in authoritative_sources:
            continue

        text = f"{entry.get('title', '')} {entry.get('summary', '')}"

        confirmed = _extract_number(text, CONFIRMED_PATTERNS)
        if confirmed is not None and confirmed >= who_confirmed:
            who_confirmed = confirmed

        deaths = _extract_number(text, DEATH_PATTERNS)
        if deaths is not None and deaths >= who_deaths:
            who_deaths = deaths

        suspected = _extract_number(text, SUSPECTED_PATTERNS)
        if suspected is not None and suspected >= who_suspected:
            who_suspected = suspected

        countries = _extract_countries(text)
        for c in countries:
            if c not in who_countries:
                who_countries.append(c)

    return {
        "who_confirmed": who_confirmed,
        "who_suspected": who_suspected,
        "who_deaths": who_deaths,
        "who_countries": who_countries,
    }


def build_summary(who_data: dict, stats: dict) -> str:
    today = datetime.now(timezone.utc).strftime("%-d %B %Y")
    confirmed = who_data["who_confirmed"]
    deaths = who_data["who_deaths"]
    countries = who_data["who_countries"]
    country_count = len(countries)
    country_list = ", ".join(countries[:3])
    if country_count > 3:
        country_list += f" and {country_count - 3} others"

    total_signals = stats.get("total_signals", 0)
    feeds_healthy = stats.get("feeds_healthy", 0)
    feeds_total = stats.get("feeds_total", 0)

    return (
        f"As of {today}: {confirmed} confirmed cases, {deaths} deaths across {country_count} countries "
        f"({country_list}). {total_signals} signals ingested from {feeds_healthy}/{feeds_total} feeds."
    )
