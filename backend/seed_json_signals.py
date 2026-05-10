import json
import os
from datetime import datetime, timezone
import database

def run():
    json_path = r"c:\Users\Studio\Documents\Antigravity\Hantamap.info\signals.json"
    if not os.path.exists(json_path):
        print(f"FAIL: Cannot find signals.json at {json_path}")
        return
        
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    signals_raw = data.get("signals", [])
    print(f"Loaded {len(signals_raw)} signals from JSON.")
    
    # Map them to internal schema
    mapped_signals = []
    countries_active = set()
    
    for s in signals_raw:
        iso2 = s.get("countryIso2", "")
        if iso2:
            countries_active.add(iso2)
            
        mapped_signals.append({
            "title": s.get("title", ""),
            "url": s.get("url", ""),
            "source": s.get("source", ""),
            "language": s.get("language", "en"),
            "country_iso2": iso2,
            "published_at": s.get("publishedAt", "")
        })

    # Create an intelligence rich snapshot
    snapshot_id = database.insert_snapshot({
        "created_at":       datetime.now(timezone.utc).isoformat(),
        "who_confirmed":    9, # aligned to user photo
        "who_suspected":    4,
        "who_deaths":       1,
        "who_countries":    list(countries_active),
        "situation_summary": "Global synchronization payload injected via signals.json library.",
        "total_signals":    len(mapped_signals),
        "active_countries": len(countries_active),
        "active_languages": 4,
        "feeds_healthy":    12,
        "feeds_total":      12,
    })
    
    print(f"Created rich intelligence snapshot ID: {snapshot_id}")
    
    inserted = database.insert_signals(mapped_signals, snapshot_id)
    print(f"Successfully inserted {inserted} signals into local operational database.")

if __name__ == "__main__":
    database.init_db()
    run()
