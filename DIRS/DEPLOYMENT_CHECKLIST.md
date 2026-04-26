# Vercel Deployment Checklist

Use this checklist before deploying to Vercel.

## Pre-Deployment

- [ ] All code committed to GitHub
- [ ] `.env` file is in `.gitignore` (secrets not exposed)
- [ ] `npm install:all` runs without errors
- [ ] `npm run dev:all` works locally
- [ ] All API endpoints tested locally at `http://localhost:4000/api/*`
- [ ] Frontend built successfully: `cd frontend && npm run build`

## GitHub Setup

- [ ] Code pushed to GitHub main branch
- [ ] Repository is public (or Vercel has access)
- [ ] All files in correct directories:
  - [ ] `/api/index.js` - Main serverless handler
  - [ ] `/backend/` - Express backend code
  - [ ] `/frontend/` - React frontend code
  - [ ] `/vercel.json` - Deployment config

## Vercel Setup

- [ ] Created Vercel account
- [ ] Imported GitHub repository
- [ ] Project created on Vercel

## Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these for **Production, Preview, and Development**:

- [ ] `MONGO_URI` = Your MongoDB connection string
  - Get from MongoDB Atlas → Connect → Choose Driver
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?...`
- [ ] `MONGO_DB_NAME` = `document_db`
- [ ] `NODE_ENV` = `production`
- [ ] `FRONTEND_URL` = Your Vercel app URL (will know after first deploy)
  - Example: `https://myapp.vercel.app`

## MongoDB Setup

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] IP whitelist includes `0.0.0.0/0` (or Vercel IPs)
- [ ] Connection string copied and added to Vercel env vars

## First Deployment

1. [ ] Environment variables added to Vercel
2. [ ] Redeploy from Vercel dashboard (Deployments → Redeploy)
3. [ ] Build completes without errors
4. [ ] Check Deployment Logs for any issues

## Testing After Deployment

- [ ] Visit your app: `https://your-app.vercel.app`
- [ ] Check health endpoint: `/api/health`
- [ ] Try a simple API call: `/api/users` (GET)
- [ ] Check Vercel Functions tab for metrics
- [ ] Monitor Vercel Logs for errors

## Troubleshooting

If deployment fails:

1. Check Vercel deployment logs for exact error
2. Verify all environment variables are set
3. Ensure MongoDB connection string is correct
4. Check `.env` variables match what backend expects:
   - `MONGO_URI` (not `MONGODB_URI`)
   - `MONGO_DB_NAME`

## Post-Deployment

- [ ] Set up custom domain (optional)
- [ ] Configure continuous deployment from GitHub
- [ ] Enable preview deployments for PRs
- [ ] Monitor function performance in Vercel dashboard
- [ ] Set up alerts for failed deployments

---

## Quick Reference: Environment Variables

These are the **EXACT variable names** your code expects:

From `backend/config/db.js`:
- `MONGO_URI` - MongoDB connection string
- `MONGO_DB_NAME` - Database name

From `api/index.js`:
- `FRONTEND_URL` - Your Vercel app URL (for CORS)
- `NODE_ENV` - Runtime environment

---

Once all items are checked, your full-stack app should be live on Vercel! 🚀
