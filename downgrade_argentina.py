import sqlite3, json

def cleanup():
    conn = sqlite3.connect('backend/data/db.sqlite')
    conn.row_factory = sqlite3.Row
    
    # Get the latest snapshot
    row = conn.execute('SELECT id, who_countries FROM snapshots ORDER BY created_at DESC LIMIT 1').fetchone()
    if not row:
        print("No snapshot to clean.")
        conn.close()
        return
        
    current_countries = json.loads(row['who_countries'])
    print(f"Current who_countries: {current_countries}")
    
    # Filter out Argentina
    new_countries = [c for c in current_countries if c.lower() != 'argentina']
    
    if len(new_countries) != len(current_countries):
        conn.execute(
            'UPDATE snapshots SET who_countries = ? WHERE id = ?',
            (json.dumps(new_countries), row['id'])
        )
        conn.commit()
        print(f"SUCCESS: Updated snapshot {row['id']}. Removed Argentina.")
    else:
        print("Argentina not found in list.")
        
    conn.close()

if __name__ == '__main__':
    cleanup()
