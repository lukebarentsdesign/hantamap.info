# Hantavirus Tracker

A real-time situational dashboard for the MV Hondius hantavirus outbreak, combining official public-health reporting, translated virus-specific media signals, case-layer mapping, and repatriation tracking.

## Tech Stack

- **Frontend**: React (Vite), Leaflet maps, vanilla CSS
- **Backend**: FastAPI, SQLite, APScheduler, feed parsing, optional article extraction
- **Infrastructure**: Docker/Nginx ready for production

## Local Development

### Prerequisites
- Node.js (v18+)
- Python 3.10+

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Runs by default on `http://localhost:8000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Runs by default on `http://localhost:5173`.

## Deployment Configuration

Deploy both services together using Docker Compose or standalone on platforms like Railway or Vercel/Render.

### Environment Variables

#### Backend Service
| Variable | Description | Required |
|----------|-------------|----------|
| `SITE_URL` | Production URL used in generated links and metadata | No |
| `DB_PATH` | Path to sqlite database storage | Default: `./data/db.sqlite` |

#### Frontend Service
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | The full backend URL endpoint (no trailing slash) | **YES** |

### Build-Time Requirements

Before creating the production build of the frontend, you must install dependencies and trigger the prebuild process to generate the static OpenGraph share card:
```bash
cd frontend
npm install
npm run build
```
*Note: The `prebuild` script attempts to generate `public/share-card.png` when the optional `canvas` package is available. The build continues without it.*
