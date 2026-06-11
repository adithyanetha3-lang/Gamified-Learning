# 🚀 Quick Deployment Guide - Your Gamified Learning Platform

## Current Setup
- ✅ Firebase Project: `gamified-learning-d1b24`
- ✅ Firebase Hosting configured
- ✅ Backend using Groq AI (FREE)
- ✅ All code ready to deploy

---

## Option 1: Firebase Hosting (Frontend Only) - RECOMMENDED FOR TESTING

This deploys your React frontend to Firebase. Backend will still run locally.

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Build Your Frontend
```bash
npm run build
```

### Step 4: Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### Step 5: Your Site is Live! 🎉
Firebase will give you a URL like:
```
https://gamified-learning-d1b24.web.app
```

⚠️ **Important:** Backend must still run locally or be deployed separately (see Option 2)

---

## Option 2: Full Deployment (Frontend + Backend)

### A. Deploy Frontend to Firebase Hosting

Follow Option 1 steps above.

### B. Deploy Backend to Render.com (FREE)

#### Step 1: Create Render Account
- Go to: https://render.com
- Sign up with GitHub

#### Step 2: Push Code to GitHub
```bash
# If not already on GitHub
git init
git add .
git commit -m "Ready for deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### Step 3: Create Web Service on Render
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `gamified-learning-api`
   - **Environment:** `Node`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** FREE

#### Step 4: Add Environment Variables on Render
In the Environment tab, add:
```
GROQ_API_KEY=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
GROQ_MODEL=llama-3.3-70b-versatile
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://gamified-learning-d1b24.web.app
```

#### Step 5: Get Your Backend URL
Render will give you a URL like:
```
https://gamified-learning-api.onrender.com
```

#### Step 6: Update Frontend to Use Backend URL
Create `.env.production` in root:
```env
VITE_API_URL=https://gamified-learning-api.onrender.com
```

#### Step 7: Rebuild and Redeploy Frontend
```bash
npm run build
firebase deploy --only hosting
```

---

## Option 3: Alternative Backend Hosting

### Railway.app (FREE tier available)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
cd server
railway init
railway up
```

### Vercel (FREE)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy backend
cd server
vercel --prod

# Deploy frontend
cd ..
vercel --prod
```

---

## Important Configuration Checklist

### ✅ Before Deploying

1. **Firebase Rules - Set to Production Mode**
   ```javascript
   // In Firebase Console → Firestore Database → Rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Teachers can do everything
       match /{document=**} {
         allow read, write: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
       }
       
       // Students can read published content
       match /subjects/{subjectId} {
         allow read: if request.auth != null && resource.data.published == true;
       }
       match /topics/{topicId} {
         allow read: if request.auth != null && resource.data.published == true;
       }
       match /questions/{questionId} {
         allow read: if request.auth != null && resource.data.status == 'published';
       }
       
       // Users can read/write their own profile
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Users can manage their own progress
       match /progress/{progressId} {
         allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

2. **Update Backend CORS**
   After you get your Firebase Hosting URL, update `server/.env`:
   ```env
   ALLOWED_ORIGINS=https://gamified-learning-d1b24.web.app,https://gamified-learning-d1b24.firebaseapp.com
   ```

3. **Environment Variables Check**
   - ✅ Groq API key set
   - ✅ Firebase config in frontend
   - ✅ Backend URL in frontend (if deploying backend)

---

## Testing Your Deployment

### 1. Check Frontend
```
Visit: https://gamified-learning-d1b24.web.app
```
- ✅ Can you load the login page?
- ✅ Can you login as teacher/student?
- ✅ Can you see the navigation?

### 2. Check Backend (if deployed)
```
Visit: https://your-backend-url.com/health
```
Should return:
```json
{
  "status": "ok",
  "groqConfigured": true
}
```

### 3. Test Question Generation
- Login as teacher
- Go to Question Generator
- Try generating questions
- Should work in 2-5 seconds

---

## Quick Commands Reference

```bash
# Build frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Test frontend locally
npm run preview

# Run backend locally
cd server
npm start

# Check Firebase login status
firebase login:list

# View deployed site
firebase hosting:channel:open
```

---

## Cost Breakdown

### FREE Tier Limits

**Firebase Hosting (FREE):**
- ✅ 10 GB storage
- ✅ 360 MB/day bandwidth
- ✅ Custom domain supported
- ✅ SSL certificate included

**Firebase Firestore (FREE):**
- ✅ 1 GB storage
- ✅ 50K reads/day
- ✅ 20K writes/day
- ✅ 20K deletes/day

**Groq AI (FREE):**
- ✅ 30 requests/minute
- ✅ 14,400 requests/day
- ✅ Unlimited during beta

**Render.com (FREE):**
- ✅ 750 hours/month
- ✅ Sleeps after 15 min inactivity
- ✅ Wakes up on request (~30 sec)

💡 **Perfect for education/testing with up to ~100 daily active users!**

---

## Troubleshooting

### ❌ "Firebase command not found"
```bash
npm install -g firebase-tools
```

### ❌ "Build failed"
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### ❌ "Questions not generating"
- Check Groq API key is set in backend env
- Check backend is running and accessible
- Check CORS settings allow your frontend domain

### ❌ "Can't see published content as student"
- Check Firestore rules are set correctly
- Make sure content is marked as "published" (green button)
- Check browser console for errors

---

## Next Steps After Deployment

1. **Custom Domain (Optional)**
   - Go to Firebase Console → Hosting
   - Click "Add custom domain"
   - Follow instructions

2. **Monitor Usage**
   - Firebase Console → Usage tab
   - Render Dashboard → Metrics
   - Groq Console → Usage

3. **Backups**
   - Firebase Firestore auto-backs up
   - Export data periodically: Firebase Console → Firestore → Import/Export

---

## Support

**Deployment Issues?**
- Check Firebase Console logs
- Check Render logs (if using)
- Test locally first: `npm run dev` and `cd server && npm start`

**Need Help?**
- Firebase Docs: https://firebase.google.com/docs/hosting
- Render Docs: https://render.com/docs
- Groq Docs: https://console.groq.com/docs

---

🎉 **Ready to deploy? Start with Option 1 for fastest results!**
