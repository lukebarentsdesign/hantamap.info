import feedparser
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from translation import translate_to_english

USER_AGENT = (
    "HantavirusTracker/1.0 "
    "(+https://hantavirus-tracker.com; public health monitoring)"
)

RELEVANCE_TERMS = (
    "hanta",
    "andes virus",
    "andes orthohantavirus",
    "orthohantavirus",
    "hemorrhagic fever with renal syndrome",
    "haemorrhagic fever with renal syndrome",
    "hfrs",
    "mv hondius",
    "hondius",
    "hantavirose",
    "hantavirosis",
)

RSS_FEEDS = [
    # Tier 1: official health authorities and surveillance networks.
    {"url": "https://www.who.int/rss-feeds/news-english.xml",
     "source": "WHO", "language": "en", "country_iso2": "", "tier": 1},
    {"url": "https://www.who.int/feeds/entity/csr/don/en/rss.xml",
     "source": "WHO DON", "language": "en", "country_iso2": "", "tier": 1,
     "counting": True},
    {"url": "https://www.ecdc.europa.eu/en/rss.xml",
     "source": "ECDC", "language": "en", "country_iso2": "", "tier": 1,
     "counting": True},
    {"url": "https://wwwnc.cdc.gov/eid/rss/eid.xml",
     "source": "CDC EID", "language": "en", "country_iso2": "US", "tier": 1,
     "counting": True},
    {"url": "https://ukhsa.blog.gov.uk/feed/",
     "source": "UKHSA", "language": "en", "country_iso2": "GB", "tier": 1},
    {"url": (
        "https://api.io.canada.ca/io-server/gc/news/en/v2"
        "?atomtitle=Public+Health+Agency+of+Canada"
        "&dept=publichealthagencyofcanada&format=atom&orderBy=desc"
        "&pick=50&publishedDate>=2021-07-23&sort=publishedDate"
     ),
     "source": "PHAC", "language": "en", "country_iso2": "CA", "tier": 1},
    {"url": (
        "https://api.io.canada.ca/io-server/gc/news/en/v2"
        "?atomtitle=Health+Canada&dept=departmentofhealth&format=atom"
        "&orderBy=desc&pick=50&publishedDate>=2021-07-23&sort=publishedDate"
     ),
     "source": "Health Canada", "language": "en", "country_iso2": "CA", "tier": 1},
    {"url": "https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/boletins/epidemiologicos/RSS",
     "source": "Brazil Health Bulletins", "language": "pt", "country_iso2": "BR", "tier": 1},
    {"url": "https://www.gov.br/saude/RSS",
     "source": "Brazil Ministry of Health", "language": "pt", "country_iso2": "BR", "tier": 1},
    {"url": "https://promedmail.org/feed/",
     "source": "ProMED", "language": "en", "country_iso2": "", "tier": 1},

    # Tier 2: trusted media and broad event-monitoring feeds.
    {"url": "http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/health/rss.xml",
     "source": "BBC Health", "language": "en", "country_iso2": "GB", "tier": 2},
    {"url": "http://newsrss.bbc.co.uk/rss/newsonline_uk_edition/world/rss.xml",
     "source": "BBC World", "language": "en", "country_iso2": "", "tier": 2},
    {"url": "https://apnews.com/index.rss",
     "source": "Associated Press", "language": "en", "country_iso2": "", "tier": 2},
    {"url": "https://rss.dw.com/rdf/rss-en-world",
     "source": "Deutsche Welle", "language": "en", "country_iso2": "", "tier": 2},
    {"url": "https://rss.dw.com/rdf/rss-en-top",
     "source": "Deutsche Welle Top", "language": "en", "country_iso2": "", "tier": 2},
    {"url": (
        "https://api.gdeltproject.org/api/v2/doc/doc"
        "?query=hantavirus&mode=artlist&format=rss"
     ),
     "source": "GDELT", "language": "en", "country_iso2": "", "tier": 2},

    # Tier 3: Google News signal scans. These discover leads only.
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=en-GB&gl=GB&ceid=GB:en",
     "source": "Google News", "language": "en", "country_iso2": "GB", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=en&gl=US&ceid=US:en",
     "source": "Google News", "language": "en", "country_iso2": "US", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=en-AU&gl=AU&ceid=AU:en",
     "source": "Google News", "language": "en", "country_iso2": "AU", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=en-CA&gl=CA&ceid=CA:en",
     "source": "Google News", "language": "en", "country_iso2": "CA", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=(hantavirus+OR+%22andes+virus%22+OR+hantavirose+OR+hantavirosis)&hl=en-GB&gl=GB&ceid=GB:en",
     "source": "Google Global Hanta", "language": "en", "country_iso2": "", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=(hantavirus+OR+%22andes+virus%22)+Europe&hl=en-GB&gl=GB&ceid=GB:en",
     "source": "Google Europe Hanta", "language": "en", "country_iso2": "", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=(hantavirus+OR+%22andes+virus%22)+(%22United+States%22+OR+Canada+OR+Mexico)&hl=en-US&gl=US&ceid=US:en",
     "source": "Google North America Hanta", "language": "en", "country_iso2": "", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=(hantavirus+OR+%22virus+hanta%22+OR+hantavirosis+OR+hantavirose)+(%22South+America%22+OR+Argentina+OR+Chile+OR+Brazil)&hl=es-419&gl=AR&ceid=AR:es-419",
     "source": "Google South America Hanta", "language": "es", "country_iso2": "", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=(hantavirus+OR+%22hemorrhagic+fever+with+renal+syndrome%22+OR+HFRS)+(Asia+OR+Japan+OR+Korea+OR+Taiwan+OR+India)&hl=en-US&gl=US&ceid=US:en",
     "source": "Google Asia HFRS", "language": "en", "country_iso2": "", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=(hantavirus+OR+%22andes+virus%22)+(Australia+OR+Oceania)&hl=en-AU&gl=AU&ceid=AU:en",
     "source": "Google Oceania Hanta", "language": "en", "country_iso2": "", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=(hantavirus+OR+%22andes+virus%22)+(%22MV+Hondius%22+OR+Tenerife+OR+%22Canary+Islands%22+OR+%22cruise+ship%22)&hl=en-GB&gl=GB&ceid=GB:en",
     "source": "Google Vessel Hanta", "language": "en", "country_iso2": "", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=es-ES&gl=ES&ceid=ES:es",
     "source": "Google News", "language": "es", "country_iso2": "ES", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=es-419&gl=AR&ceid=AR:es-419",
     "source": "Google News", "language": "es", "country_iso2": "AR", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=es-419&gl=MX&ceid=MX:es-419",
     "source": "Google News", "language": "es", "country_iso2": "MX", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=es-419&gl=CL&ceid=CL:es-419",
     "source": "Google News", "language": "es", "country_iso2": "CL", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=de&gl=DE&ceid=DE:de",
     "source": "Google News", "language": "de", "country_iso2": "DE", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=fr&gl=FR&ceid=FR:fr",
     "source": "Google News", "language": "fr", "country_iso2": "FR", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=pt-BR&gl=BR&ceid=BR:pt-419",
     "source": "Google News", "language": "pt", "country_iso2": "BR", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=it&gl=IT&ceid=IT:it",
     "source": "Google News", "language": "it", "country_iso2": "IT", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=tr&gl=TR&ceid=TR:tr",
     "source": "Google News", "language": "tr", "country_iso2": "TR", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantawirus&hl=pl&gl=PL&ceid=PL:pl",
     "source": "Google News", "language": "pl", "country_iso2": "PL", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=nl&gl=NL&ceid=NL:nl",
     "source": "Google News", "language": "nl", "country_iso2": "NL", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=ru&gl=RU&ceid=RU:ru",
     "source": "Google News", "language": "ru", "country_iso2": "RU", "tier": 3},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=ko&gl=KR&ceid=KR:ko",
     "source": "Google News", "language": "ko", "country_iso2": "KR", "tier": 3},
]


def _parse_date(entry) -> str:
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            return datetime(
                *entry.published_parsed[:6], tzinfo=timezone.utc
            ).isoformat()
        except Exception:
            pass
    return datetime.now(timezone.utc).isoformat()


def _is_relevant_signal(text: str) -> bool:
    haystack = (text or "").lower()
    return any(term in haystack for term in RELEVANCE_TERMS)


def _fetch_one(feed_meta: dict) -> dict:
    url = feed_meta["url"]
    try:
        resp = requests.get(
            url, headers={"User-Agent": USER_AGENT}, timeout=10
        )
        resp.raise_for_status()
        parsed = feedparser.parse(resp.content)
        entries = []
        for e in parsed.entries:
            link = getattr(e, "link", None)
            title = getattr(e, "title", "")
            if not link or not title:
                continue
            raw_summary = getattr(e, "summary", "")
            if not _is_relevant_signal(f"{title} {raw_summary} {link}"):
                continue
            language = feed_meta["language"]
            display_title = (
                translate_to_english(title, language)
                if language and language != "en"
                else title
            )
            summary = raw_summary
            display_summary = (
                translate_to_english(summary, language)
                if summary and language and language != "en"
                else summary
            )
            entries.append({
                "title": display_title,
                "url": link,
                "source": feed_meta["source"],
                "language": language,
                "country_iso2": feed_meta["country_iso2"],
                "tier": feed_meta.get("tier", 3),
                "counting": feed_meta.get("counting", False),
                "published_at": _parse_date(e),
                "summary": display_summary,
            })
        return {"feed": feed_meta, "entries": entries, "healthy": True}
    except Exception as ex:
        print(f"Feed error [{url}]: {ex}")
        return {"feed": feed_meta, "entries": [], "healthy": False}


def fetch_all_feeds() -> dict:
    all_entries = []
    seen_urls = set()
    healthy = 0

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(_fetch_one, feed): feed
            for feed in RSS_FEEDS
        }
        for future in as_completed(futures):
            result = future.result()
            if result["healthy"]:
                healthy += 1
            for entry in result["entries"]:
                if entry["url"] not in seen_urls:
                    seen_urls.add(entry["url"])
                    all_entries.append(entry)

    all_entries.sort(key=lambda x: x["published_at"], reverse=True)
    return {
        "entries": all_entries,
        "feeds_healthy": healthy,
        "feeds_total": len(RSS_FEEDS),
    }
