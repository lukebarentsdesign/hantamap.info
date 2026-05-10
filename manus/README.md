# Hantavirus Outbreak Tracker

A globally comprehensive, real-time hantavirus outbreak tracker with **zero infrastructure costs**.

## Features

- **Real-time RSS feed ingestion** from WHO, ECDC, ProMED, GDELT, and 20+ Google News feeds (12 languages)
- **Interactive world map** showing confirmed case countries
- **Live signals feed** with 24 sources across 18 countries
- **Email alert signup** for WHO case confirmations
- **Regex-based case count parsing** (no AI/LLM costs)
- **SQLite database** (no database hosting costs)
- **Railway.app deployment** (free tier available)

## Tech Stack

- **Backend**: Python 3.12 + FastAPI + APScheduler
- **Frontend**: React 19 + Tailwind CSS 4
- **Database**: SQLite with WAL mode
- **Deployment**: Docker + Railway.app

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend runs on `http://localhost:8000`

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

- `GET /api/snapshot` — Latest case counts and summary
- `GET /api/delta` — Changes since last snapshot
- `GET /api/signals?limit=30` — Recent signals
- `POST /api/alerts/signup` — Email alert signup
- `GET /api/health` — Health check

## Deployment to Railway

1. **Connect GitHub repository**
   - Push code to GitHub
   - Connect to Railway.app

2. **Set environment variables**
   - `DB_PATH`: `/app/data/db.sqlite` (default)
   - `PORT`: `8080` (default)

3. **Deploy**
   - Railway auto-detects Dockerfile
   - Backend runs on Railway's free tier
   - Frontend can be deployed separately or served from backend

## Database Schema

### snapshots
- `id`: Primary key
- `created_at`: ISO timestamp
- `who_confirmed`: Confirmed case count
- `who_suspected`: Suspected case count
- `who_deaths`: Death count
- `who_countries`: JSON array of affected countries
- `situation_summary`: Plain-text summary
- `total_signals`: Number of signals in this snapshot
- `active_countries`: Number of countries with signals
- `active_languages`: Number of languages represented
- `feeds_healthy`: Number of healthy feeds
- `feeds_total`: Total number of feeds

### signals
- `id`: Primary key
- `snapshot_id`: Foreign key to snapshots
- `title`: Signal headline
- `url`: Source URL
- `source`: Feed source (WHO, ECDC, Google News, etc.)
- `language`: Language code (en, es, de, fr, etc.)
- `country_iso2`: ISO 3166-1 alpha-2 country code
- `published_at`: ISO timestamp
- `ingested_at`: ISO timestamp

### alerts
- `id`: Primary key
- `email`: Subscriber email (unique)
- `created_at`: ISO timestamp
- `confirmed`: Boolean flag for WHO confirmation

## Feed Sources (24 total)

### Official Public Health (5)
- WHO News
- WHO DON (Disease Outbreak Notifications)
- ECDC (European Centre for Disease Prevention and Control)
- ProMED (Program for Monitoring Emerging Diseases)
- GDELT (Global Database of Events, Language and Tone)

### Google News by Region (19)
- English: GB, US, AU, CA
- Spanish: ES, AR, MX
- German: DE, AT
- French: FR
- Portuguese: BR, PT
- Italian: IT
- Turkish: TR
- Polish: PL
- Dutch: NL
- Russian: RU
- Korean: KR
- Japanese: JP
- Greek: GR

## Cost Breakdown

| Component | Cost |
|-----------|------|
| Infrastructure (Railway.app) | £0/month (free tier) |
| Domain | ~£8/year |
| APIs | £0 (RSS only) |
| Database | £0 (SQLite) |
| **Total** | **£0/month** |

## Parsing Logic

Case counts are extracted from WHO, ECDC, and ProMED feeds using regex patterns:

- **Confirmed**: `(\d+)\s+(?:laboratory[- ])?confirmed\s+case`
- **Deaths**: `(\d+)\s+death`
- **Suspected**: `(\d+)\s+suspected\s+case`

Countries are matched against a known list of 19 confirmed case countries.

## Scheduled Tasks

- **Feed ingestion**: Every hour via APScheduler
- **Signal retention**: Keeps 1000 most recent signals
- **Snapshot creation**: One per ingestion cycle

## License

MIT

## Contact

For questions or issues, please open a GitHub issue.
