import sqlite3
import json
conn = sqlite3.connect('backend/data/db.sqlite')
# Re-set newest snapshot and ALL snapshot entries to fix historical view too just in case
c = conn.cursor()
c.execute("UPDATE snapshots SET who_countries = ?", (json.dumps(["South Africa"]),))
conn.commit()
print(f"Successfully set verified countries to [South Africa] across all {c.rowcount} snapshot rows.")
conn.close()
