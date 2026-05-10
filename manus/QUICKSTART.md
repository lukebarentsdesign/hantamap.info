# Quick Start — Deploy to Your Domain

## What You Have

A **zero-cost hantavirus tracker** that:
- Pulls news from 20 free RSS feeds (WHO, Google News in 12 languages)
- Shows real-time case counts and signals
- Stores everything in SQLite (no database costs)
- Runs on Railway.app free tier (no hosting costs)
- **Total cost: £0/month + ~£8/year for domain**

## Step 1: Push Code to GitHub

1. Go to [github.com](https://github.com) and create a new repository
2. Name it `hantavirus-tracker`
3. In your terminal:

```bash
cd /home/ubuntu/hantavirus-tracker
git remote add origin https://github.com/YOUR_USERNAME/hantavirus-tracker.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up (free)
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your `hantavirus-tracker` repository
4. Railway will automatically detect the `Dockerfile` and deploy

**Backend will be live at:** `https://hantavirus-tracker-backend.railway.app` (example)

## Step 3: Deploy Frontend

1. In Railway, click **"New Service"** in the same project
2. Select your repository again
3. Set environment variable:
   - `VITE_API_URL`: `https://hantavirus-tracker-backend.railway.app`

**Frontend will be live at:** `https://hantavirus-tracker-frontend.railway.app` (example)

## Step 4: Connect Your Domain

1. In Railway dashboard, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `hantavirus-tracker.com`)
4. Railway gives you a CNAME record
5. Go to your domain registrar and add the CNAME record
6. Wait 5-10 minutes for DNS to propagate

**Your site is now live at:** `https://hantavirus-tracker.com`

## That's It!

Your tracker is now:
- ✅ Pulling news from 20 RSS feeds every hour
- ✅ Showing case counts and signals
- ✅ Accepting email signups
- ✅ Running 24/7 for free

## Troubleshooting

**Backend not starting?**
- Check Railway logs (click "Deployments")
- Verify Python dependencies in `backend/requirements.txt`

**Frontend can't reach backend?**
- Make sure `VITE_API_URL` environment variable is set correctly
- Test backend at `https://your-backend.railway.app/api/health`

**Feeds not updating?**
- Check backend logs
- Some feeds may be temporarily down (normal)
- System retries every hour

## Next Steps (Optional)

- Add email notifications when new cases are confirmed
- Customize the map colors and styling
- Add more RSS feeds from your region
- Set up monitoring alerts

For detailed deployment info, see `DEPLOYMENT.md`.
