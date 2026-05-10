import sqlite3
conn = sqlite3.connect('backend/data/db.sqlite')
cursor = conn.execute("SELECT COUNT(*) as c FROM signals WHERE country_iso2 = 'AR'")
print(f"AR COUNT: {cursor.fetchone()[0]}")
cursor = conn.execute("SELECT DISTINCT country_iso2 FROM signals")
print(f"ALL CODES: {[r[0] for r in cursor.fetchall()]}")
conn.close()
