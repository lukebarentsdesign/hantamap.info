import sqlite3
import os

db_path = r"c:\Users\Studio\Documents\Antigravity\Hantamap.info\backend\data\db.sqlite"
if not os.path.exists(db_path):
    print("DB not found")
    exit()

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Reset stale legacy states to perfectly sync with live reality
cursor.execute("UPDATE snapshots SET who_confirmed=0, who_suspected=0, who_deaths=0, who_countries='[]'")
conn.commit()

print("Successfully zeroed statistical drift vectors. Next refresh will reflect live intake.")
conn.close()
