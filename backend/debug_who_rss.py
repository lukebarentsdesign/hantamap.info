import requests, feedparser, re
url = "https://www.who.int/rss-feeds/news-english.xml"
resp = requests.get(url)
parsed = feedparser.parse(resp.content)
death_patterns = [r"(\d+)\s+death", r"(\d+)\s+(?:people\s+)?(?:have\s+)?died", r"resulted\s+in\s+(\d+)\s+death", r"(\d+)\s+fatal"]
for e in parsed.entries:
    text = f"{e.title} {e.get('summary','')}"
    for pat in death_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            print(f"MATCH {m.group(1)}: {e.title}")
