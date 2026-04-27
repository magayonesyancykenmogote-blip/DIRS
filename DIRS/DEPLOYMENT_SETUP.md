# Deployment Setup Guide

This project is configured for:
- **Frontend**: Vercel
- **Backend**: Railway

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (free at vercel.com)
- GitHub account with this repo pushed

### Steps

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as root directory
   - Add environment variable:
     - `VITE_API_URL` = `https://your-railway-backend-url/api` (set this after backend is deployed)
   - Click "Deploy"

### Environment Variables for Frontend
- `VITE_API_URL`: The backend API URL from Railway (e.g., `https://yourapp-prod.up.railway.app/api`)

---

## Backend Deployment (Railway)

### Prerequisites
- Railway account (free at railway.app)
- GitHub account with this repo pushed

### Steps

1. **Push your code to GitHub** (if not done already)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Railway**
   - Visit [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose this repository
   - Railway will automatically detect the Node.js backend

3. **Configure Root Directory (Important)**
   - In Railway project settings, set:
     - **Root Directory**: `backend` (or RAILWAY_ROOT_DIR env var)

4. **Add Environment Variables in Railway**
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
   - `SERVER_PORT`: Railway will assign a port automatically

5. **Add CORS Configuration**
   - After frontend is deployed on Vercel, update backend CORS to allow your Vercel URL:
   ```javascript
   app.use(cors({
     origin: 'https://your-vercel-frontend.vercel.app',
     credentials: true,
   }));
   ```

### Environment Variables for Backend
- `MONGODB_URI`: MongoDB connection string (required)
- `NODE_ENV`: Set to `production`
- `SERVER_PORT`: Optional (Railway manages port)

---

## After Deployment

1. **Update Frontend API URL**
   - Once backend is deployed on Railway, note the URL
   - Update Vercel project settings → Environment Variables
   - Set `VITE_API_URL` to your Railway backend URL
   - Redeploy frontend

2. **Update Backend CORS**
   - Update `backend/server.js` to allow your Vercel frontend URL
   - Commit and push to trigger Railway redeploy

3. **Test the Connection**
   ```bash
   curl https://your-railway-backend.up.railway.app/api/health
   ```

---

## Troubleshooting

**Frontend can't connect to backend:**
- Check that `VITE_API_URL` is set correctly in Vercel
- Verify backend CORS allows your frontend URL
- Check network tab in browser dev tools

**Backend deployment fails:**
- Ensure `backend/server.js` exists and is the entry point
- Check that `backend/package.json` has all dependencies
- Verify MongoDB URI is correct and accessible

**Cold start delays:**
- Railway free tier may have cold starts
- This is normal; requests will wake up the server

