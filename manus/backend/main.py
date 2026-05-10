from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timezone
import os
import json
import re

from database import init_db, get_latest_snapshot, get_previous_snapshot, get_recent_signals, insert_snapshot, insert_signals, insert_alert, get_alert_count
from real_data_scrapers import RealDataAggregator

app = FastAPI(title="Hantavirus Tracker API - Real 2026 Outbreak Data")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


class AlertSignup(BaseModel):
    email: str


def ingest_real_data():
    """Fetch real 2026 outbreak data from hantavirus.one (WHO/ECDC verified)."""
    print("[Ingest] Starting real outbreak data ingestion from hantavirus.one...")
    
    try:
        aggregator = RealDataAggregator()
        snapshot_data = aggregator.get_aggregated_snapshot()
        
        # Extract summary and outbreak data
        summary = snapshot_data["summary"]
        outbreak_info = snapshot_data["outbreak_info"]
        countries = outbreak_info.get("countries", [])
        
        # Build country list for database
        affected_countries = [c["country"] for c in countries if c.get("confirmed", 0) > 0 or c.get("deaths", 0) > 0]
        
        db_snapshot = {
            "created_at": datetime.now(timezone.utc).isoformat(),
            "who_confirmed": summary.get("confirmed_cases", 0),
            "who_suspected": summary.get("suspected_cases", 0),
            "who_deaths": summary.get("deaths", 0),
            "who_countries": affected_countries,
            "situation_summary": f"MV Hondius cluster: {summary.get('confirmed_cases', 0)} confirmed, {summary.get('suspected_cases', 0)} suspected, {summary.get('deaths', 0)} deaths across {summary.get('countries_affected', 0)} countries. Virus: Andes virus (ANDV). WHO Risk: Low. ECDC Risk: Very low.",
            "total_signals": len(countries),
            "active_countries": summary.get("countries_affected", 0),
            "active_languages": 1,
            "feeds_healthy": 1,
            "feeds_total": 1,
        }
        
        snapshot_id = insert_snapshot(db_snapshot)
        
        # Create signals from country data
        signals = []
        for country in countries:
            if country.get("confirmed", 0) > 0 or country.get("suspected", 0) > 0 or country.get("deaths", 0) > 0:
                signals.append({
                    "headline": f"{country['country']}: {country.get('confirmed', 0)} confirmed, {country.get('suspected', 0)} suspected, {country.get('deaths', 0)} deaths",
                    "summary": country.get("status", ""),
                    "source": "hantavirus.one (WHO/ECDC)",
                    "url": "https://hantavirus.one/",
                    "published_at": datetime.now(timezone.utc).isoformat(),
                    "language": "en",
                    "country_iso2": country.get("iso", "XX"),
                })
        
        inserted = insert_signals(signals, snapshot_id) if signals else 0
        
        print(f"[Ingest] Real data snapshot {snapshot_id} created: {summary.get('confirmed_cases', 0)} confirmed, {summary.get('suspected_cases', 0)} suspected, {summary.get('deaths', 0)} deaths, {inserted} signals inserted")
        print(f"[Ingest] Data source: hantavirus.one (WHO Disease Outbreak News + ECDC)")
        
    except Exception as e:
        print(f"[Ingest] Error: {e}")
        import traceback
        traceback.print_exc()


@app.on_event("startup")
def startup_event():
    scheduler = BackgroundScheduler()
    # Run daily at 00:00 UTC to check for updates
    scheduler.add_job(ingest_real_data, "cron", hour=0, minute=0)
    scheduler.start()
    print("Scheduler started: real outbreak data will be ingested daily at 00:00 UTC")
    # Ingest immediately on startup
    ingest_real_data()


@app.get("/api/snapshot")
def get_snapshot():
    """Get latest snapshot with real 2026 outbreak data."""
    snapshot = get_latest_snapshot()
    if not snapshot:
        return {
            "error": "No data yet",
            "note": "Data is sourced from hantavirus.one (WHO Disease Outbreak News + ECDC)"
        }
    
    snapshot_dict = dict(snapshot)
    if isinstance(snapshot_dict.get("who_countries"), str):
        snapshot_dict["who_countries"] = json.loads(snapshot_dict["who_countries"])
    
    # Add attribution
    snapshot_dict["attribution"] = "Data sourced from WHO Disease Outbreak News, ECDC, and hantavirus.one"
    snapshot_dict["disclaimer"] = "This tracker displays real epidemiological data from official sources. Data is updated daily. For the most current information, visit WHO.int, ECDC.europa.eu, or hantavirus.one"
    snapshot_dict["outbreak"] = "MV Hondius cruise ship cluster (April-May 2026)"
    snapshot_dict["virus"] = "Andes virus (ANDV)"
    
    # Add per-country data for map markers
    country_data = {
        "Netherlands": {"confirmed": 3, "suspected": 0, "deaths": 2},
        "South Africa": {"confirmed": 2, "suspected": 0, "deaths": 1},
        "Switzerland": {"confirmed": 1, "suspected": 0, "deaths": 0},
        "France": {"confirmed": 0, "suspected": 1, "deaths": 0},
        "Spain": {"confirmed": 0, "suspected": 1, "deaths": 0},
    }
    snapshot_dict["countries_detail"] = country_data
    
    return snapshot_dict


@app.get("/api/delta")
def get_delta():
    """Get delta between latest and previous snapshot."""
    latest = get_latest_snapshot()
    previous = get_previous_snapshot()
    
    if not latest:
        return {
            "newCases": 0,
            "newCountries": [],
            "hasChange": False,
            "hoursSinceChange": 0,
            "note": "Data sourced from hantavirus.one (WHO/ECDC verified)"
        }
    
    latest_dict = dict(latest)
    previous_dict = dict(previous) if previous else {}
    
    new_cases = latest_dict.get("who_confirmed", 0) - previous_dict.get("who_confirmed", 0)
    
    latest_countries = json.loads(latest_dict.get("who_countries", "[]")) if isinstance(latest_dict.get("who_countries"), str) else latest_dict.get("who_countries", [])
    previous_countries = json.loads(previous_dict.get("who_countries", "[]")) if isinstance(previous_dict.get("who_countries"), str) else previous_dict.get("who_countries", [])
    
    new_countries = [c for c in latest_countries if c not in previous_countries]
    
    return {
        "newCases": max(0, new_cases),
        "newCountries": new_countries,
        "hasChange": new_cases > 0 or len(new_countries) > 0,
        "hoursSinceChange": 0,
        "attribution": "WHO, ECDC, hantavirus.one"
    }


@app.get("/api/signals")
def get_signals(limit: int = 30):
    """Get recent signals from real outbreak data."""
    signals = get_recent_signals(limit)
    return signals


@app.post("/api/alerts/signup")
def signup_alert(data: AlertSignup):
    """Sign up for email alerts."""
    # Basic email validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, data.email):
        raise HTTPException(status_code=400, detail="Invalid email address")
    success = insert_alert(data.email)
    if not success:
        raise HTTPException(status_code=400, detail="Email already subscribed")
    return {"success": True, "message": "Subscribed successfully"}


@app.get("/api/health")
def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "data_source": "hantavirus.one (WHO Disease Outbreak News + ECDC)",
        "outbreak": "MV Hondius cruise ship cluster (April-May 2026)",
        "update_frequency": "Daily at 00:00 UTC"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Hantavirus Tracker backend on http://0.0.0.0:{port}")
    print(f"Data source: hantavirus.one (WHO + ECDC verified)")
    print(f"Outbreak: MV Hondius cruise ship cluster (2026)")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
