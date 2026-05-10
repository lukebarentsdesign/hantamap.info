import sqlite3, re
conn = sqlite3.connect('data/db.sqlite')
conn.row_factory = sqlite3.Row
cursor = conn.execute("SELECT * FROM signals")
rows = [dict(r) for r in cursor.fetchall()]
death_patterns = [r"(\d+)\s+death", r"(\d+)\s+(?:people\s+)?(?:have\s+)?died", r"resulted\s+in\s+(\d+)\s+death", r"(\d+)\s+fatal"]

for r in rows:
    text = f"{r['title']} {r.get('summary', '')}"
    for pat in death_patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            num = int(match.group(1))
            if num > 100: # Finding that alarmist 1300
                 print(f"MATCH {num}: {r['source']}: {r['title']}")
conn.close()
