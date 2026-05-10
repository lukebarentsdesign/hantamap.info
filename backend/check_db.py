import sqlite3
conn = sqlite3.connect('data/db.sqlite')
conn.row_factory = sqlite3.Row
authoritative = ('WHO', 'WHO DON', 'ECDC', 'ProMED')
cursor = conn.execute("SELECT title, source, url FROM signals WHERE source IN (?,?,?,?)", authoritative)
rows = [dict(r) for r in cursor.fetchall()]
for r in rows:
    print(f"{r['source']}: {r['title']}")
conn.close()
