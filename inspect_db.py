import sqlite3, json
conn = sqlite3.connect('backend/data/db.sqlite')
conn.row_factory = sqlite3.Row
rows = conn.execute("SELECT DISTINCT country_iso2 FROM signals WHERE country_iso2 IS NOT NULL").fetchall()
codes = [r['country_iso2'] for r in rows]
print('Unique signal codes:', codes)

row = conn.execute('SELECT who_countries FROM snapshots ORDER BY created_at DESC LIMIT 1').fetchone()
print('Snapshot who_countries:', row['who_countries'])
conn.close()
