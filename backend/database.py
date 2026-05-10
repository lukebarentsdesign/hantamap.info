import sqlite3
import os
import json
from contextlib import contextmanager

DB_PATH = os.environ.get("DB_PATH", "./data/db.sqlite")


def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                who_confirmed INTEGER DEFAULT 0,
                who_suspected INTEGER DEFAULT 0,
                who_deaths INTEGER DEFAULT 0,
                who_countries TEXT DEFAULT '[]',
                situation_summary TEXT DEFAULT '',
                total_signals INTEGER DEFAULT 0,
                active_countries INTEGER DEFAULT 0,
                active_languages INTEGER DEFAULT 0,
                feeds_healthy INTEGER DEFAULT 0,
                feeds_total INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                snapshot_id INTEGER,
                title TEXT NOT NULL,
                url TEXT UNIQUE NOT NULL,
                source TEXT,
                language TEXT DEFAULT 'en',
                country_iso2 TEXT,
                published_at TEXT,
                ingested_at TEXT NOT NULL,
                tier INTEGER DEFAULT 3,
                FOREIGN KEY (snapshot_id) REFERENCES snapshots(id)
            );

            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY,
                label TEXT NOT NULL,
                status TEXT DEFAULT 'SUSPECTED',
                generation TEXT DEFAULT 'G0',
                parent_id TEXT,
                notes TEXT,
                created_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_signals_ingested
                ON signals(ingested_at DESC);
            CREATE INDEX IF NOT EXISTS idx_signals_snapshot
                ON signals(snapshot_id);
            CREATE INDEX IF NOT EXISTS idx_cases_parent
                ON cases(parent_id);
        """)
        
        # Self-healing migration for 'tier' column
        try:
            conn.execute("ALTER TABLE signals ADD COLUMN tier INTEGER DEFAULT 3")
            print("Migrated database schema: Added 'tier' column to signals.")
        except sqlite3.OperationalError:
            pass # Already exists
            
    print("Database initialised.")


def get_latest_snapshot():
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM snapshots ORDER BY id DESC LIMIT 1"
        ).fetchone()
        return dict(row) if row else None


def get_previous_snapshot():
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM snapshots ORDER BY id DESC LIMIT 1 OFFSET 1"
        ).fetchone()
        return dict(row) if row else None


def get_recent_signals(limit=30):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM signals ORDER BY ingested_at DESC LIMIT ?",
            (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


def insert_snapshot(data: dict) -> int:
    with get_db() as conn:
        cursor = conn.execute(
            """INSERT INTO snapshots
               (created_at, who_confirmed, who_suspected, who_deaths,
                who_countries, situation_summary, total_signals,
                active_countries, active_languages, feeds_healthy, feeds_total)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (
                data["created_at"],
                data["who_confirmed"],
                data["who_suspected"],
                data["who_deaths"],
                json.dumps(data["who_countries"]),
                data["situation_summary"],
                data["total_signals"],
                data["active_countries"],
                data["active_languages"],
                data["feeds_healthy"],
                data["feeds_total"],
            )
        )
        return cursor.lastrowid


def insert_signals(signals: list, snapshot_id: int):
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    inserted = 0
    with get_db() as conn:
        for s in signals:
            try:
                conn.execute(
                    """INSERT OR IGNORE INTO signals
                       (snapshot_id, title, url, source, language,
                        country_iso2, published_at, ingested_at, tier)
                       VALUES (?,?,?,?,?,?,?,?,?)""",
                    (
                        snapshot_id,
                        s.get("title", ""),
                        s.get("url", ""),
                        s.get("source", ""),
                        s.get("language", "en"),
                        s.get("country_iso2", ""),
                        s.get("published_at", ""),
                        now,
                        s.get("tier", 3),
                    )
                )
                if conn.execute("SELECT changes()").fetchone()[0]:
                    inserted += 1
            except Exception as e:
                print(f"Signal insert error: {e}")
        conn.execute("""
            DELETE FROM signals WHERE id NOT IN (
                SELECT id FROM signals ORDER BY ingested_at DESC LIMIT 1000
            )
        """)
    return inserted


def insert_alert(email: str) -> bool:
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        try:
            conn.execute(
                "INSERT INTO alerts (email, created_at) VALUES (?,?)",
                (email, now)
            )
            return True
        except sqlite3.IntegrityError:
            return False


def get_cases():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM cases ORDER BY created_at ASC").fetchall()
        return [dict(r) for r in rows]


def upsert_case(case_data: dict) -> bool:
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        conn.execute("""
            INSERT INTO cases (id, label, status, generation, parent_id, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                label=excluded.label,
                status=excluded.status,
                generation=excluded.generation,
                parent_id=excluded.parent_id,
                notes=excluded.notes
        """, (
            case_data.get("id"),
            case_data.get("label"),
            case_data.get("status", "SUSPECTED"),
            case_data.get("generation", "G0"),
            case_data.get("parent_id"),
            case_data.get("notes"),
            now
        ))
        return True


def get_case_stats():
    with get_db() as conn:
        c_confirmed = conn.execute("SELECT COUNT(*) FROM cases WHERE status = 'CONFIRMED'").fetchone()[0]
        c_suspected = conn.execute("SELECT COUNT(*) FROM cases WHERE status = 'SUSPECTED'").fetchone()[0]
        c_total = conn.execute("SELECT COUNT(*) FROM cases").fetchone()[0]
        c_g0 = conn.execute("SELECT COUNT(*) FROM cases WHERE generation = 'G0'").fetchone()[0]
        c_g1 = conn.execute("SELECT COUNT(*) FROM cases WHERE generation = 'G1'").fetchone()[0]
        c_g2 = conn.execute("SELECT COUNT(*) FROM cases WHERE generation NOT IN ('G0', 'G1')").fetchone()[0]
        
        return {
            "confirmed": c_confirmed,
            "suspected": c_suspected,
            "tracked": c_total,
            "g0": c_g0,
            "g1": c_g1,
            "g2plus": c_g2
        }
