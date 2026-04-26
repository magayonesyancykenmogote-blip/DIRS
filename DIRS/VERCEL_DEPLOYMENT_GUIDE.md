# Vercel Deployment Guide - Complete Setup

This guide will help you deploy your full-stack DIRS application (Frontend + Backend) to Vercel.

## Overview

Your application will be deployed as:
- **Frontend**: React + Vite (Static Files)
- **Backend**: Express.js API (Serverless Functions)
- **Database**: MongoDB Atlas
- **Platform**: Vercel

Both frontend and backend run on the same Vercel project, so your API calls using `/api/*` paths will work automatically.

---

## Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **MongoDB Atlas Account** - For database hosting
3. **Vercel Account** - Free account is fine

---

## Step 1: Prepare Your MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Get your connection string:
   - Click "Connect"
   - Choose "Drivers"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?...`)
4. Make sure your IP is whitelisted (0.0.0.0/0 for testing)

---

## Step 2: Push Your Code to GitHub

1. Initialize git in your project root if not already done:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ready for Vercel deployment"
   git remote add origin https://github.com/yourusername/your-repo.git
   git branch -M main
   git push -u origin main
   ```

2. Make sure these files are in your repo:
   - `/frontend/` - Your React app
   - `/backend/` - Your Express backend
   - `/api/index.js` - Vercel serverless handler
   - `/vercel.json` - Deployment configuration
   - `package.json` - Root package config

---

## Step 3: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select "Import Git Repository"
4. Choose your GitHub repository
5. Configure project:
   - **Framework Preset**: Leave as "Other"
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
6. Click "Deploy"

---

## Step 4: Add Environment Variables

After the initial deployment (even if it fails), add environment variables:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `MONGODB_URI` | Your MongoDB connection string | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |
| `FRONTEND_URL` | Your Vercel app URL (e.g., `https://myapp.vercel.app`) | Production |

4. For each variable, make sure to check all three environment types (Production, Preview, Development)
5. Click "Save"

---

## Step 5: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the three dots menu
4. Click **Redeploy**
5. Confirm when prompted

---

## Step 6: Test Your Deployment

Once deployment succeeds:

1. Visit your app URL: `https://your-app.vercel.app`
2. Test the health check: `https://your-app.vercel.app/api/health`
3. Try a real API call to verify everything works

---

## Project Structure

Your project structure should look like this:

```
DIRS/
├── api/
│   ├── index.js          ← Serverless handler
│   └── README.md
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── vercel.json           ← Deployment config
├── package.json          ← Root config
├── .env.example          ← Template for env vars
└── .gitignore            ← Make sure .env is ignored
```

---

## How It Works on Vercel

1. **Build Phase**:
   - Vercel runs: `cd frontend && npm install && npm run build`
   - Creates optimized frontend files in `frontend/dist`

2. **Deployment Phase**:
   - Serves static files from `frontend/dist` 
   - Routes `/api/*` requests to `/api/index.js` (serverless function)
   - The Express app in `/api/index.js` handles all API routes

3. **Runtime**:
   - When a request comes to `/api/users`:
     - Vercel routes it to `/api/index.js`
     - Express app processes the request
     - MongoDB connection is established
     - Response is sent back

---

## Environment Variables in Production

When your app is running on Vercel:

- `process.env.MONGODB_URI` - MongoDB connection string
- `process.env.NODE_ENV` - Set to `production`
- `process.env.FRONTEND_URL` - Your Vercel app URL

These are automatically set from your Environment Variables in the Vercel dashboard.

---

## Troubleshooting

### "Cannot find module" errors

- Make sure all your backend routes are in `/backend/routes/`
- Check that imports in `/api/index.js` use correct relative paths
- Vercel doesn't use `nodemon` - it's for local dev only

### MongoDB connection fails

- Check MONGODB_URI is set correctly in Vercel dashboard
- Verify MongoDB Atlas whitelist includes 0.0.0.0/0 or Vercel's IP ranges
- Check your database cluster is running

### API returns 404

- Verify `/api/index.js` is in the root directory
- Check `vercel.json` rewrites are correct
- Check routes in Express app match your frontend requests

### Cold start delays

- Serverless functions take longer on first request (5-30 seconds)
- This is normal - subsequent requests are faster
- Database connection pooling helps

### CORS errors

- Make sure your Vercel app URL is in the `CORS` origin in `/api/index.js`
- The CORS config uses `FRONTEND_URL` environment variable

---

## Local Development

To run locally before deploying:

```bash
# Install all dependencies
npm run install:all

# Run frontend + backend concurrently
npm run dev:all

# Or separately:
npm run dev              # Frontend on http://localhost:5173
npm run dev:backend      # Backend on http://localhost:4000
```

The Vite proxy in `vite.config.ts` routes `/api` calls to `localhost:4000` during development.

---

## Next Steps After Deployment

1. **Set up Git deployments**:
   - Every push to `main` triggers automatic deployment
   - You can control this in **Settings** → **Git**

2. **Configure custom domain**:
   - In **Settings** → **Domains**
   - Add your custom domain

3. **Monitor deployments**:
   - Check **Deployments** tab for build logs
   - Check **Functions** tab to see serverless function metrics

4. **Set up previews**:
   - Every pull request gets a preview deployment
   - Great for testing before merging

---

## Key Files for Vercel Deployment

| File | Purpose |
|------|---------|
| `/api/index.js` | Main serverless handler |
| `/vercel.json` | Deployment configuration |
| `.env.example` | Template for environment variables |
| `package.json` | Build commands |
| `/frontend/vite.config.ts` | Build configuration |

---

## Contact & Support

If you encounter issues:
1. Check Vercel deployment logs: **Deployments** → **Click deployment** → **Logs**
2. Check function logs: **Functions** tab
3. Check MongoDB Atlas connection status
4. Review this guide's troubleshooting section

Good luck with your deployment! 🚀
