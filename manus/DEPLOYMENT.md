# Deployment Guide — Railway.app

## Prerequisites

- GitHub account with repository pushed
- Railway.app account (free tier available)
- Your domain ready

## Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects `railway.json` and builds from `backend/Dockerfile`
5. Set environment variables:
   - `DB_PATH`: `/app/data/db.sqlite`
   - `PORT`: `8080` (Railway will set this automatically)

Backend will be live at: `https://<project>.railway.app`

## Step 2: Deploy Frontend to Railway

1. In same Railway project, click "New Service"
2. Select "GitHub" and choose your repository again
3. Create `frontend/Dockerfile.prod` for production build:

```dockerfile
FROM node:22-alpine as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile || npm install
COPY . .
RUN pnpm build || npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

4. Set environment variables:
   - `VITE_API_URL`: `https://<backend-project>.railway.app`

Frontend will be live at: `https://<frontend-project>.railway.app`

## Step 3: Connect Your Domain

1. In Railway dashboard, go to project settings
2. Click "Domains"
3. Add your custom domain (e.g., `hantavirus-tracker.com`)
4. Update DNS records at your registrar:
   - Point to Railway's nameservers or CNAME

## Step 4: Enable Persistent Storage (Optional)

Railway provides ephemeral storage by default. For persistent SQLite:

1. In Railway project, add "PostgreSQL" plugin
2. Update backend to use PostgreSQL instead of SQLite (optional enhancement)

For now, SQLite works fine with Railway's persistent volumes.

## Local Testing

```bash
docker-compose up
```

Visit `http://localhost:3000` — backend on `http://localhost:8000`

## Monitoring

- Railway dashboard shows logs in real-time
- Backend logs appear in "Deployments" tab
- Check `/api/health` endpoint for status

## Cost

- Railway free tier: 500 hours/month (plenty for this app)
- Domain: ~£8/year
- **Total: £0/month infrastructure**

## Troubleshooting

**Backend not starting:**
- Check logs in Railway dashboard
- Verify `PORT` environment variable is set
- Ensure `backend/Dockerfile` exists

**Frontend can't reach backend:**
- Verify `VITE_API_URL` is set correctly
- Check CORS headers in backend
- Test `/api/health` endpoint directly

**Database errors:**
- Check `/app/data` directory exists
- Verify SQLite permissions
- Railway mounts `/app/data` automatically

## Next Steps

1. Push code to GitHub
2. Connect repository to Railway
3. Set environment variables
4. Deploy backend first
5. Deploy frontend with backend URL
6. Connect custom domain
7. Monitor logs and test endpoints
