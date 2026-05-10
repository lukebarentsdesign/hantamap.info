REVISED SESSION 1 — Backend, genuinely free, Railway-ready
Build a Python FastAPI application ready to deploy on Railway.app. Single file service with a background scheduler. Uses SQLite for storage, feedparser for RSS ingestion, no paid APIs of any kind.
The app needs these dependencies: fastapi, uvicorn, apscheduler, feedparser, requests, python-dotenv, resend. Store them in requirements.txt. Include a Procfile containing web: uvicorn main:app --host 0.0.0.0 --port $PORT for Railway deployment.
Database setup: on startup create a SQLite database file at ./data/db.sqlite with three tables.
Table snapshots with columns: id integer primary key, created_at text, who_confirmed integer, who_suspected integer, who_deaths integer, who_countries text storing JSON array, situation_summary text.
Table signals with columns: id integer primary key, snapshot_id integer, title text, url text, source text, language text, country_iso2 text, published_at text.
Table alerts with columns: id integer primary key, email text unique, created_at text.
Background task runs every 15 minutes using APScheduler. It does the following in order:
First, fetch these four RSS feeds using feedparser and merge the results, deduplicating by URL:
https://news.google.com/rss/search?q=hantavirus&hl=en-US&gl=US&ceid=US:en
https://news.google.com/rss/search?q=hantavirus&hl=en-GB&gl=GB&ceid=GB:en
https://www.who.int/rss-feeds/news-english.xml
https://api.gdeltproject.org/api/v2/doc/doc?query=hantavirus&mode=artlist&format=rss
For each feed entry extract title, link, source, published date. Try to detect the country from the source domain using a simple lookup dictionary mapping common news domains to ISO2 country codes. Detect language from the feed's hl parameter or default to en.
Second, scan the merged feed entries for WHO case count updates. Look for entries where the title or summary contains words like confirmed, cases, deaths combined with numbers. Use a simple regex pattern to extract integers near these keywords. If you find numbers that look like case counts, update the who_data. If you cannot confidently extract numbers, keep the previous snapshot values rather than writing zeros.
Third, if who_confirmed changed from the last snapshot, generate a new situation_summary string using an f-string: "As of [today's date], WHO has confirmed [who_confirmed] cases of Andes hantavirus linked to the MV Hondius cruise ship, with [who_deaths] deaths across [len(countries)] countries. All confirmed cases involve the Andes virus strain. WHO assesses the overall global risk as low."
Fourth, write a new row to the snapshots table and write all the deduplicated signal entries to the signals table linked to that snapshot id. Keep only the last 500 signals total, delete older ones to keep the SQLite file small.
Expose these endpoints:
GET /api/v1/snapshot — query the latest snapshot row plus its 20 most recent signals, return as JSON.
GET /api/v1/delta — compare latest two snapshot rows, return has_changed boolean, new_cases integer, new_countries array, hours_since_change integer.
POST /api/v1/alert-signup — accept JSON body with email field, validate it contains @ and a dot, insert to alerts table, return 200 on success, 409 if email already exists, 400 if invalid. If the Resend API key environment variable exists, send a welcome email using the Resend Python SDK.
GET /health — return 200 OK with timestamp, for Railway health checks.
Environment variables needed: RESEND_API_KEY (optional, email only sends if present), SITE_URL (used in emails).

FREE RSS FEEDS — GLOBAL COVERAGE
Official sources — the authoritative ones
WHO Disease Outbreak News: https://www.who.int/rss-feeds/news-english.xml
WHO Global Alert and Response: https://www.who.int/feeds/entity/csr/don/en/rss.xml
ECDC (European Centre for Disease Prevention and Control): https://www.ecdc.europa.eu/en/rss.xml — this is critical for a UK developer, ECDC covers Europe properly including post-Brexit UK surveillance
ProMED International: https://promedmail.org/feed/ — oldest infectious disease alert network in the world, genuinely global, covers outbreaks WHO takes weeks to officially notice
GDELT Global News: https://api.gdeltproject.org/api/v2/doc/doc?query=hantavirus&mode=artlist&format=rss — monitors news in 65 languages across every country simultaneously, completely free
Google News RSS by region — pull all of these, free, no key needed
English UK: https://news.google.com/rss/search?q=hantavirus&hl=en-GB&gl=GB&ceid=GB:en
English global: https://news.google.com/rss/search?q=hantavirus&hl=en&gl=US&ceid=US:en
English Australia: https://news.google.com/rss/search?q=hantavirus&hl=en-AU&gl=AU&ceid=AU:en
English Canada: https://news.google.com/rss/search?q=hantavirus&hl=en-CA&gl=CA&ceid=CA:en
Spanish Spain: https://news.google.com/rss/search?q=hantavirus&hl=es-ES&gl=ES&ceid=ES:es
Spanish Argentina: https://news.google.com/rss/search?q=hantavirus&hl=es-419&gl=AR&ceid=AR:es-419
Spanish Latin America: https://news.google.com/rss/search?q=hantavirus&hl=es-419&gl=MX&ceid=MX:es-419
German Germany: https://news.google.com/rss/search?q=hantavirus&hl=de&gl=DE&ceid=DE:de
German Austria: https://news.google.com/rss/search?q=hantavirus&hl=de&gl=AT&ceid=AT:de
French France: https://news.google.com/rss/search?q=hantavirus&hl=fr&gl=FR&ceid=FR:fr
Portuguese Brazil: https://news.google.com/rss/search?q=hantavirus&hl=pt-BR&gl=BR&ceid=BR:pt-419
Portuguese Portugal: https://news.google.com/rss/search?q=hantavirus&hl=pt-PT&gl=PT&ceid=PT:pt-150
Italian: https://news.google.com/rss/search?q=hantavirus&hl=it&gl=IT&ceid=IT:it
Turkish: https://news.google.com/rss/search?q=hantavirüs&hl=tr&gl=TR&ceid=TR:tr
Polish: https://news.google.com/rss/search?q=hantawirus&hl=pl&gl=PL&ceid=PL:pl
Dutch Netherlands: https://news.google.com/rss/search?q=hantavirus&hl=nl&gl=NL&ceid=NL:nl
Russian: https://news.google.com/rss/search?q=хантавирус&hl=ru&gl=RU&ceid=RU:ru
Korean: https://news.google.com/rss/search?q=한타바이러스&hl=ko&gl=KR&ceid=KR:ko
Greek: https://news.google.com/rss/search?q=hantavirus&hl=el&gl=GR&ceid=GR:el
Note the Turkish, Polish, Russian and Korean queries use the local language spelling of hantavirus — this matters, otherwise you miss most of the coverage in those countries.

REVISED SESSION 1 — fully rewritten, UK developer, global coverage, zero cost
Build a Python FastAPI application ready to deploy on Railway.app. Single service with a background scheduler. Uses SQLite for storage, feedparser for RSS ingestion, no paid APIs anywhere.
Dependencies: fastapi, uvicorn, apscheduler, feedparser, requests, python-dotenv, resend. Put them in requirements.txt. Include a Procfile containing web: uvicorn main:app --host 0.0.0.0 --port $PORT for Railway.
On startup create a SQLite database at ./data/db.sqlite with three tables.
Table snapshots: id integer primary key, created_at text, who_confirmed integer, who_suspected integer, who_deaths integer, who_countries text as JSON array, situation_summary text.
Table signals: id integer primary key, snapshot_id integer, title text, url text unique, source text, language text, country_iso2 text, published_at text.
Table alerts: id integer primary key, email text unique, created_at text.
Background task runs every 15 minutes using APScheduler. Here is exactly what it does:
Stage 1 — fetch all RSS feeds
Fetch all of the following feeds using feedparser. Set a user agent header of "HantavirusTracker/1.0 (+https://[your domain]; public health monitoring)" on every request — some feeds block default Python user agents. Fetch them all concurrently using Python's ThreadPoolExecutor with a max of 8 workers and a 10 second timeout per feed. If any individual feed fails, log the error and continue — never let one broken feed crash the whole task.
The feeds to fetch:
https://www.who.int/rss-feeds/news-english.xml
https://www.who.int/feeds/entity/csr/don/en/rss.xml
https://www.ecdc.europa.eu/en/rss.xml
https://promedmail.org/feed/
https://api.gdeltproject.org/api/v2/doc/doc?query=hantavirus&mode=artlist&format=rss
https://news.google.com/rss/search?q=hantavirus&hl=en-GB&gl=GB&ceid=GB:en
https://news.google.com/rss/search?q=hantavirus&hl=en&gl=US&ceid=US:en
https://news.google.com/rss/search?q=hantavirus&hl=en-AU&gl=AU&ceid=AU:en
https://news.google.com/rss/search?q=hantavirus&hl=en-CA&gl=CA&ceid=CA:en
https://news.google.com/rss/search?q=hantavirus&hl=es-ES&gl=ES&ceid=ES:es
https://news.google.com/rss/search?q=hantavirus&hl=es-419&gl=AR&ceid=AR:es-419
https://news.google.com/rss/search?q=hantavirus&hl=es-419&gl=MX&ceid=MX:es-419
https://news.google.com/rss/search?q=hantavirus&hl=de&gl=DE&ceid=DE:de
https://news.google.com/rss/search?q=hantavirus&hl=de&gl=AT&ceid=AT:de
https://news.google.com/rss/search?q=hantavirus&hl=fr&gl=FR&ceid=FR:fr
https://news.google.com/rss/search?q=hantavirus&hl=pt-BR&gl=BR&ceid=BR:pt-419
https://news.google.com/rss/search?q=hantavirus&hl=pt-PT&gl=PT&ceid=PT:pt-150
https://news.google.com/rss/search?q=hantavirus&hl=it&gl=IT&ceid=IT:it
https://news.google.com/rss/search?q=hantavirüs&hl=tr&gl=TR&ceid=TR:tr
https://news.google.com/rss/search?q=hantawirus&hl=pl&gl=PL&ceid=PL:pl
https://news.google.com/rss/search?q=hantavirus&hl=nl&gl=NL&ceid=NL:nl
https://news.google.com/rss/search?q=хантавирус&hl=ru&gl=RU&ceid=RU:ru
https://news.google.com/rss/search?q=한타바이러스&hl=ko&gl=KR&ceid=KR:ko
https://news.google.com/rss/search?q=hantavirus&hl=el&gl=GR&ceid=GR:el
For each entry extract: title, link as url, the feed's source name, published date parsed to ISO format. Detect language from the feed URL's hl parameter — for example hl=fr means language is fr, hl=pt-BR means pt, hl=ko means ko, default to en if not found. Detect country from the feed URL's gl parameter — gl=GB means GB, gl=DE means DE, gl=AR means AR, and so on.
Deduplicate all entries across all feeds by URL. Insert only new URLs into the signals table, skip any URL already present. Keep only the 1000 most recent signals in the table, delete older ones to keep the SQLite file small.
Stage 2 — extract WHO case counts from feed content
Search through all fetched entries for items from WHO or ECDC sources. For WHO and ECDC entries, look in the title and summary fields for patterns indicating confirmed case counts. Use these regex patterns:
To find confirmed cases: search for the word confirmed or bestätigt or confirmados or confirmés near a number, capture the number.
To find deaths: search for deaths or gestorben or muertes or décès near a number, capture the number.
To find countries: look for country names from a predefined list including South Africa, Netherlands, Germany, Spain, Switzerland, United Kingdom, France, Italy, Argentina, Canada, United States, Australia near words like cases or confirmed.
Only update the stored case counts if the newly found numbers are greater than or equal to the current stored numbers — never let them go down, as that indicates a parsing error not a real decrease.
If no WHO or ECDC entries are found this run, carry forward the previous snapshot's case counts unchanged.
Stage 3 — generate situation summary
If who_confirmed changed since the last snapshot, generate a new situation_summary using this Python f-string exactly:
f"As of {today}, WHO has confirmed {who_confirmed} cases of Andes hantavirus linked to the MV Hondius cruise ship, with {who_deaths} deaths across {len(who_countries)} countries including {', '.join(who_countries[:3])}. The Andes strain is the only hantavirus known to transmit between people in rare cases of close contact. WHO assesses the global risk as low. This tracker covers {total_signals} signals across {active_countries} countries in {active_languages} languages."
If who_confirmed has not changed, reuse the previous summary unchanged.
Stage 4 — write to database
Insert a new row to snapshots table. Link the current batch of signals to this snapshot id. Log how many new signals were added and whether case counts changed.
Endpoints:
GET /api/v1/snapshot — return the latest snapshot row joined with its 30 most recent signals as JSON. Include a sources array listing all feed names that successfully returned data in the last run.
GET /api/v1/delta — compare the latest two snapshot rows. Return has_changed boolean, new_cases integer, new_countries array of strings, hours_since_change float calculated from the created_at timestamps.
POST /api/v1/alert-signup — accept JSON body with email field. Validate it contains exactly one @ symbol and at least one dot after the @. Insert to alerts table. Return 200 on success, 409 if email already exists, 400 if invalid. If environment variable RESEND_API_KEY is set, send a welcome email via Resend SDK saying "You're on the list. We'll email you when WHO confirms a new case."
GET /health — return 200 with current timestamp and count of signals in database. Railway uses this for health checks.
Environment variables: RESEND_API_KEY optional, SITE_URL optional, both default gracefully if absent.