import feedparser
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

USER_AGENT = (
    "HantavirusTracker/1.0 "
    "(+https://hantavirus-tracker.com; public health monitoring)"
)

RSS_FEEDS = [
    {"url": "https://www.who.int/rss-feeds/news-english.xml", "source": "WHO", "language": "en", "country_iso2": ""},
    {"url": "https://www.who.int/feeds/entity/csr/don/en/rss.xml", "source": "WHO DON", "language": "en", "country_iso2": ""},
    {"url": "https://www.ecdc.europa.eu/en/rss.xml", "source": "ECDC", "language": "en", "country_iso2": ""},
    {"url": "https://promedmail.org/feed/", "source": "ProMED", "language": "en", "country_iso2": ""},
    {"url": "https://api.gdeltproject.org/api/v2/doc/doc?query=hantavirus&mode=artlist&format=rss", "source": "GDELT", "language": "en", "country_iso2": ""},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=en-GB&gl=GB&ceid=GB:en", "source": "Google News", "language": "en", "country_iso2": "GB"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=en&gl=US&ceid=US:en", "source": "Google News", "language": "en", "country_iso2": "US"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=en-AU&gl=AU&ceid=AU:en", "source": "Google News", "language": "en", "country_iso2": "AU"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=en-CA&gl=CA&ceid=CA:en", "source": "Google News", "language": "en", "country_iso2": "CA"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=es-ES&gl=ES&ceid=ES:es", "source": "Google News", "language": "es", "country_iso2": "ES"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=es-419&gl=AR&ceid=AR:es-419", "source": "Google News", "language": "es", "country_iso2": "AR"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=es-419&gl=MX&ceid=MX:es-419", "source": "Google News", "language": "es", "country_iso2": "MX"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=de&gl=DE&ceid=DE:de", "source": "Google News", "language": "de", "country_iso2": "DE"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=fr&gl=FR&ceid=FR:fr", "source": "Google News", "language": "fr", "country_iso2": "FR"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=pt-BR&gl=BR&ceid=BR:pt-419", "source": "Google News", "language": "pt", "country_iso2": "BR"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=it&gl=IT&ceid=IT:it", "source": "Google News", "language": "it", "country_iso2": "IT"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=nl&gl=NL&ceid=NL:nl", "source": "Google News", "language": "nl", "country_iso2": "NL"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=ru&gl=RU&ceid=RU:ru", "source": "Google News", "language": "ru", "country_iso2": "RU"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=ko&gl=KR&ceid=KR:ko", "source": "Google News", "language": "ko", "country_iso2": "KR"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=ja&gl=JP&ceid=JP:ja", "source": "Google News", "language": "ja", "country_iso2": "JP"},
]


def _parse_date(entry) -> str:
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            return datetime(*entry.published_parsed[:6], tzinfo=timezone.utc).isoformat()
        except Exception:
            pass
    return datetime.now(timezone.utc).isoformat()


def _fetch_one(feed_meta: dict) -> dict:
    url = feed_meta["url"]
    try:
        resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=10)
        resp.raise_for_status()
        parsed = feedparser.parse(resp.content)
        entries = []
        for e in parsed.entries:
            link = getattr(e, "link", None)
            title = getattr(e, "title", "")
            if not link or not title:
                continue
            entries.append({
                "title": title,
                "url": link,
                "source": feed_meta["source"],
                "language": feed_meta["language"],
                "country_iso2": feed_meta["country_iso2"],
                "published_at": _parse_date(e),
                "summary": getattr(e, "summary", ""),
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
        futures = {executor.submit(_fetch_one, feed): feed for feed in RSS_FEEDS}
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
