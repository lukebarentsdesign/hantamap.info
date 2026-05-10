The honest truth about the data problem first
The WHO DON599 page is one specific outbreak page. BeautifulSoup parsing it works right now but breaks the moment WHO changes their HTML structure, which they do constantly. You need RSS feeds that are stable, free, and don't require parsing brittle HTML.
Here are the genuinely free and stable data sources:
WHO Disease Outbreak News RSS — https://www.who.int/rss-feeds/news-english.xml — free, stable, official. Includes hantavirus alerts.
ProMED RSS — https://promedmail.org/feed/ — the gold standard infectious disease alert network, predates WHO digital infrastructure, extremely reliable RSS, completely free. MassSass99 listed it as blocked in his source ledger but it works fine with a proper user agent header.
CDC RSS — https://tools.cdc.gov/api/v2/resources/media/132608.rss — free, official US surveillance.
Google News RSS — https://news.google.com/rss/search?q=hantavirus&hl=en — free, no API key, no rate limit that matters at small scale, updates constantly. This is what Hantaflow uses and it works perfectly.
GDELT — https://api.gdeltproject.org/api/v2/doc/doc?query=hantavirus&mode=artlist&format=rss — free, global news monitoring in 60+ languages, no key needed.
All of these are pure RSS. Python's built-in feedparser library handles them all. No API keys, no billing, no scraping fragile HTML. Total data cost: £0.