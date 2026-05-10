import sqlite3
import os

KEYWORDS = ['death', 'died', 'dead', 'fatal', 'mortality', 'muert', 'fallec', 'décès', 'tod', 'morto']

def run():
    # Standard location used in project
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'data', 'db.sqlite'))
    print(f"Checking DB: {db_path}")
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, country_iso2, title, url FROM signals")
    rows = cursor.fetchall()
    
    print(f"\nTotal signals scanned: {len(rows)}")
    
    triggered = []
    for r in rows:
        text = f"{r['title'] or ''}".lower()
        matched = [kw for kw in KEYWORDS if kw in text]
        if matched:
            triggered.append((r, matched))
            
    print(f"Signals triggering DEATH ({len(triggered)} total):")
    for item, ms in triggered[:15]:
        print("-" * 40)
        print(f"ID: {item['id']} | Country: {item['country_iso2']}")
        print(f"Title: {item['title'][:100]}")
        print(f"URL: {item['url'][:50]}")
        print(f"MATCHED KEYWORDS: {ms}")
        
    conn.close()

if __name__ == "__main__":
    run()
