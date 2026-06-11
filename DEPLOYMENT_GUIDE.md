# 🚀 Complete Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Option 1: Deploy to Firebase Hosting (Recommended)](#option-1-firebase-hosting)
3. [Option 2: Deploy to Vercel](#option-2-vercel)
4. [Option 3: Deploy to Netlify](#option-3-netlify)
5. [Backend Deployment](#backend-deployment)
6. [Post-Deployment Steps](#post-deployment-steps)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### ✅ Before You Deploy:

- [ ] All features tested locally
- [ ] Backend running and generating questions
- [ ] Students can see published subjects
- [ ] Quizzes working
- [ ] Lessons displaying correctly
- [ ] Firebase rules published
- [ ] Environment variables configured
- [ ] No console errors in browser

---

## Option 1: Firebase Hosting (Recommended) 🔥

**Why Firebase?**
- ✅ Free tier generous
- ✅ Already using Firebase for database
- ✅ Easy deployment
- ✅ Automatic HTTPS
- ✅ Global CDN

### Step 1: Install Firebase CLI

```powershell
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```powershell
firebase login
```

This opens your browser - login with your Google account.

### Step 3: Initialize Firebase Hosting

```powershell
firebase init hosting
```

**Answer the prompts:**
- **Select project**: Choose `gamified-learning-d1b24`
- **Public directory**: `dist`
- **Single-page app**: `Yes`
- **GitHub deploys**: `No` (for now)
- **Overwrite index.html**: `No`

### Step 4: Build Frontend

```powershell
npm run build
```

This creates the `dist` folder with your production files.

### Step 5: Deploy!

```powershell
firebase deploy --only hosting
```

**You'll get a URL like:**
```
https://gamified-learning-d1b24.web.app
```

### Step 6: Update Firebase Config

Update `.firebaserc` to ensure correct project:

```json
{
  "projects": {
    "default": "gamified-learning-d1b24"
  }
}
```

---

## Backend Deployment

### Option A: Deploy Backend to Render.com (Recommended - FREE)

**Why Render?**
- ✅ Free tier
- ✅ Automatic HTTPS
- ✅ Easy Node.js deployment
- ✅ Environment variables support

#### Step 1: Create `render.yaml`

Create file: `render.yaml` in project root:

```yaml
services:
  - type: web
    name: skill-park-backend
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && node index.js
    envVars:
      - key: PORT
        value: 3000
      - key: NODE_ENV
        value: production
      - key: GROQ_API_KEY
        sync: false
      - key: ALLOWED_ORIGINS
        value: https://gamified-learning-d1b24.web.app,https://gamified-learning-d1b24.firebaseapp.com
```

#### Step 2: Push to GitHub

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gamified-learning.git
git push -u origin main
```

#### Step 3: Deploy on Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Render auto-detects `render.yaml`
6. Add environment variables:
   - `GROQ_API_KEY`: Your Groq API key
7. Click **"Create Web Service"**

**You'll get a URL like:**
```
https://skill-park-backend.onrender.com
```

#### Step 4: Update Frontend API URL

Update `.env` in frontend:

```env
VITE_API_URL=https://skill-park-backend.onrender.com
```

Rebuild and redeploy:

```powershell
npm run build
firebase deploy --only hosting
```

---

### Option B: Deploy Backend to Railway.app

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. **"New Project"** → **"Deploy from GitHub"**
4. Select repository
5. Add environment variables
6. Deploy!

---

### Option C: Deploy Backend to Vercel

**Requires converting to serverless functions**

Create `api` folder with:

```javascript
// api/questions/generate.js
export default async function handler(req, res) {
  // Your question generation logic here
}
```

Then deploy:

```powershell
npx vercel
```

---

## Option 2: Vercel Deployment

### Frontend Only:

#### Step 1: Install Vercel CLI

```powershell
npm i -g vercel
```

#### Step 2: Deploy

```powershell
vercel
```

Follow prompts and you'll get a URL.

---

## Option 3: Netlify Deployment

### Step 1: Install Netlify CLI

```powershell
npm install -g netlify-cli
```

### Step 2: Build

```powershell
npm run build
```

### Step 3: Deploy

```powershell
netlify deploy --prod --dir=dist
```

---

## Post-Deployment Steps

### 1. Update Firebase Authorized Domains

1. Go to Firebase Console
2. **Authentication** → **Settings** → **Authorized domains**
3. Add your deployment URL:
   - `gamified-learning-d1b24.web.app`
   - `your-backend.onrender.com`

### 2. Update Firestore Security Rules for Production

Replace development rules with production rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isTeacher() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    function isStudent() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student';
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isOwner(userId);
      allow delete: if false;
    }
    
    // Subjects collection
    match /subjects/{subjectId} {
      allow read: if isSignedIn();
      allow write: if isTeacher();
    }
    
    // Topics collection
    match /topics/{topicId} {
      allow read: if isSignedIn();
      allow write: if isTeacher();
    }
    
    // Questions collection
    match /questions/{questionId} {
      allow read: if isSignedIn();
      allow write: if isTeacher();
    }
    
    // Quiz attempts
    match /quizAttempts/{attemptId} {
      allow read: if isOwner(resource.data.userId) || isTeacher();
      allow create: if isStudent();
      allow update: if isOwner(resource.data.userId);
      allow delete: if false;
    }
    
    // Progress tracking
    match /progress/{userId} {
      allow read: if isOwner(userId) || isTeacher();
      allow write: if isOwner(userId) || isTeacher();
    }
    
    // Leaderboard
    match /leaderboard/{entry} {
      allow read: if isSignedIn();
      allow write: if isTeacher();
    }
  }
}
```

### 3. Update CORS Settings

In `server/index.js`, update CORS:

```javascript
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://gamified-learning-d1b24.web.app",
    "https://gamified-learning-d1b24.firebaseapp.com"
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
```

### 4. Test Everything

- [ ] Can login as teacher
- [ ] Can create subjects
- [ ] Can generate questions
- [ ] Can publish questions
- [ ] Student can see subjects
- [ ] Student can read lessons
- [ ] Student can take quizzes
- [ ] Leaderboard works
- [ ] Progress tracking works

---

## Environment Variables

### Frontend (`.env`):

```env
VITE_FIREBASE_API_KEY=AIzaSyA4loXVnuUrWXHPRkTM4Ya7nYSAoVYuuMY
VITE_FIREBASE_AUTH_DOMAIN=gamified-learning-d1b24.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gamified-learning-d1b24
VITE_FIREBASE_STORAGE_BUCKET=gamified-learning-d1b24.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=904623562056
VITE_FIREBASE_APP_ID=1:904623562056:web:537d7280e3351f2ecc677d
VITE_FIREBASE_MEASUREMENT_ID=G-61JN9GME92
VITE_API_URL=https://your-backend.onrender.com
```

### Backend (`server/.env`):

```env
PORT=3000
NODE_ENV=production
GROQ_API_KEY=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
GROQ_MODEL=llama-3.3-70b-versatile
ALLOWED_ORIGINS=https://gamified-learning-d1b24.web.app,https://gamified-learning-d1b24.firebaseapp.com
```

---

## Troubleshooting

### Issue: "Failed to load subjects" after deployment

**Solution:**
1. Check Firestore rules are published
2. Verify Firebase config in `.env`
3. Check browser console for errors
4. Verify authorized domains in Firebase

### Issue: Backend not accessible

**Solution:**
1. Check backend logs on Render/Railway
2. Verify environment variables
3. Check CORS settings
4. Test backend URL directly: `https://your-backend.onrender.com/health`

### Issue: Questions not generating

**Solution:**
1. Check Groq API key is set in backend environment
2. Verify backend is running
3. Check backend logs for errors
4. Test API endpoint directly

---

## Quick Deployment Commands

### Deploy Everything:

```powershell
# Build frontend
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Backend deploys automatically on git push (if using Render/Railway)
```

### Update Only Frontend:

```powershell
npm run build
firebase deploy --only hosting
```

### Update Only Backend:

```powershell
git add .
git commit -m "Update backend"
git push
# Render/Railway auto-deploys
```

---

## Custom Domain (Optional)

### Add Custom Domain to Firebase:

1. Firebase Console → **Hosting**
2. **Add custom domain**
3. Follow DNS configuration steps
4. Wait for SSL certificate (up to 24 hours)

---

## Monitoring

### Firebase Analytics:

Already configured! Check:
- Firebase Console → **Analytics**

### Error Monitoring:

Add Sentry (optional):

```powershell
npm install @sentry/react
```

---

## Cost Estimates

### Firebase (Free Tier):
- ✅ 10GB hosting storage
- ✅ 360MB/day bandwidth
- ✅ Plenty for small-medium school

### Render Free Tier:
- ✅ 750 hours/month
- ✅ Automatic sleep after 15 min inactivity
- ✅ Wakes on request (slight delay)

### Total Cost: **$0/month** for moderate usage!

---

##Ready to Deploy?

Run:
```powershell
npm run build
firebase deploy --only hosting
```

Then set up backend on Render.com!

🎉 **Your app will be live!**
