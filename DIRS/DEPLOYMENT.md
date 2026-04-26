# VERCEL DEPLOYMENT GUIDE - FULL STACK SETUP

## ✅ What's Been Done

Your project is now configured as a **unified Vercel deployment**:
- ✅ Frontend (React/Vite) → `/frontend/dist`  
- ✅ Backend API → `/api` serverless functions
- ✅ All routes connected: `/api/users`, `/api/documents`, `/api/residents`, `/api/receipts`
- ✅ vercel.json configured with rewrites
- ✅ CORS enabled on all API endpoints

---

## 🚀 DEPLOYMENT STEPS (15 MINUTES)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Full stack Vercel deployment setup"
git push origin main
```

### Step 2: Create Vercel Project
1. Go to **https://vercel.com/dashboard**
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repository (DIRS)
4. Click **"Import"**

### Step 3: Add Environment Variables ⚠️ CRITICAL
In Vercel Dashboard:
1. Click your project → **Settings** → **Environment Variables**
2. Add these variables for **Production, Preview, and Development**:

```
MONGO_URI = mongodb+srv://document_service_user:ARPi2ffAj4RZYux4@barangaycluster.seb5lfn.mongodb.net/document_db?authSource=admin&retryWrites=true&w=majority

MONGO_DB_NAME = document_db

PROFILING_MONGO_URI = (same as MONGO_URI or leave empty - optional)

SERVER_PORT = 4000

VITE_SUPABASE_URL = https://zzcptlacweagdlxtknks.supabase.co

VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Y3B0bGFjd2VhZ2RseHRrbmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTMwMzQsImV4cCI6MjA4NjkyOTAzNH0.gtKgRxpEHwABO3RnWttkHzOBmaJsB5T1o70MF8uxS8Y
```

### Step 4: Deploy
Click **"Deploy"** - Vercel will:
1. Install dependencies
2. Build frontend (`npm run build --prefix frontend`)
3. Deploy frontend + API together

---

## 🔍 HOW IT WORKS NOW

### Frontend Calls
```javascript
// Frontend makes calls like this (no URL change needed):
const response = await fetch('/api/documents?all=true');
// ✅ Automatically routes to: /api
```

### Vercel Routing
```
Your Request          →    Vercel Rewrites    →    Actual Handler
/api/documents        →    /api                →    api/index.js
/api/users            →    /api                →    api/index.js  
/anything/else        →    /index.html         →    Frontend (SPA)
```

---

## ✅ TESTING AFTER DEPLOYMENT

After deployment completes, test these URLs in your browser or with curl:

```bash
# Test Health Check
curl https://your-project.vercel.app/api/health

# Test Get Residents
curl https://your-project.vercel.app/api/residents

# Test Get Documents  
curl https://your-project.vercel.app/api/documents?all=true

# Test Get Receipts
curl https://your-project.vercel.app/api/receipts
```

Expected responses: All should return JSON ✅

### If testing in browser:
1. Go to `https://your-project.vercel.app`
2. Open DevTools (F12) → Network tab
3. Try creating a resident or document - watch Network tab
4. All `/api/*` requests should show **200 status** with JSON responses

---

## 🐛 TROUBLESHOOTING

### If you get 404 errors:
1. **Check Environment Variables**: Vercel Dashboard → Settings → Environment Variables
   - Make sure MONGO_URI is set correctly
   - Click "Redeploy" after adding/changing variables

2. **Check Logs**: Vercel Dashboard → Deployments → Click latest → Click "Functions" tab
   - Look for errors in `/api` function logs

3. **Clear Browser Cache**: Ctrl+Shift+Delete (hard refresh)

### If MongoDB connection fails:
- Verify MONGO_URI is correct
- Check if IP whitelist includes "0.0.0.0/0" in MongoDB Atlas
- Check database credentials in MONGO_URI

### If frontend can't reach API:
- Open browser DevTools → Network tab
- Check `/api/health` request
- Should show 200 status with JSON response

---

## 📝 NEXT STEPS

After successful deployment:
1. ✅ Test all CRUD operations
2. ✅ Check MongoDB Atlas logs for connections
3. ✅ Monitor Vercel dashboard for errors
4. ✅ Share your live URL: `https://your-project.vercel.app`

---

**Questions? Check the Vercel logs in the dashboard!** 🎉
