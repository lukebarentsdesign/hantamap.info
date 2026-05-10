import json
# RELOAD_TRIGGER_UPDATE_SNAPSHOTS_FLOOR_V1
import os
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from apscheduler.schedulers.background import BackgroundScheduler

import database
import feeds
import parser
try:
    import trafilatura
except ImportError:
    trafilatura = None

app = FastAPI(title="Hantavirus Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    database.init_db()
    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.add_job(ingest, "interval", minutes=15, id="ingest")
    scheduler.start()
    print("Scheduler started. Running initial ingest...")
    ingest()


def ingest():
    print(f"Ingest started {datetime.now(timezone.utc).isoformat()}")

    result       = feeds.fetch_all_feeds()
    entries      = result["entries"]
    feeds_healthy = result["feeds_healthy"]
    feeds_total   = result["feeds_total"]
    print(f"  {len(entries)} entries from {feeds_healthy}/{feeds_total} feeds")

    current           = database.get_latest_snapshot() or {}
    previous_confirmed = current.get("who_confirmed", 0)

    who_data = parser.parse_case_counts(entries, current)
    print(f"  {who_data['who_confirmed']} confirmed / "
          f"{who_data['who_deaths']} deaths / "
          f"{len(who_data['who_countries'])} countries")

    active_countries  = len(set(
        e["country_iso2"] for e in entries if e["country_iso2"]
    ))
    active_languages  = len(set(
        e["language"] for e in entries if e["language"]
    ))

    summary = parser.build_summary(who_data, {
        "total_signals":   len(entries),
        "active_countries": active_countries,
        "active_languages": active_languages,
    })

    snapshot_id = database.insert_snapshot({
        "created_at":       datetime.now(timezone.utc).isoformat(),
        "who_confirmed":    who_data["who_confirmed"],
        "who_suspected":    who_data["who_suspected"],
        "who_deaths":       who_data["who_deaths"],
        "who_countries":    who_data["who_countries"],
        "situation_summary": summary,
        "total_signals":    len(entries),
        "active_countries": active_countries,
        "active_languages": active_languages,
        "feeds_healthy":    feeds_healthy,
        "feeds_total":      feeds_total,
    })

    inserted = database.insert_signals(entries, snapshot_id)
    print(f"  {inserted} new signals inserted")

    print("Ingest complete.")


@app.get("/api/v1/snapshot")
def get_snapshot():
    snap = database.get_latest_snapshot()
    if not snap:
        raise HTTPException(status_code=503, detail="No data yet.")
    snap["who_countries"] = json.loads(snap.get("who_countries", "[]"))
    
    # Override standard stats with active manual overrides from cases table
    try:
        stats = database.get_case_stats()
        snap["who_confirmed"] = stats["confirmed"]
        snap["who_suspected"] = stats["suspected"]
        snap["tracker_stats"] = stats
    except Exception as e:
        print(f"Warning: failed to fetch case override stats: {e}")

    return {"snapshot": snap, "signals": database.get_recent_signals(500)}


@app.get("/api/v1/delta")
def get_delta():
    latest   = database.get_latest_snapshot()
    previous = database.get_previous_snapshot()

    if not latest:
        return {"has_changed": False, "new_cases": 0,
                "new_countries": [], "hours_since_change": 0,
                "who_confirmed": 0, "who_deaths": 0, "generated_at": ""}

    l_confirmed = latest.get("who_confirmed", 0)
    p_confirmed = previous.get("who_confirmed", 0) if previous else 0
    l_countries = json.loads(latest.get("who_countries", "[]"))
    p_countries = json.loads(previous.get("who_countries", "[]")) if previous else []
    new_countries = [c for c in l_countries if c not in p_countries]
    has_changed   = (l_confirmed != p_confirmed or bool(new_countries))

    hours = 0.0
    if previous and has_changed:
        try:
            t1 = datetime.fromisoformat(latest["created_at"])
            t2 = datetime.fromisoformat(previous["created_at"])
            hours = (t1 - t2).total_seconds() / 3600
        except Exception:
            pass

    return {
        "has_changed":        has_changed,
        "new_cases":          max(0, l_confirmed - p_confirmed),
        "new_countries":      new_countries,
        "hours_since_change": round(hours, 1),
        "who_confirmed":      l_confirmed,
        "who_deaths":         latest.get("who_deaths", 0),
        "generated_at":       latest.get("created_at", ""),
    }



@app.get("/health")
def health():
    from database import get_db
    with get_db() as conn:
        signals = conn.execute(
            "SELECT COUNT(*) as c FROM signals"
        ).fetchone()["c"]
    return {
        "status": "ok",
        "time":   datetime.now(timezone.utc).isoformat(),
        "signals_in_db":      signals,
        "mailing_list_enabled": False,
    }


class CaseModel(BaseModel):
    id: str
    label: str
    status: str = "SUSPECTED"
    generation: str = "G0"
    parent_id: str = None
    notes: str = ""


@app.get("/api/v1/cases")
def get_cases():
    return database.get_cases()


@app.get("/api/v1/read-article")
def read_article(url: str):
    """Fetches a target URL and returns the stripped markdown/plaintext content for client rendering."""
    try:
        try:
            import trafilatura
        except ImportError:
            trafilatura = None
        if trafilatura is None:
            raise Exception("Trafilatura library not installed on host.")
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
             raise HTTPException(status_code=404, detail="Failed to fetch content")
        
        content = trafilatura.extract(downloaded, include_comments=False, include_tables=True, no_fallback=False)
        
        if not content:
            return {"content": "Metadata extraction yielded no body text. The target domain may rely entirely on client-side javascript renderers."}
            
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failure: {str(e)}")
