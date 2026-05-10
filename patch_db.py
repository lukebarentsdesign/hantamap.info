import sqlite3
import os

paths = [
    'data/db.sqlite',
    'backend/data/db.sqlite'
]

for p in paths:
    db_path = os.path.abspath(p)
    if not os.path.exists(db_path):
        print(f"SKIP: Not found: {db_path}")
        continue

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in cursor.fetchall()]
        
        print(f"\nChecking: {db_path}")
        print(f"Tables: {tables}")

        if 'snapshots' in tables:
            # Find MAX ID
            cursor.execute("SELECT id, who_deaths, who_confirmed FROM snapshots ORDER BY id DESC LIMIT 1")
            row = cursor.fetchone()
            print(f"CURRENT LATEST ROW: {row}")
            
            cursor.execute('UPDATE snapshots SET who_deaths = 3, who_confirmed = 3, who_suspected = 3 WHERE id = (SELECT MAX(id) FROM snapshots)')
            conn.commit()
            print(f"SUCCESS: Patched latest snapshot in {db_path}")
            
            # Also verify
            cursor.execute("SELECT id, who_deaths, who_confirmed FROM snapshots ORDER BY id DESC LIMIT 1")
            print(f"NEW LATEST ROW: {cursor.fetchone()}")
        conn.close()
    except Exception as e:
        print(f"ERROR PATCHING {db_path}: {e}")
