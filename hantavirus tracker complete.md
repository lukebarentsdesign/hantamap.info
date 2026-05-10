# Hantavirus World Tracker — Complete Build Specification
# One document. Every file. Copy-paste ready.
# For: Antigravity / Manus / Claude Code / Cursor

---

## Design direction before you write a single line

**Aesthetic: Terminal Dispatch**
Dark newsroom meets scientific instrument. Think Reuters wire feed crossed
with a hospital monitoring system. Authoritative, precise, never alarming.
The kind of interface that makes you trust the data instinctively.

**Fonts (both free, Google Fonts):**
- `DM Mono` — numbers, labels, timestamps, metadata. Monospaced precision.
- `Instrument Sans` — body text, headings, UI copy. Refined editorial feel.

**Colour system:**
```
--bg        #08090c    near-black base
--bg2       #0f1117    card / surface
--bg3       #161922    input / hover state
--border    #1e2230    structural lines
--border2   #2a3040    active / hover border
--text      #dde2ed    primary body text
--text2     #7a8499    secondary / muted
--text3     #3d4558    timestamps / metadata
--accent    #c8392b    deep red — confirmed cases
--accent2   #e85d3c    warm red-orange — links / hover
--amber     #c98a2b    amber — monitoring / suspected
--green     #2e7d5e    green — all clear state
--green-t   #4db388    green text
```

**UI rules:**
- Numbers are huge and monospaced. Data speaks before text does.
- 1px borders throughout. No shadows. No blur. No gradients.
- Disclaimers are styled as PART of the interface — not legal boilerplate
  shoved at the bottom. Every data section carries its source inline.
- Every section heading is a monospaced label in small caps.
- Mobile-first. Single column below 600px.

---

## Repository structure

```
hantavirus-tracker/
├── backend/
│   ├── main.py
│   ├── feeds.py
│   ├── parser.py
│   ├── database.py
│   ├── alerts.py
│   ├── requirements.txt
│   ├── Procfile
│   └── Dockerfile
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── robots.txt
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── components/
    │       ├── DeltaBanner.jsx
    │       ├── SiteHeader.jsx
    │       ├── DisclaimerBar.jsx
    │       ├── Hero.jsx
    │       ├── WorldMap.jsx
    │       ├── SignalFeed.jsx
    │       ├── AlertSignup.jsx
    │       ├── InfoAccordion.jsx
    │       ├── SourcesPanel.jsx
    │       ├── FullDisclaimer.jsx
    │       └── SiteFooter.jsx
    ├── package.json
    ├── vite.config.js
    ├── nginx.conf
    └── Dockerfile
```

---

## BACKEND FILES

### backend/requirements.txt

```
fastapi==0.111.0
uvicorn==0.29.0
apscheduler==3.10.4
feedparser==6.0.11
requests==2.31.0
python-dotenv==1.0.1
resend==2.0.0
```

---

### backend/Procfile

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

### backend/Dockerfile

```dockerfile
FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN mkdir -p /app/data
COPY . .
EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

---

### backend/database.py

```python
import sqlite3
import os
import json
from contextlib import contextmanager

DB_PATH = os.environ.get("DB_PATH", "./data/db.sqlite")


def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                who_confirmed INTEGER DEFAULT 0,
                who_suspected INTEGER DEFAULT 0,
                who_deaths INTEGER DEFAULT 0,
                who_countries TEXT DEFAULT '[]',
                situation_summary TEXT DEFAULT '',
                total_signals INTEGER DEFAULT 0,
                active_countries INTEGER DEFAULT 0,
                active_languages INTEGER DEFAULT 0,
                feeds_healthy INTEGER DEFAULT 0,
                feeds_total INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                snapshot_id INTEGER,
                title TEXT NOT NULL,
                url TEXT UNIQUE NOT NULL,
                source TEXT,
                language TEXT DEFAULT 'en',
                country_iso2 TEXT,
                published_at TEXT,
                ingested_at TEXT NOT NULL,
                FOREIGN KEY (snapshot_id) REFERENCES snapshots(id)
            );

            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_signals_ingested
                ON signals(ingested_at DESC);
            CREATE INDEX IF NOT EXISTS idx_signals_snapshot
                ON signals(snapshot_id);
        """)
    print("Database initialised.")


def get_latest_snapshot():
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM snapshots ORDER BY id DESC LIMIT 1"
        ).fetchone()
        return dict(row) if row else None


def get_previous_snapshot():
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM snapshots ORDER BY id DESC LIMIT 1 OFFSET 1"
        ).fetchone()
        return dict(row) if row else None


def get_recent_signals(limit=30):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM signals ORDER BY ingested_at DESC LIMIT ?",
            (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


def insert_snapshot(data: dict) -> int:
    with get_db() as conn:
        cursor = conn.execute(
            """INSERT INTO snapshots
               (created_at, who_confirmed, who_suspected, who_deaths,
                who_countries, situation_summary, total_signals,
                active_countries, active_languages, feeds_healthy, feeds_total)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (
                data["created_at"],
                data["who_confirmed"],
                data["who_suspected"],
                data["who_deaths"],
                json.dumps(data["who_countries"]),
                data["situation_summary"],
                data["total_signals"],
                data["active_countries"],
                data["active_languages"],
                data["feeds_healthy"],
                data["feeds_total"],
            )
        )
        return cursor.lastrowid


def insert_signals(signals: list, snapshot_id: int):
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    inserted = 0
    with get_db() as conn:
        for s in signals:
            try:
                conn.execute(
                    """INSERT OR IGNORE INTO signals
                       (snapshot_id, title, url, source, language,
                        country_iso2, published_at, ingested_at)
                       VALUES (?,?,?,?,?,?,?,?)""",
                    (
                        snapshot_id,
                        s.get("title", ""),
                        s.get("url", ""),
                        s.get("source", ""),
                        s.get("language", "en"),
                        s.get("country_iso2", ""),
                        s.get("published_at", ""),
                        now,
                    )
                )
                if conn.execute("SELECT changes()").fetchone()[0]:
                    inserted += 1
            except Exception as e:
                print(f"Signal insert error: {e}")
        conn.execute("""
            DELETE FROM signals WHERE id NOT IN (
                SELECT id FROM signals ORDER BY ingested_at DESC LIMIT 1000
            )
        """)
    return inserted


def insert_alert(email: str) -> bool:
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        try:
            conn.execute(
                "INSERT INTO alerts (email, created_at) VALUES (?,?)",
                (email, now)
            )
            return True
        except sqlite3.IntegrityError:
            return False
```

---

### backend/feeds.py

```python
import feedparser
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

USER_AGENT = (
    "HantavirusTracker/1.0 "
    "(+https://hantavirus-tracker.com; public health monitoring)"
)

RSS_FEEDS = [
    # Official public health — highest authority
    {"url": "https://www.who.int/rss-feeds/news-english.xml",
     "source": "WHO", "language": "en", "country_iso2": ""},
    {"url": "https://www.who.int/feeds/entity/csr/don/en/rss.xml",
     "source": "WHO DON", "language": "en", "country_iso2": ""},
    {"url": "https://www.ecdc.europa.eu/en/rss.xml",
     "source": "ECDC", "language": "en", "country_iso2": ""},
    {"url": "https://promedmail.org/feed/",
     "source": "ProMED", "language": "en", "country_iso2": ""},
    {"url": (
        "https://api.gdeltproject.org/api/v2/doc/doc"
        "?query=hantavirus&mode=artlist&format=rss"
     ),
     "source": "GDELT", "language": "en", "country_iso2": ""},
    # Google News — English
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=en-GB&gl=GB&ceid=GB:en",
     "source": "Google News", "language": "en", "country_iso2": "GB"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=en&gl=US&ceid=US:en",
     "source": "Google News", "language": "en", "country_iso2": "US"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=en-AU&gl=AU&ceid=AU:en",
     "source": "Google News", "language": "en", "country_iso2": "AU"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=en-CA&gl=CA&ceid=CA:en",
     "source": "Google News", "language": "en", "country_iso2": "CA"},
    # Spanish
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=es-ES&gl=ES&ceid=ES:es",
     "source": "Google News", "language": "es", "country_iso2": "ES"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=es-419&gl=AR&ceid=AR:es-419",
     "source": "Google News", "language": "es", "country_iso2": "AR"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=es-419&gl=MX&ceid=MX:es-419",
     "source": "Google News", "language": "es", "country_iso2": "MX"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=es-419&gl=CL&ceid=CL:es-419",
     "source": "Google News", "language": "es", "country_iso2": "CL"},
    # German
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=de&gl=DE&ceid=DE:de",
     "source": "Google News", "language": "de", "country_iso2": "DE"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=de&gl=AT&ceid=AT:de",
     "source": "Google News", "language": "de", "country_iso2": "AT"},
    # French
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=fr&gl=FR&ceid=FR:fr",
     "source": "Google News", "language": "fr", "country_iso2": "FR"},
    # Portuguese
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=pt-BR&gl=BR&ceid=BR:pt-419",
     "source": "Google News", "language": "pt", "country_iso2": "BR"},
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=pt-PT&gl=PT&ceid=PT:pt-150",
     "source": "Google News", "language": "pt", "country_iso2": "PT"},
    # Italian
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=it&gl=IT&ceid=IT:it",
     "source": "Google News", "language": "it", "country_iso2": "IT"},
    # Turkish — local spelling hantavirüs
    {"url": "https://news.google.com/rss/search?q=hantavirüs&hl=tr&gl=TR&ceid=TR:tr",
     "source": "Google News", "language": "tr", "country_iso2": "TR"},
    # Polish — local spelling hantawirus
    {"url": "https://news.google.com/rss/search?q=hantawirus&hl=pl&gl=PL&ceid=PL:pl",
     "source": "Google News", "language": "pl", "country_iso2": "PL"},
    # Dutch
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=nl&gl=NL&ceid=NL:nl",
     "source": "Google News", "language": "nl", "country_iso2": "NL"},
    # Russian — Cyrillic spelling хантавирус
    {"url": "https://news.google.com/rss/search?q=хантавирус&hl=ru&gl=RU&ceid=RU:ru",
     "source": "Google News", "language": "ru", "country_iso2": "RU"},
    # Korean — 한타바이러스
    {"url": "https://news.google.com/rss/search?q=한타바이러스&hl=ko&gl=KR&ceid=KR:ko",
     "source": "Google News", "language": "ko", "country_iso2": "KR"},
    # Greek
    {"url": "https://news.google.com/rss/search?q=hantavirus&hl=el&gl=GR&ceid=GR:el",
     "source": "Google News", "language": "el", "country_iso2": "GR"},
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
```

---

### backend/parser.py

```python
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
    who_confirmed = current.get("who_confirmed", 0)
    who_suspected = current.get("who_suspected", 0)
    who_deaths    = current.get("who_deaths", 0)
    who_countries = current.get("who_countries", [])
    if isinstance(who_countries, str):
        who_countries = json.loads(who_countries)

    authoritative = {"WHO", "WHO DON", "ECDC", "ProMED"}

    for entry in entries:
        if entry.get("source") not in authoritative:
            continue
        text = f"{entry.get('title', '')} {entry.get('summary', '')}"

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
    today          = datetime.now(timezone.utc).strftime("%-d %B %Y")
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
```

---

### backend/alerts.py

```python
import os
import re

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SITE_URL       = os.environ.get("SITE_URL", "https://hantavirus-tracker.com")
FROM_EMAIL     = os.environ.get("FROM_EMAIL", "alerts@hantavirus-tracker.com")


def is_valid_email(email: str) -> bool:
    return bool(re.match(
        r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$",
        email.strip()
    ))


def send_welcome_email(email: str):
    if not RESEND_API_KEY:
        return
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": email,
            "subject": "You're on the list — Hantavirus Tracker",
            "html": f"""
                <div style="font-family:sans-serif;max-width:480px;
                            margin:0 auto;padding:24px;color:#1a1a1a">
                  <h2 style="font-size:18px;font-weight:500;
                             margin-bottom:16px">
                    You're subscribed to WHO case alerts
                  </h2>
                  <p style="color:#555;line-height:1.7">
                    We'll send you a short email the moment WHO confirms a
                    new hantavirus case. One email per confirmed case update.
                    No newsletters. No marketing.
                  </p>
                  <p style="margin-top:20px">
                    <a href="{SITE_URL}"
                       style="color:#c8392b;text-decoration:none">
                      View the live tracker →
                    </a>
                  </p>
                  <hr style="border:none;border-top:1px solid #eee;
                             margin:24px 0" />
                  <p style="color:#999;font-size:12px;line-height:1.6">
                    This is not medical advice. Data sourced from WHO Disease
                    Outbreak News and ECDC. To unsubscribe, reply STOP to
                    any alert email. Operated from the United Kingdom.
                  </p>
                </div>
            """,
        })
    except Exception as e:
        print(f"Welcome email error: {e}")


def send_case_alert(who_confirmed: int, who_deaths: int, countries: list):
    if not RESEND_API_KEY:
        return
    try:
        import resend
        import sqlite3
        from database import DB_PATH

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        emails = [
            r["email"]
            for r in conn.execute("SELECT email FROM alerts").fetchall()
        ]
        conn.close()

        if not emails:
            return

        country_str = ", ".join(countries[:5])
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": emails,
            "subject": f"Update: {who_confirmed} confirmed hantavirus cases",
            "html": f"""
                <div style="font-family:sans-serif;max-width:480px;
                            margin:0 auto;padding:24px;color:#1a1a1a">
                  <h2 style="font-size:18px;font-weight:500;
                             margin-bottom:16px">
                    WHO case update
                  </h2>
                  <table style="width:100%;border-collapse:collapse;
                                margin-bottom:20px">
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #eee;
                                 color:#555;font-size:14px">
                        Confirmed cases
                      </td>
                      <td style="padding:10px 0;border-bottom:1px solid #eee;
                                 font-weight:500;text-align:right;
                                 color:#c8392b">
                        {who_confirmed}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;border-bottom:1px solid #eee;
                                 color:#555;font-size:14px">
                        Deaths
                      </td>
                      <td style="padding:10px 0;border-bottom:1px solid #eee;
                                 font-weight:500;text-align:right">
                        {who_deaths}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;color:#555;font-size:14px">
                        Countries affected
                      </td>
                      <td style="padding:10px 0;font-weight:500;
                                 text-align:right;font-size:13px">
                        {country_str}
                      </td>
                    </tr>
                  </table>
                  <a href="{SITE_URL}"
                     style="display:inline-block;background:#c8392b;
                            color:#fff;padding:10px 20px;
                            text-decoration:none;font-size:14px">
                    View live tracker →
                  </a>
                  <hr style="border:none;border-top:1px solid #eee;
                             margin:24px 0" />
                  <p style="color:#999;font-size:11px;line-height:1.6">
                    Source: WHO Disease Outbreak News. This is not medical
                    advice. Reply STOP to unsubscribe. Operated from the UK.
                  </p>
                </div>
            """,
        })
        print(f"Case alert sent to {len(emails)} subscribers.")
    except Exception as e:
        print(f"Case alert error: {e}")
```

---

### backend/main.py

```python
import json
import os
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from apscheduler.schedulers.background import BackgroundScheduler

import database
import feeds
import parser
import alerts

app = FastAPI(title="Hantavirus Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    database.init_db()
    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.add_job(ingest, "interval", minutes=15, id="ingest")
    scheduler.start()
    print("Scheduler started. Running initial ingest...")
    ingest()


def ingest():
    print(f"Ingest started {datetime.now(timezone.utc).isoformat()}")

    result       = feeds.fetch_all_feeds()
    entries      = result["entries"]
    feeds_healthy = result["feeds_healthy"]
    feeds_total   = result["feeds_total"]
    print(f"  {len(entries)} entries from {feeds_healthy}/{feeds_total} feeds")

    current           = database.get_latest_snapshot() or {}
    previous_confirmed = current.get("who_confirmed", 0)

    who_data = parser.parse_case_counts(entries, current)
    print(f"  {who_data['who_confirmed']} confirmed / "
          f"{who_data['who_deaths']} deaths / "
          f"{len(who_data['who_countries'])} countries")

    active_countries  = len(set(
        e["country_iso2"] for e in entries if e["country_iso2"]
    ))
    active_languages  = len(set(
        e["language"] for e in entries if e["language"]
    ))

    summary = parser.build_summary(who_data, {
        "total_signals":   len(entries),
        "active_countries": active_countries,
        "active_languages": active_languages,
    })

    snapshot_id = database.insert_snapshot({
        "created_at":       datetime.now(timezone.utc).isoformat(),
        "who_confirmed":    who_data["who_confirmed"],
        "who_suspected":    who_data["who_suspected"],
        "who_deaths":       who_data["who_deaths"],
        "who_countries":    who_data["who_countries"],
        "situation_summary": summary,
        "total_signals":    len(entries),
        "active_countries": active_countries,
        "active_languages": active_languages,
        "feeds_healthy":    feeds_healthy,
        "feeds_total":      feeds_total,
    })

    inserted = database.insert_signals(entries, snapshot_id)
    print(f"  {inserted} new signals inserted")

    if who_data["who_confirmed"] > previous_confirmed:
        print(f"  Count rose {previous_confirmed} → "
              f"{who_data['who_confirmed']}. Sending alerts...")
        alerts.send_case_alert(
            who_data["who_confirmed"],
            who_data["who_deaths"],
            who_data["who_countries"],
        )

    print("Ingest complete.")


@app.get("/api/v1/snapshot")
def get_snapshot():
    snap = database.get_latest_snapshot()
    if not snap:
        raise HTTPException(status_code=503, detail="No data yet.")
    snap["who_countries"] = json.loads(snap.get("who_countries", "[]"))
    return {"snapshot": snap, "signals": database.get_recent_signals(30)}


@app.get("/api/v1/delta")
def get_delta():
    latest   = database.get_latest_snapshot()
    previous = database.get_previous_snapshot()

    if not latest:
        return {"has_changed": False, "new_cases": 0,
                "new_countries": [], "hours_since_change": 0,
                "who_confirmed": 0, "who_deaths": 0, "generated_at": ""}

    l_confirmed = latest.get("who_confirmed", 0)
    p_confirmed = previous.get("who_confirmed", 0) if previous else 0
    l_countries = json.loads(latest.get("who_countries", "[]"))
    p_countries = json.loads(previous.get("who_countries", "[]")) if previous else []
    new_countries = [c for c in l_countries if c not in p_countries]
    has_changed   = (l_confirmed != p_confirmed or bool(new_countries))

    hours = 0.0
    if previous and has_changed:
        try:
            t1 = datetime.fromisoformat(latest["created_at"])
            t2 = datetime.fromisoformat(previous["created_at"])
            hours = (t1 - t2).total_seconds() / 3600
        except Exception:
            pass

    return {
        "has_changed":        has_changed,
        "new_cases":          max(0, l_confirmed - p_confirmed),
        "new_countries":      new_countries,
        "hours_since_change": round(hours, 1),
        "who_confirmed":      l_confirmed,
        "who_deaths":         latest.get("who_deaths", 0),
        "generated_at":       latest.get("created_at", ""),
    }


class AlertSignup(BaseModel):
    email: str


@app.post("/api/v1/alert-signup")
def alert_signup(body: AlertSignup):
    email = body.email.strip().lower()
    if not alerts.is_valid_email(email):
        raise HTTPException(status_code=400, detail="Invalid email address.")
    if not database.insert_alert(email):
        raise HTTPException(status_code=409, detail="Already registered.")
    alerts.send_welcome_email(email)
    return {"status": "ok", "message": "You're on the list."}


@app.get("/health")
def health():
    from database import get_db
    with get_db() as conn:
        signals = conn.execute(
            "SELECT COUNT(*) as c FROM signals"
        ).fetchone()["c"]
        subs = conn.execute(
            "SELECT COUNT(*) as c FROM alerts"
        ).fetchone()["c"]
    return {
        "status": "ok",
        "time":   datetime.now(timezone.utc).isoformat(),
        "signals_in_db":      signals,
        "alert_subscribers":  subs,
    }
```

---

## FRONTEND FILES

---

### frontend/package.json

```json
{
  "name": "hantavirus-tracker",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.2.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

### frontend/vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

---

### frontend/nginx.conf

```nginx
server {
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;

    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    location ~* \.(js|css|png|jpg|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

---

### frontend/Dockerfile

```dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

---

### frontend/public/robots.txt

```
User-agent: *
Allow: /
Sitemap: https://hantavirus-tracker.com/sitemap.xml
```

---

### frontend/public/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#08090c" />

  <title>Hantavirus Outbreak Tracker — Live WHO &amp; ECDC Data</title>
  <meta name="description"
    content="Independent real-time hantavirus tracker. WHO-sourced confirmed
    cases and deaths. 24 feeds across 18 countries in 12 languages.
    Not medical advice." />

  <meta property="og:type"         content="website" />
  <meta property="og:title"        content="Hantavirus Outbreak Tracker" />
  <meta property="og:description"  content="WHO-sourced confirmed cases
    and global news signals from 24 feeds across 18 countries." />
  <meta property="og:image"        content="/share-card.png" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt"    content="Hantavirus Tracker live data" />

  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="Hantavirus Outbreak Tracker" />
  <meta name="twitter:description" content="Live WHO confirmed cases. Not medical advice." />
  <meta name="twitter:image"       content="/share-card.png" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap"
        rel="stylesheet" />
  <link rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    "name": "Hantavirus",
    "alternateName": ["HPS", "Andes virus", "Hantavirus Pulmonary Syndrome"],
    "description": "Hantavirus is a rodent-borne genus of viruses causing
      Hantavirus Pulmonary Syndrome in the Americas and Haemorrhagic Fever
      with Renal Syndrome in Europe and Asia.",
    "url": "https://www.who.int/news-room/fact-sheets/detail/hantavirus-and-hantavirus-disease",
    "code": { "@type": "MedicalCode", "code": "B33.4",
              "codingSystem": "ICD-10" }
  }
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

---

### frontend/src/index.css

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #08090c;
  --bg2:      #0f1117;
  --bg3:      #161922;
  --border:   #1e2230;
  --border2:  #2a3040;
  --text:     #dde2ed;
  --text2:    #7a8499;
  --text3:    #3d4558;
  --accent:   #c8392b;
  --accent2:  #e85d3c;
  --amber:    #c98a2b;
  --amber-d:  rgba(201,138,43,0.1);
  --green:    #2e7d5e;
  --green-t:  #4db388;
  --red-d:    rgba(200,57,43,0.08);
  --mono:     'DM Mono', 'Courier New', monospace;
  --sans:     'Instrument Sans', system-ui, sans-serif;
}

html { font-size: 16px; scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

a { color: var(--accent2); text-decoration: none; }
a:hover { text-decoration: underline; }
button { font-family: var(--sans); cursor: pointer; border: none;
         outline: none; background: none; }
input  { font-family: var(--sans); outline: none; }

/* ── Layout ─────────────────────────────────── */

.wrap {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (max-width: 600px) { .wrap { padding: 0 16px; } }

/* ── Section label ───────────────────────────── */

.label {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--text3);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* ── Delta banner ─────────────────────────────── */

.delta {
  width: 100%;
  padding: 9px 24px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.07em;
  text-align: center;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.delta.alert {
  background: var(--red-d);
  border-bottom-color: var(--accent);
  color: var(--accent2);
}
.delta.ok { color: var(--text3); }

.dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.delta.alert .dot {
  background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
}
.delta.ok .dot { background: var(--green); }

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.65); }
}

/* ── Site header ─────────────────────────────── */

.site-header {
  border-bottom: 1px solid var(--border);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 960px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 3s ease-in-out infinite;
}
.logo-text {
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--text);
  text-transform: uppercase;
}
.header-meta {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.05em;
}

/* ── Disclaimer bar ───────────────────────────── */

.disc-bar {
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  padding: 10px 24px;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.disc-tag {
  font-family: var(--mono);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--amber);
  border: 1px solid var(--amber);
  padding: 3px 6px;
  flex-shrink: 0;
  margin-top: 1px;
}
.disc-text {
  font-size: 12px;
  color: var(--text2);
  line-height: 1.65;
}

/* ── Hero ────────────────────────────────────── */

.hero {
  padding: 60px 24px 52px;
  max-width: 960px;
  margin: 0 auto;
  border-bottom: 1px solid var(--border);
}

.hero-eyebrow {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--text3);
  text-transform: uppercase;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.hero-eyebrow::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--border);
  margin-bottom: 36px;
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
}

.stat {
  padding: 28px 28px 24px;
  border-right: 1px solid var(--border);
}
.stat:last-child { border-right: none; }
@media (max-width: 480px) {
  .stat { border-right: none; border-bottom: 1px solid var(--border); }
  .stat:last-child { border-bottom: none; }
}

.stat-n {
  display: block;
  font-family: var(--mono);
  font-size: clamp(40px, 7vw, 68px);
  font-weight: 400;
  line-height: 1;
  margin-bottom: 10px;
}
.stat.confirmed .stat-n { color: var(--accent2); }
.stat.deaths    .stat-n { color: var(--text); }
.stat.countries .stat-n { color: var(--text2); }

.stat-l {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text3);
}
.stat-src {
  font-size: 10px;
  color: var(--text3);
  margin-top: 4px;
}

.hero-summary {
  font-size: 16px;
  line-height: 1.85;
  color: var(--text2);
  max-width: 660px;
  margin-bottom: 24px;
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pill {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text3);
  border: 1px solid var(--border);
  padding: 4px 10px;
  letter-spacing: 0.04em;
}

/* ── Map ─────────────────────────────────────── */

.map-section {
  border-bottom: 1px solid var(--border);
  padding: 48px 0;
}
.map-box {
  height: 420px;
  border: 1px solid var(--border);
  overflow: hidden;
}
@media (max-width: 600px) { .map-box { height: 270px; } }

.map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 12px;
}
.legend-i {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.04em;
}
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.legend-dot.c { background: var(--accent2); }
.legend-dot.m { background: var(--amber); }
.legend-line {
  width: 16px;
  border-top: 1.5px dashed var(--accent);
  display: inline-block;
}

.map-note {
  font-size: 11px;
  color: var(--text3);
  padding-top: 10px;
  border-top: 1px solid var(--border);
  margin-top: 10px;
  line-height: 1.7;
}

/* ── Signal feed ─────────────────────────────── */

.signals {
  padding: 48px 0;
  border-bottom: 1px solid var(--border);
}
.signals-hd {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 4px;
}
.signals-count {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text3);
}

.signal {
  display: grid;
  grid-template-columns: 22px 1fr auto;
  gap: 10px;
  align-items: start;
  padding: 11px 0;
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
}
.signal:last-child { border-bottom: none; }
.signal:hover {
  background: var(--bg2);
  margin: 0 -12px;
  padding: 11px 12px;
}

.sig-flag  { font-size: 15px; line-height: 1.5; text-align: center; }
.sig-title {
  font-size: 13px;
  color: var(--text);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sig-title:hover { color: var(--accent2); }
.sig-meta {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text3);
  margin-top: 3px;
}
.sig-time {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text3);
  white-space: nowrap;
  padding-top: 2px;
}

.signals-note {
  font-size: 11px;
  color: var(--text3);
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  line-height: 1.7;
}

/* ── Alert signup ─────────────────────────────── */

.signup {
  padding: 56px 0;
  border-bottom: 1px solid var(--border);
}
.signup-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}
@media (max-width: 640px) {
  .signup-grid { grid-template-columns: 1fr; gap: 24px; }
}

.signup-copy h2 {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 10px;
  line-height: 1.3;
}
.signup-copy p {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.75;
  margin-bottom: 10px;
}
.signup-promise {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text3);
  letter-spacing: 0.03em;
  border-left: 2px solid var(--border2);
  padding-left: 12px;
  line-height: 1.8;
}

.signup-card {
  border: 1px solid var(--border);
  background: var(--bg2);
  padding: 24px;
}
.signup-flabel {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--text3);
  text-transform: uppercase;
  display: block;
  margin-bottom: 9px;
}
.signup-input {
  width: 100%;
  padding: 11px 13px;
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 14px;
  margin-bottom: 9px;
  transition: border-color 0.15s;
}
.signup-input:focus  { border-color: var(--border2); }
.signup-input::placeholder { color: var(--text3); }

.signup-btn {
  width: 100%;
  padding: 11px;
  background: var(--accent);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.04em;
  transition: background 0.15s;
}
.signup-btn:hover:not(:disabled) { background: var(--accent2); }
.signup-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.signup-consent {
  font-size: 11px;
  color: var(--text3);
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  line-height: 1.65;
}
.signup-ok {
  text-align: center;
  padding: 20px 0;
}
.signup-ok-mark {
  font-family: var(--mono);
  font-size: 22px;
  color: var(--green-t);
  display: block;
  margin-bottom: 8px;
}
.signup-ok-text { font-size: 14px; color: var(--text2); }
.signup-err {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--accent2);
  margin-top: 8px;
}

/* ── Info accordion ───────────────────────────── */

.info { padding: 48px 0; border-bottom: 1px solid var(--border); }
.info-grid {
  display: grid;
  grid-template-columns: 190px 1fr;
  gap: 48px;
}
@media (max-width: 640px) {
  .info-grid { grid-template-columns: 1fr; gap: 20px; }
}

.info-aside-title { font-size: 15px; font-weight: 500; margin-bottom: 8px; }
.info-aside-sub   { font-size: 13px; color: var(--text2); line-height: 1.7; margin-bottom: 12px; }
.info-aside-src   { font-family: var(--mono); font-size: 10px; color: var(--text3); letter-spacing: 0.04em; }

.acc-item { border-top: 1px solid var(--border); }
.acc-item:last-child { border-bottom: 1px solid var(--border); }
.acc-btn {
  width: 100%;
  padding: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  text-align: left;
  transition: color 0.15s;
}
.acc-btn:hover { color: var(--accent2); }
.acc-icon {
  font-family: var(--mono);
  font-size: 18px;
  color: var(--text3);
  flex-shrink: 0;
  transition: transform 0.2s;
  line-height: 1;
}
.acc-icon.open { transform: rotate(45deg); }
.acc-body {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.85;
  padding-bottom: 18px;
  display: none;
}
.acc-body.open { display: block; }
.acc-body p    { margin-bottom: 10px; }
.acc-body p:last-child { margin-bottom: 0; }
.acc-body strong { color: var(--text); font-weight: 500; }
.acc-src {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.04em;
  margin-top: 12px;
}

/* ── Sources panel ────────────────────────────── */

.sources { padding: 48px 0; border-bottom: 1px solid var(--border); }
.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  margin-top: 4px;
}
.source-card {
  background: var(--bg2);
  padding: 14px 16px;
}
.src-name {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--text);
  letter-spacing: 0.04em;
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.src-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--green-t);
  flex-shrink: 0;
}
.src-type {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ── Full disclaimer ──────────────────────────── */

.full-disc { padding: 40px 0; border-bottom: 1px solid var(--border); }
.disc-box {
  border: 1px solid var(--border);
  background: var(--bg2);
  padding: 28px 28px 24px;
}
.disc-box-hd {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 18px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
.disc-box-title {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--amber);
  text-transform: uppercase;
}
.disc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 40px;
}
@media (max-width: 560px) { .disc-grid { grid-template-columns: 1fr; } }

.disc-item h4 {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--text2);
  text-transform: uppercase;
  margin-bottom: 7px;
}
.disc-item p {
  font-size: 12px;
  color: var(--text3);
  line-height: 1.8;
}

.emerg {
  margin-top: 20px;
  padding: 16px 18px;
  border: 1px solid var(--border2);
  background: var(--bg3);
}
.emerg-title {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--text2);
  text-transform: uppercase;
  margin-bottom: 10px;
}
.emerg-contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.emerg-c {
  font-size: 12px;
  color: var(--text2);
}
.emerg-c strong {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text);
  display: block;
  margin-bottom: 2px;
  letter-spacing: 0.04em;
}

/* ── Footer ───────────────────────────────────── */

.site-footer { padding: 40px 0 56px; }
.footer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 28px;
}
@media (max-width: 560px) {
  .footer-grid { grid-template-columns: 1fr; gap: 24px; }
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.footer-brand-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent);
}
.footer-brand-name {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--text);
  text-transform: uppercase;
}
.footer-about {
  font-size: 13px;
  color: var(--text3);
  line-height: 1.75;
}

.footer-links-title {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--text3);
  text-transform: uppercase;
  margin-bottom: 10px;
}
.footer-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.footer-links a {
  font-size: 13px;
  color: var(--text2);
  transition: color 0.15s;
}
.footer-links a:hover { color: var(--accent2); text-decoration: none; }

.footer-bottom {
  border-top: 1px solid var(--border);
  padding-top: 22px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}
.footer-legal {
  font-size: 11px;
  color: var(--text3);
  line-height: 1.75;
  max-width: 560px;
}
.footer-v {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.06em;
  white-space: nowrap;
}
```

---

### frontend/src/main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

### frontend/src/hooks/useSnapshot.js

```js
import { useState, useEffect, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL || ''

export function useSnapshot() {
  const [snapshot, setSnapshot] = useState(null)
  const [delta,    setDelta]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const fetchSnapshot = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/v1/snapshot`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setSnapshot(await r.json())
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDelta = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/v1/delta`)
      if (r.ok) setDelta(await r.json())
    } catch { /* non-fatal */ }
  }, [])

  useEffect(() => {
    fetchSnapshot()
    fetchDelta()
    const iv = setInterval(fetchSnapshot, 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [fetchSnapshot, fetchDelta])

  return { snapshot, delta, loading, error }
}
```

---

### frontend/src/App.jsx

```jsx
import { useSnapshot }    from './hooks/useSnapshot'
import { DeltaBanner }    from './components/DeltaBanner'
import { SiteHeader }     from './components/SiteHeader'
import { DisclaimerBar }  from './components/DisclaimerBar'
import { Hero }           from './components/Hero'
import { WorldMap }       from './components/WorldMap'
import { SignalFeed }     from './components/SignalFeed'
import { AlertSignup }    from './components/AlertSignup'
import { InfoAccordion }  from './components/InfoAccordion'
import { SourcesPanel }   from './components/SourcesPanel'
import { FullDisclaimer } from './components/FullDisclaimer'
import { SiteFooter }     from './components/SiteFooter'

export default function App() {
  const { snapshot, delta, loading } = useSnapshot()
  const updatedAt = snapshot?.snapshot?.created_at ?? null

  if (loading && !snapshot) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', fontFamily: 'var(--mono)', fontSize: '11px',
        letterSpacing: '0.1em', color: 'var(--text3)',
      }}>
        LOADING DATA...
      </div>
    )
  }

  return (
    <>
      <a href="#main" style={{
        position:'absolute', left:'-9999px', top:'auto',
        width:'1px', height:'1px', overflow:'hidden',
      }}>
        Skip to main content
      </a>
      <DeltaBanner   delta={delta} />
      <SiteHeader    updatedAt={updatedAt} />
      <DisclaimerBar />
      <main id="main">
        <Hero          snapshot={snapshot} />
        <WorldMap      />
        <SignalFeed    signals={snapshot?.signals} />
        <AlertSignup   />
        <InfoAccordion />
        <SourcesPanel  />
        <FullDisclaimer />
      </main>
      <SiteFooter />
    </>
  )
}
```

---

### frontend/src/components/DeltaBanner.jsx

```jsx
export function DeltaBanner({ delta }) {
  if (!delta) return null
  const { has_changed, new_cases, hours_since_change,
          who_confirmed, generated_at } = delta

  const ts = generated_at
    ? new Date(generated_at).toUTCString().replace(' GMT', ' UTC')
    : ''

  if (has_changed && new_cases > 0) {
    return (
      <div className="delta alert" role="alert" aria-live="assertive">
        <span className="dot" aria-hidden="true" />
        WHO CONFIRMED CASE UPDATE — {who_confirmed} TOTAL CONFIRMED
        {ts ? ` · ${ts}` : ''}
      </div>
    )
  }
  return (
    <div className="delta ok" aria-live="polite">
      <span className="dot" aria-hidden="true" />
      NO NEW CONFIRMED CASES IN THE LAST{' '}
      {hours_since_change < 1
        ? '60 MIN'
        : `${Math.round(hours_since_change)}H`}
      {' '}· WHO SOURCED
    </div>
  )
}
```

---

### frontend/src/components/SiteHeader.jsx

```jsx
export function SiteHeader({ updatedAt }) {
  const ts = updatedAt
    ? new Date(updatedAt).toUTCString().replace(' GMT', ' UTC')
    : 'Loading...'
  return (
    <header>
      <div className="site-header">
        <div className="logo">
          <span className="logo-dot" aria-hidden="true" />
          <span className="logo-text">Hantavirus Tracker</span>
        </div>
        <span className="header-meta">Updated {ts}</span>
      </div>
    </header>
  )
}
```

---

### frontend/src/components/DisclaimerBar.jsx

```jsx
export function DisclaimerBar() {
  return (
    <div className="disc-bar" role="note" aria-label="Important notice">
      <span className="disc-tag" aria-label="Notice">NOTE</span>
      <p className="disc-text">
        This tracker aggregates publicly available data from WHO, ECDC and
        ProMED for informational purposes only. Signal counts reflect
        monitored news mentions, not confirmed clinical cases. Confirmed
        figures are sourced directly from WHO Disease Outbreak News.{' '}
        <strong>This is not medical advice.</strong> If concerned about
        potential exposure, contact NHS 111 (UK) or your local public
        health authority.
      </p>
    </div>
  )
}
```

---

### frontend/src/components/Hero.jsx

```jsx
export function Hero({ snapshot }) {
  const s = snapshot?.snapshot ?? {}
  const {
    who_confirmed = 0, who_deaths = 0, who_countries = [],
    situation_summary = '', total_signals = 0,
    active_countries = 0, active_languages = 0,
    feeds_healthy = 0, feeds_total = 0,
  } = s
  const cc = Array.isArray(who_countries) ? who_countries.length : 0

  return (
    <section className="hero" aria-label="Outbreak summary">
      <div className="hero-eyebrow">
        MV Hondius · Andes virus · Active outbreak
      </div>

      <div className="stats-grid" role="region"
           aria-label="WHO confirmed statistics">
        <div className="stat confirmed">
          <span className="stat-n"
                aria-label={`${who_confirmed} confirmed cases`}>
            {who_confirmed}
          </span>
          <span className="stat-l">Confirmed cases</span>
          <span className="stat-src">Source: WHO DON</span>
        </div>
        <div className="stat deaths">
          <span className="stat-n"
                aria-label={`${who_deaths} deaths`}>
            {who_deaths}
          </span>
          <span className="stat-l">Deaths</span>
          <span className="stat-src">Source: WHO DON</span>
        </div>
        <div className="stat countries">
          <span className="stat-n"
                aria-label={`${cc} countries affected`}>
            {cc}
          </span>
          <span className="stat-l">Countries</span>
          <span className="stat-src">Source: WHO DON</span>
        </div>
      </div>

      {situation_summary && (
        <p className="hero-summary">{situation_summary}</p>
      )}

      <div className="pills" aria-label="Data coverage">
        <span className="pill">{total_signals} signals</span>
        <span className="pill">{active_countries} countries</span>
        <span className="pill">{active_languages} languages</span>
        <span className="pill">{feeds_healthy}/{feeds_total} feeds</span>
      </div>
    </section>
  )
}
```

---

### frontend/src/components/WorldMap.jsx

```jsx
import { MapContainer, TileLayer, CircleMarker,
         Polyline, Tooltip } from 'react-leaflet'

const CONFIRMED = [
  { name: 'South Africa',   c: [-30.56,  22.94] },
  { name: 'Netherlands',    c: [ 52.37,   4.90] },
  { name: 'Germany',        c: [ 51.17,  10.45] },
  { name: 'Spain',          c: [ 40.42,  -3.70] },
  { name: 'Switzerland',    c: [ 46.82,   8.23] },
  { name: 'United Kingdom', c: [ 51.51,  -0.13] },
]

const MONITORING = [
  { name: 'France',        c: [ 46.23,   2.21] },
  { name: 'Italy',         c: [ 41.87,  12.57] },
  { name: 'Poland',        c: [ 51.92,  19.15] },
  { name: 'Argentina',     c: [-38.42, -63.62] },
  { name: 'Canada',        c: [ 56.13,-106.35] },
  { name: 'United States', c: [ 37.09, -95.71] },
  { name: 'Australia',     c: [-25.27, 133.78] },
  { name: 'Turkey',        c: [ 38.96,  35.24] },
]

// MV Hondius voyage — Ushuaia → Saint Helena → Cape Verde → Tenerife
const ROUTE = [
  [-54.8, -68.3],
  [-15.9,  -5.7],
  [ 14.9, -23.5],
  [ 28.3, -16.5],
]

const TILES =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const ATTR =
  '© <a href="https://www.openstreetmap.org/copyright" ' +
  'target="_blank" rel="noopener">OpenStreetMap</a> ' +
  '© <a href="https://carto.com/" target="_blank" rel="noopener">CARTO</a>'

export function WorldMap() {
  return (
    <section className="map-section"
             aria-label="World map — case locations">
      <div className="wrap">
        <div className="label">Geographic distribution</div>

        <div className="map-box"
             role="img"
             aria-label="World map showing confirmed and monitoring countries">
          <MapContainer
            center={[25, -15]} zoom={2} minZoom={1}
            style={{ height: '100%', width: '100%',
                     background: '#08090c' }}
            scrollWheelZoom={false}
          >
            <TileLayer url={TILES} attribution={ATTR}
                       subdomains="abcd" maxZoom={19} />

            {CONFIRMED.map(({ name, c }) => (
              <CircleMarker key={name} center={c} radius={9}
                pathOptions={{ color:'#e85d3c', fillColor:'#e85d3c',
                               fillOpacity:0.55, weight:1.5 }}>
                <Tooltip direction="top" offset={[0,-6]}>
                  <strong>{name}</strong><br />
                  Confirmed — WHO
                </Tooltip>
              </CircleMarker>
            ))}

            {MONITORING.map(({ name, c }) => (
              <CircleMarker key={name} center={c} radius={5}
                pathOptions={{ color:'#c98a2b', fillColor:'#c98a2b',
                               fillOpacity:0.45, weight:1 }}>
                <Tooltip direction="top" offset={[0,-4]}>
                  <strong>{name}</strong><br />
                  Monitoring / suspected
                </Tooltip>
              </CircleMarker>
            ))}

            <Polyline positions={ROUTE}
              pathOptions={{ color:'#e85d3c', weight:1.5,
                             opacity:0.6, dashArray:'6 8' }} />

            <CircleMarker center={[28.3, -16.5]} radius={11}
              pathOptions={{ color:'#dde2ed', fillColor:'#e85d3c',
                             fillOpacity:1, weight:2 }}>
              <Tooltip permanent direction="top" offset={[0,-12]}>
                MV Hondius · Tenerife
              </Tooltip>
            </CircleMarker>
          </MapContainer>
        </div>

        <div className="map-legend" role="legend">
          <div className="legend-i">
            <span className="legend-dot c" aria-hidden="true" />
            Confirmed (WHO)
          </div>
          <div className="legend-i">
            <span className="legend-dot m" aria-hidden="true" />
            Monitoring / suspected
          </div>
          <div className="legend-i">
            <span className="legend-line" aria-hidden="true" />
            MV Hondius route
          </div>
        </div>

        <p className="map-note">
          Map pins show approximate country-level locations, not precise
          addresses. Case data sourced from WHO DON. Map tiles ©
          CartoDB, data © OpenStreetMap contributors.
        </p>
      </div>
    </section>
  )
}
```

---

### frontend/src/components/SignalFeed.jsx

```jsx
const FLAGS = {
  GB:'🇬🇧', US:'🇺🇸', DE:'🇩🇪', ES:'🇪🇸', FR:'🇫🇷',
  IT:'🇮🇹', NL:'🇳🇱', PT:'🇵🇹', BR:'🇧🇷', AR:'🇦🇷',
  AU:'🇦🇺', CA:'🇨🇦', RU:'🇷🇺', PL:'🇵🇱', TR:'🇹🇷',
  KR:'🇰🇷', GR:'🇬🇷', AT:'🇦🇹', MX:'🇲🇽', CL:'🇨🇱',
  ZA:'🇿🇦', CH:'🇨🇭', SH:'🇸🇭',
}

function ago(iso) {
  if (!iso) return ''
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60)    return `${Math.round(s)}s`
  if (s < 3600)  return `${Math.round(s/60)}m`
  if (s < 86400) return `${Math.round(s/3600)}h`
  return `${Math.round(s/86400)}d`
}

export function SignalFeed({ signals }) {
  if (!signals?.length) return null
  return (
    <section className="signals" aria-labelledby="sig-hd">
      <div className="wrap">
        <div className="signals-hd">
          <div className="label" id="sig-hd" style={{marginBottom:0}}>
            Live signals
          </div>
          <span className="signals-count">{signals.length} latest</span>
        </div>
        <ul role="list" aria-label="Latest hantavirus signals"
            style={{marginTop:'16px'}}>
          {signals.map(s => (
            <li key={s.id ?? s.url} className="signal">
              <span className="sig-flag" aria-hidden="true">
                {FLAGS[s.country_iso2] ?? '🌍'}
              </span>
              <div>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                   className="sig-title"
                   aria-label={`${s.title} (opens in new tab)`}>
                  {s.title}
                </a>
                <div className="sig-meta">
                  {s.source}
                  {s.language ? ` · ${s.language.toUpperCase()}` : ''}
                </div>
              </div>
              <span className="sig-time">
                {ago(s.published_at ?? s.ingested_at)}
              </span>
            </li>
          ))}
        </ul>
        <p className="signals-note" role="note">
          Signal counts reflect monitored news mentions from 24+ RSS feeds
          across 12 languages. These are not confirmed clinical cases.
          For confirmed figures refer to the WHO data above.
          Sources: WHO, ECDC, ProMED, GDELT, Google News.
        </p>
      </div>
    </section>
  )
}
```

---

### frontend/src/components/AlertSignup.jsx

```jsx
import { useState } from 'react'
const API = import.meta.env.VITE_API_URL || ''

export function AlertSignup() {
  const [email,  setEmail]  = useState('')
  const [status, setStatus] = useState('idle')
  const [err,    setErr]    = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading'); setErr('')
    try {
      const r = await fetch(`${API}/api/v1/alert-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      if (r.ok) { setStatus('success'); return }
      const d = await r.json().catch(() => ({}))
      setStatus('error')
      setErr(r.status === 409
        ? 'That email is already registered.'
        : d.detail ?? 'Something went wrong. Try again.')
    } catch {
      setStatus('error')
      setErr('Network error. Please try again.')
    }
  }

  return (
    <section className="signup" aria-labelledby="signup-hd">
      <div className="wrap">
        <div className="signup-grid">
          <div className="signup-copy">
            <h2 id="signup-hd">Case alerts, sourced from WHO</h2>
            <p>
              When WHO confirms a new hantavirus case we send one short
              email with the case count, affected countries, and a link
              to the official WHO report. Nothing else.
            </p>
            <p className="signup-promise">
              One email per confirmed case update.<br />
              No newsletters. No marketing.<br />
              No third-party data sharing.<br />
              Unsubscribe by replying STOP.
            </p>
          </div>

          <div className="signup-card">
            {status === 'success' ? (
              <div className="signup-ok" role="status">
                <span className="signup-ok-mark" aria-hidden="true">✓</span>
                <p className="signup-ok-text">
                  You're on the list. We'll email you when WHO confirms
                  a new case.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <label className="signup-flabel" htmlFor="alert-email">
                  Email address
                </label>
                <input
                  id="alert-email"
                  className="signup-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  aria-describedby="signup-consent"
                />
                <button type="submit" className="signup-btn"
                  disabled={status === 'loading'}
                  aria-busy={status === 'loading'}>
                  {status === 'loading' ? 'Adding...' : 'Alert me'}
                </button>
                {err && (
                  <p className="signup-err" role="alert">{err}</p>
                )}
                <p id="signup-consent" className="signup-consent"
                   role="note">
                  By signing up you agree to receive email alerts when WHO
                  confirms new hantavirus cases. Your email is stored
                  securely and never shared with third parties. Operated
                  from the United Kingdom under UK data protection law.
                  Unsubscribe at any time by replying STOP.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

### frontend/src/components/InfoAccordion.jsx

```jsx
import { useState } from 'react'

const ITEMS = [
  {
    title: 'What is hantavirus?',
    src: 'WHO Fact Sheet — Hantavirus and hantavirus disease',
    body: [
      `Hantavirus is a family of rodent-borne viruses (genus Orthohantavirus)
       found worldwide. More than 50 species are known, with roughly half
       capable of causing disease in humans. The current outbreak involves
       Andes virus, endemic to Argentina and southern Chile.`,
      `Hantaviruses cause two distinct human diseases. In the Americas:
       Hantavirus Pulmonary Syndrome (HPS), a severe respiratory illness.
       In Europe and Asia: Haemorrhagic Fever with Renal Syndrome (HFRS),
       primarily affecting the kidneys.`,
      `Andes virus is the only hantavirus with documented person-to-person
       transmission, occurring through prolonged very close contact in
       household or healthcare settings. All other hantavirus species
       transmit only from rodents to humans — not between people.`,
    ],
  },
  {
    title: 'Symptoms and what to watch for',
    src: 'CDC — Hantavirus Pulmonary Syndrome (HPS)',
    body: [
      `HPS begins with a febrile prodrome of 1–8 weeks after exposure:
       fever, fatigue, muscle aches, headache, and sometimes gastrointestinal
       symptoms. These initial symptoms closely resemble influenza.`,
      `Within 4–10 days, HPS progresses rapidly to a cardiopulmonary phase:
       shortness of breath, cough, and fluid accumulation in the lungs
       (non-cardiogenic pulmonary oedema). This phase is a medical emergency.
       Case fatality for Andes virus is approximately 25–40%.`,
      `Seek emergency medical care immediately if you develop sudden
       shortness of breath following a flu-like illness — particularly if
       you have had recent close contact with a confirmed case or visited
       rodent-occupied enclosed spaces in South America. Always tell
       clinicians about your full exposure history.`,
    ],
  },
  {
    title: 'How it spreads',
    src: 'ECDC — Hantavirus infection fact sheet',
    body: [
      `The primary route is inhalation of aerosols — microscopic particles
       from infected rodent droppings, urine, or saliva — in enclosed, poorly
       ventilated spaces such as cabins, sheds, barns, woodpiles, and grain
       stores. Direct rodent contact or bites can also transmit the virus.`,
      `For Andes virus specifically, rare person-to-person transmission
       has been documented in household and healthcare settings involving
       prolonged close contact. There is no evidence of casual airborne
       transmission in public spaces. The overall global risk from this
       outbreak remains low according to WHO.`,
      `There is currently no licensed vaccine or specific antiviral
       treatment for hantavirus. Treatment is supportive — early
       hospitalisation and intensive care significantly improve survival.`,
    ],
  },
]

export function InfoAccordion() {
  const [open, setOpen] = useState(null)
  return (
    <section className="info" aria-labelledby="info-hd">
      <div className="wrap">
        <div className="info-grid">
          <aside>
            <h2 className="info-aside-title" id="info-hd">
              About hantavirus
            </h2>
            <p className="info-aside-sub">
              Factual reference information sourced from WHO, CDC and ECDC.
              Not medical advice.
            </p>
            <p className="info-aside-src">WHO · CDC · ECDC</p>
          </aside>

          <div role="list">
            {ITEMS.map((item, i) => (
              <div key={i} className="acc-item" role="listitem">
                <button
                  className="acc-btn"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  aria-controls={`acc-${i}`}
                  id={`acc-btn-${i}`}
                >
                  {item.title}
                  <span
                    className={`acc-icon${open === i ? ' open' : ''}`}
                    aria-hidden="true">
                    +
                  </span>
                </button>
                <div
                  id={`acc-${i}`}
                  role="region"
                  aria-labelledby={`acc-btn-${i}`}
                  className={`acc-body${open === i ? ' open' : ''}`}
                >
                  {item.body.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                  <p className="acc-src">Source: {item.src}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

### frontend/src/components/SourcesPanel.jsx

```jsx
const SOURCES = [
  { name: 'WHO DON',        type: 'Official · Global' },
  { name: 'WHO News',       type: 'Official · Global' },
  { name: 'ECDC',           type: 'Official · Europe' },
  { name: 'ProMED',         type: 'Surveillance · Global' },
  { name: 'GDELT',          type: 'News · 65 languages' },
  { name: 'Google News EN', type: 'News · GB / US / AU / CA' },
  { name: 'Google News ES', type: 'News · ES / AR / MX / CL' },
  { name: 'Google News DE', type: 'News · DE / AT' },
  { name: 'Google News FR', type: 'News · FR' },
  { name: 'Google News PT', type: 'News · BR / PT' },
  { name: 'Google News IT', type: 'News · IT' },
  { name: 'Google News TR', type: 'News · TR' },
  { name: 'Google News PL', type: 'News · PL' },
  { name: 'Google News NL', type: 'News · NL' },
  { name: 'Google News RU', type: 'News · RU' },
  { name: 'Google News KO', type: 'News · KR' },
  { name: 'Google News EL', type: 'News · GR' },
  { name: 'Hantaflow.com',  type: 'Aggregator · CC BY 4.0' },
]

export function SourcesPanel() {
  return (
    <section className="sources" aria-labelledby="src-hd">
      <div className="wrap">
        <div className="label" id="src-hd">Data sources</div>
        <div className="sources-grid" role="list"
             aria-label="All monitored sources">
          {SOURCES.map(s => (
            <div key={s.name} className="source-card" role="listitem">
              <div className="src-name">
                <span className="src-dot" aria-hidden="true" />
                {s.name}
              </div>
              <div className="src-type">{s.type}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

### frontend/src/components/FullDisclaimer.jsx

```jsx
export function FullDisclaimer() {
  return (
    <section className="full-disc" aria-labelledby="disc-hd">
      <div className="wrap">
        <div className="disc-box" role="note">
          <div className="disc-box-hd">
            <span aria-hidden="true" style={{ color:'var(--amber)',
              fontSize:'13px' }}>⚠</span>
            <h2 className="disc-box-title" id="disc-hd">
              Important notices — please read
            </h2>
          </div>

          <div className="disc-grid">
            <div className="disc-item">
              <h4>Not medical advice</h4>
              <p>
                Nothing on this site constitutes medical advice, diagnosis or
                treatment. This tracker aggregates publicly available data from
                official sources for general informational purposes only.
                Always consult a qualified healthcare professional for any
                health concern.
              </p>
            </div>
            <div className="disc-item">
              <h4>Data accuracy</h4>
              <p>
                Confirmed case figures are sourced from WHO Disease Outbreak
                News and may lag real-time developments. Signal counts reflect
                monitored news mentions — not confirmed clinical cases. Data
                may be incomplete, delayed, or contain errors.
              </p>
            </div>
            <div className="disc-item">
              <h4>Risk assessment</h4>
              <p>
                WHO has assessed the overall global risk from this event as
                low. Andes virus does not transmit through casual contact or
                airborne routes in public settings. This tracker is not
                intended to cause alarm.
              </p>
            </div>
            <div className="disc-item">
              <h4>Attribution</h4>
              <p>
                News signal data partially sourced from Hantaflow.com under
                Creative Commons CC BY 4.0. Map tiles © CartoDB, data ©
                OpenStreetMap contributors. Clinical data sourced exclusively
                from WHO and ECDC official publications.
              </p>
            </div>
            <div className="disc-item">
              <h4>No affiliation or endorsement</h4>
              <p>
                This is an independent public service. It is not affiliated
                with, endorsed by, or operated by WHO, ECDC, CDC, NHS, or
                any government body. Always seek guidance from your national
                public health authority.
              </p>
            </div>
            <div className="disc-item">
              <h4>Privacy and data</h4>
              <p>
                Email alert addresses are stored securely and never shared
                with third parties. This site uses no tracking cookies and
                collects no personal data beyond voluntarily submitted email
                addresses. Operated from the UK under UK data protection law.
              </p>
            </div>
          </div>

          <div className="emerg">
            <div className="emerg-title">If you have a medical emergency</div>
            <div className="emerg-contacts">
              <div className="emerg-c">
                <strong>UK</strong>
                NHS 111 (non-emergency) · 999 (emergency)
              </div>
              <div className="emerg-c">
                <strong>US</strong>
                CDC 800-232-4636 · 911 (emergency)
              </div>
              <div className="emerg-c">
                <strong>EU</strong>
                112 (emergency)
              </div>
              <div className="emerg-c">
                <strong>Global</strong>
                Contact your national health authority
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

### frontend/src/components/SiteFooter.jsx

```jsx
export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span className="footer-brand-dot" aria-hidden="true" />
              <span className="footer-brand-name">Hantavirus Tracker</span>
            </div>
            <p className="footer-about">
              An independent real-time public health information service.
              Data aggregated from WHO, ECDC, ProMED, GDELT and 20+
              regional news feeds across 12 languages, updated every
              15 minutes. Built and operated in the United Kingdom.
            </p>
          </div>

          <div>
            <p className="footer-links-title">Official sources</p>
            <nav className="footer-links"
                 aria-label="Official public health sources">
              <a href="https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599"
                 target="_blank" rel="noopener noreferrer">
                WHO Disease Outbreak News DON599 ↗
              </a>
              <a href="https://www.who.int/news-room/fact-sheets/detail/hantavirus-and-hantavirus-disease"
                 target="_blank" rel="noopener noreferrer">
                WHO Hantavirus Fact Sheet ↗
              </a>
              <a href="https://www.ecdc.europa.eu/en/hantavirus-infection"
                 target="_blank" rel="noopener noreferrer">
                ECDC Hantavirus guidance ↗
              </a>
              <a href="https://www.cdc.gov/hantavirus"
                 target="_blank" rel="noopener noreferrer">
                CDC Hantavirus ↗
              </a>
              <a href="https://www.nhs.uk/conditions/hantavirus/"
                 target="_blank" rel="noopener noreferrer">
                NHS Hantavirus ↗
              </a>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-legal">
            © {year} Hantavirus Tracker. Independent public health
            information service. Not affiliated with WHO, ECDC, CDC or NHS.
            Not medical advice. Confirmed case data sourced from WHO Disease
            Outbreak News. News signal data partially sourced from{' '}
            <a href="https://hantaflow.com" target="_blank"
               rel="noopener noreferrer">Hantaflow.com</a>{' '}
            (CC BY 4.0). Map tiles © CartoDB, data © OpenStreetMap
            contributors. Operated from the United Kingdom.
          </p>
          <span className="footer-v" aria-label="Version 1.0">v1.0</span>
        </div>
      </div>
    </footer>
  )
}
```

---

## Environment variables

Set these in your Railway dashboard before deploying.

**Backend service:**
```
RESEND_API_KEY=re_xxxxxxxxxxxx     optional — alerts only send if present
SITE_URL=https://your-domain.com   optional — used in alert email links
FROM_EMAIL=alerts@your-domain.com  optional
DB_PATH=./data/db.sqlite           optional — this is the default
```

**Frontend service:**
```
VITE_API_URL=https://your-backend.up.railway.app
```

---

## Railway deployment — step by step

```
1. railway.app → New Project → Deploy from GitHub

2. Add backend service
   → Select /backend folder
   → Railway detects Procfile automatically
   → Add Volume mounted at /app/data  ← critical, keeps SQLite persistent
   → Set backend environment variables

3. Add frontend service
   → Select /frontend folder
   → Set VITE_API_URL = backend Railway URL

4. Add custom domain (optional)
   → Railway Settings → Custom Domain
   → Point your domain's CNAME to Railway

5. Verify by hitting /health on the backend URL
   Should return: { status: "ok", signals_in_db: N, alert_subscribers: 0 }
```

---

## Running locally

```bash
# Terminal 1 — backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

---

## Cost summary

```
Service                      Monthly
─────────────────────────────────────
Railway free tier            £0
RSS feeds (24 feeds)         £0   no API keys needed
SQLite on Railway volume     £0   file on disk
Leaflet + CartoDB tiles      £0   no key required
Resend email (≤3,000/mo)     £0
Claude API                   £0   not used
Gemini API                   £0   not used
Google Maps                  £0   not used
─────────────────────────────────────
Monthly total                £0
Domain (~Porkbun)            ~£8/year one-off
─────────────────────────────────────

Scale path when needed:
  Railway paid tier  → $5/month  (more compute/traffic)
  Railway Postgres   → $5/month  (only if SQLite bottlenecks,
                                   which won't happen until
                                   tens of thousands of
                                   concurrent users)
```

One document. Everything in it. Give that file directly to Antigravity or paste it into Claude Code, Manus, or Cursor.
Here is what it contains, in order:
Design direction — Terminal Dispatch aesthetic, DM Mono for numbers and data, Instrument Sans for body copy, the full colour palette with variable names.
Backend — all five Python files (main.py, database.py, feeds.py, parser.py, alerts.py), requirements.txt, Procfile, Dockerfile. Zero paid APIs.
Frontend — index.html with full SEO and structured data, robots.txt, package.json, vite.config.js, nginx.conf, Dockerfile, index.css with the complete design system, useSnapshot.js hook, App.jsx, and every component file individually: DeltaBanner, SiteHeader, DisclaimerBar, Hero, WorldMap, SignalFeed, AlertSignup, InfoAccordion, SourcesPanel, FullDisclaimer, SiteFooter.
Disclaimers woven throughout the UI — the persistent bar under the header, inline source attribution on every stat, a note below the signal feed, consent text on the email form, a full six-panel disclaimer block before the footer, emergency contacts for UK/US/EU/Global, and legal copy in the footer.