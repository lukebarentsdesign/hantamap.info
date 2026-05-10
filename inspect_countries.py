import sqlite3
import json
conn = sqlite3.connect('backend/data/db.sqlite')
cursor = conn.execute("SELECT id, who_countries FROM snapshots ORDER BY id DESC LIMIT 1")
row = cursor.fetchone()
if row:
    print(f"ID: {row[0]}")
    print(f"COUNTRIES: {row[1]}")
conn.close()
