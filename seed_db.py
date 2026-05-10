import sys
import os
sys.path.append('backend')
from database import init_db, upsert_case

def seed():
    init_db()
    cases = [
        {'id': 'P-INDEX', 'label': 'Index Passenger (MH-01)', 'status': 'CONFIRMED', 'generation': 'G0', 'notes': 'Cape Town to South Atlantic corridor.'},
        {'id': 'P-C1', 'label': 'Cabin Attendant A', 'status': 'CONFIRMED', 'generation': 'G1', 'parent_id': 'P-INDEX', 'notes': 'Direct environmental exposure.'},
        {'id': 'P-C2', 'label': 'Deck 4 Passenger B', 'status': 'SUSPECTED', 'generation': 'G1', 'parent_id': 'P-INDEX', 'notes': 'Dining hall contact.'},
        {'id': 'P-G2-1', 'label': 'Family Contact C', 'status': 'SUSPECTED', 'generation': 'G2', 'parent_id': 'P-C1', 'notes': 'Port debarkation exposure risk.'},
    ]
    for c in cases:
        upsert_case(c)
    print("Successfully seeded 4 core transmission graph nodes.")

if __name__ == '__main__':
    seed()
