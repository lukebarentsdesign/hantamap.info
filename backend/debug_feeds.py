import feeds, parser
res = feeds.fetch_all_feeds()
entries = res['entries']
authoritative = {"WHO", "WHO DON", "ECDC", "ProMED"}
for e in entries:
    if e.get("source") in authoritative:
        text = f"{e.get('title', '')} {e.get('summary', '')}"
        d = parser._extract_number(text, parser.DEATH_PATTERNS)
        if d and d > 100:
             print(f"MATCHED {d} from source {e['source']}:")
             print(f"Title: {e['title']}")
             print(f"Summary: {e['summary'][:200]}")
