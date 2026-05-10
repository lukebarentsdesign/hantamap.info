import os
import json
import sqlite3
import csv
import urllib.request
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), 'backend', 'data', 'db.sqlite')

def fetch_and_update():
    # 1. Fetch CSV
    print("Fetching CSV...")
    req = urllib.request.Request("https://hantavirus.one/data/countries.csv", headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
        
    reader = csv.DictReader(content.splitlines())
    
    total_confirmed = 0
    total_suspected = 0
    total_deaths = 0
    countries = []
    
    for row in reader:
        c = int(row.get('confirmed', 0))
        s = int(row.get('suspected', 0))
        d = int(row.get('deaths', 0))
        iso = row.get('iso', '')
        country = row.get('country', '')
        
        if c > 0 or s > 0 or d > 0:
            total_confirmed += c
            total_suspected += s
            total_deaths += d
            if country not in countries:
                countries.append(country)
                
    print(f"Parsed: {total_confirmed} confirmed, {total_suspected} suspected, {total_deaths} deaths in {len(countries)} countries.")

    # 2. Update the DB
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, who_confirmed, who_suspected, who_deaths, who_countries, situation_summary FROM snapshots ORDER BY id DESC LIMIT 1")
    row = c.fetchone()
    
    if row:
        snapshot_id = row[0]
        # Update it
        c.execute("""
            UPDATE snapshots 
            SET who_confirmed = ?, who_suspected = ?, who_deaths = ?, who_countries = ?
            WHERE id = ?
        """, (total_confirmed, total_suspected, total_deaths, json.dumps(countries), snapshot_id))
        conn.commit()
        print(f"Updated snapshot {snapshot_id} successfully!")
    else:
        print("No snapshots found to update!")
        
    conn.close()

if __name__ == '__main__':
    fetch_and_update()
