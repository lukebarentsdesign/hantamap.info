import sqlite3, shutil
try:
    shutil.copy('data/db.sqlite', 'data/db_temp.sqlite')
    conn = sqlite3.connect('data/db_temp.sqlite')
    conn.row_factory = sqlite3.Row
    authoritative = ('WHO', 'WHO DON', 'ECDC', 'ProMED')
    cursor = conn.execute("SELECT title, source, url FROM signals WHERE source IN (?,?,?,?)", authoritative)
    rows = [dict(r) for r in cursor.fetchall()]
    for r in rows:
        print(f"{r['source']}: {r['title']}")
    conn.close()
except Exception as e:
    print("Error:", e)
