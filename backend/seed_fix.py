import sqlite3
import os
from datetime import datetime, timezone

DB_PATH = "./data/db.sqlite"
def seed_properly():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    
    # Clear previous garbage
    cursor.execute("DELETE FROM cases")
    
    cases = [
        ('P-INDEX', 'Patient Zero (MH-01)', 'CONFIRMED', 'G0', None, 'Initial cluster detected MV Hondius.', now),
        ('P-C1', 'Cabin Staff A', 'CONFIRMED', 'G1', 'P-INDEX', 'Direct occupational exposure.', now),
        ('P-C2', 'Deck 4 Passenger B', 'SUSPECTED', 'G1', 'P-INDEX', 'Common source dining exposure.', now),
        ('P-C3', 'Medical Officer X', 'CONFIRMED', 'G1', 'P-INDEX', 'Initial containment breach.', now),
        ('P-G2-A1', 'Local Contact C', 'SUSPECTED', 'G2', 'P-C1', 'Debarkation transport vector.', now),
        ('P-G2-B1', 'Family Contact D', 'SUSPECTED', 'G2', 'P-C2', 'Secondary household linkage.', now),
    ]
    
    cursor.executemany(
        "INSERT INTO cases (id, label, status, generation, parent_id, notes, created_at) VALUES (?,?,?,?,?,?,?)",
        cases
    )
    conn.commit()
    print(f"SUCCESS: Inserted {len(cases)} graph nodes into {os.path.abspath(DB_PATH)}")
    conn.close()

if __name__ == '__main__':
    seed_properly()
