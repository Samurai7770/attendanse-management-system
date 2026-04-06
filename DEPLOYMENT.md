# QR Attendance System - Deployment Guide

## Quick Start Deployment

### Prerequisites
- MongoDB Atlas account (free tier available)
- Node.js installed locally
- GitHub account (for version control)
- Deployment platform account (Render, Railway, or Vercel)

---

## PART 1: Database Setup (Firebase)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new Firebase project
3. Enable Firestore Database
4. Go to Project Settings > Service Accounts
5. Generate a new private key (JSON file)
6. Copy the JSON content for the service account key

---

## PART 2: Backend Deployment (Render)

### Option A: Deploy on Render (Recommended for beginners)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **Go to [render.com](https://render.com) and sign in with GitHub**

3. **Create New Web Service:**
   - Connect your repo
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`

4. **Set Environment Variables in Render:**
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_DATABASE_URL=https://your-firebase-project-id.firebaseio.com
   SESSION_SECRET=your-super-secret-key-change-this
   PORT=5000
   NODE_ENV=production
   ```

5. **Update CORS in backend/server.js:**
   Replace the CORS section with:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     credentials: true
   }));
   ```

6. Copy your Render backend URL (e.g., `https://qr-attendance-backend.onrender.com`)

---

## PART 3: Frontend Deployment (Vercel)

### Option A: Deploy on Vercel (Easiest)

1. **Create `frontend/.env.production`:**
   ```
   VITE_API_URL=https://your-render-backend-url.onrender.com
   ```

2. **Go to [vercel.com](https://vercel.com) and sign in with GitHub**

3. **Import your project:**
   - Select your repository
   - Framework: Vite
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Set Environment Variables:**
   - Add `VITE_API_URL=https://your-backend-url.onrender.com`

5. **Deploy** - Vercel automatically deploys on push

---

### Option B: Deploy on Render (Both Frontend + Backend)

1. Create new Static Site in Render
2. Build command: `cd frontend && npm run build`
3. Publish directory: `frontend/dist`
4. Environment: `VITE_API_URL=your-backend-render-url`

---

## PART 4: Update API Endpoints

### In `frontend/src/App.tsx` and components:

The frontend should automatically use the API URL from environment variables. Update base API calls:

```typescript
// Create a utility file: frontend/src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiCall(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });
  return response;
}
```

---

## PART 5: Security Checklist

- [ ] Change SESSION_SECRET to strong random key
- [ ] Enable HTTPS in production (Render/Vercel handle this)
- [ ] Set secure cookies: `secure: true` when NODE_ENV=production
- [ ] Whitelist all frontend URLs in backend CORS
- [ ] Add rate limiting to API endpoints
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB authentication

---

## PART 6: Complete Deployment Commands

### Backend (.env file):
```
MONGODB_URI=mongodb+srv://user:password@cluster.net/qr-attendance
SESSION_SECRET=your-random-secret-key-here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend (.env.production):
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## PART 7: Testing After Deployment

1. **Login Test:** Create account and login
2. **QR Generation:** Teacher creates a lecture
3. **Attendance Marking:** Student scans QR code
4. **Data Persistence:** Verify data appears in MongoDB Atlas

---

## Alternative Deployment Platforms

### Backend Options:
- **Railway** - Simple, $5/month
- **DigitalOcean App Platform** - $12/month
- **AWS EC2** - Pay as you go
- **Heroku alternative** (Render, Railway)

### Frontend Options:
- **Netlify** - Free tier available
- **GitHub Pages** - Free for static sites
- **Railway/Render** - Can host both

---

## Troubleshooting

**CORS Error?**
- Add frontend URL to backend CORS whitelist
- Ensure credentials: true in frontend fetch calls

**Session not persisting?**
- Verify MongoDB connection string
- Check SESSION_SECRET is set
- Ensure cookies are enabled

**QR Camera not working on mobile?**
- Ensure HTTPS is enabled
- Check camera permissions on device
- Test on native browser (not WebView)

**Attendance not saving?**
- Verify MongoDB Atlas whitelist includes backend IP
- Check network tab for failed requests
- Verify session cookies are being sent

---

## Monitoring & Maintenance

1. **Monitor Backend Logs:**
   - Render: Dashboard → Logs
   - Check for errors and performance

2. **Monitor Database:**
   - MongoDB Atlas → Metrics
   - Check storage usage

3. **Performance:**
   - Use Vercel Analytics for frontend
   - Monitor Render CPU/Memory usage

---

## Production Checklist

- [ ] Database backup configured
- [ ] HTTPS enabled everywhere
- [ ] Rate limiting implemented
- [ ] Error logging setup
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Session secrets strong
- [ ] Database indexed for performance
- [ ] Mobile camera permissions tested
- [ ] Tested on actual mobile devices

