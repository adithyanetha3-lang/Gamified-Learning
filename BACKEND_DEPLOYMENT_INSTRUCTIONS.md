# 🚀 Backend Deployment Instructions

## ✅ What We've Done So Far

1. ✅ Frontend is LIVE at: **https://gamified-learning-d1b24.web.app**
2. ✅ Code is ready in Git repository
3. ✅ Configuration files created for deployment

---

## 🎯 Next Steps: Deploy Backend to Render.com (FREE)

### Option A: Deploy via GitHub (Recommended)

#### Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `gamified-learning`
3. Keep it **Private** (or Public, your choice)
4. **DO NOT** initialize with README (we already have code)
5. Click "Create repository"

#### Step 2: Push Code to GitHub

Copy and run these commands in your terminal:

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/gamified-learning.git

# Push code
git branch -M main
git push -u origin main
```

#### Step 3: Deploy on Render.com

1. **Go to Render:** https://render.com
2. **Sign Up/Login** with GitHub
3. **Click "New +" → "Web Service"**
4. **Connect your `gamified-learning` repository**
5. **Configure the service:**
   - **Name:** `gamified-learning-api`
   - **Region:** Oregon (or closest to you)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

6. **Add Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=3000
   GROQ_API_KEY=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
   GROQ_MODEL=llama-3.3-70b-versatile
   ALLOWED_ORIGINS=https://gamified-learning-d1b24.web.app,https://gamified-learning-d1b24.firebaseapp.com
   ```

7. **Click "Create Web Service"**

8. **Wait 3-5 minutes** for deployment to complete

9. **Get your backend URL** - it will look like:
   ```
   https://gamified-learning-api.onrender.com
   ```

---

### Option B: Deploy Without GitHub (Manual)

If you don't want to use GitHub:

#### Step 1: Install Render CLI
```bash
npm install -g @render/cli
```

#### Step 2: Login to Render
```bash
render login
```

#### Step 3: Deploy
```bash
cd server
render up
```

---

## 🔗 Connect Frontend to Backend

Once your backend is deployed, you need to update the frontend:

### Step 1: Create Production Environment File

Create `.env.production` in the **root directory**:

```env
VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com
```

Replace `YOUR-BACKEND-URL` with your actual Render URL.

### Step 2: Rebuild and Redeploy Frontend

```bash
# Build with production env
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

---

## ✅ Verify Everything Works

### 1. Test Backend Health
```bash
curl https://YOUR-BACKEND-URL.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "groqConfigured": true
}
```

### 2. Test Frontend
1. Visit: https://gamified-learning-d1b24.web.app
2. Login as teacher
3. Go to Question Generator
4. Try generating questions
5. Should work in 2-5 seconds!

---

## 🎨 Update Firestore Rules for Production

Go to Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is a teacher
    function isTeacher() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Subjects - teachers can edit, students can read published
    match /subjects/{subjectId} {
      allow read: if isAuthenticated() && 
        (isTeacher() || resource.data.published == true);
      allow write: if isTeacher();
    }
    
    // Topics - teachers can edit, students can read published
    match /topics/{topicId} {
      allow read: if isAuthenticated() && 
        (isTeacher() || resource.data.published == true);
      allow write: if isTeacher();
    }
    
    // Questions - teachers can edit, students can read published
    match /questions/{questionId} {
      allow read: if isAuthenticated() && 
        (isTeacher() || resource.data.status == 'published');
      allow write: if isTeacher();
    }
    
    // Progress - users can manage their own
    match /progress/{progressId} {
      allow read, write: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Quiz attempts - users can manage their own
    match /quizAttempts/{attemptId} {
      allow read, write: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Leaderboard - everyone can read, system writes
    match /leaderboard/{entryId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
  }
}
```

Click **"Publish"** after pasting the rules.

---

## 📊 Monitor Your Deployment

### Render Dashboard
- **Logs:** See real-time backend logs
- **Metrics:** CPU, Memory usage
- **Events:** Deployment history

### Firebase Console
- **Hosting:** See deployment history and traffic
- **Firestore:** Monitor database usage
- **Authentication:** See user registrations

---

## ⚠️ Important Notes

### Render Free Tier Limitations
- **Sleeps after 15 minutes** of inactivity
- **First request takes ~30 seconds** to wake up
- Subsequent requests are instant
- Perfect for testing and small projects!

### To Prevent Sleep (Optional - $7/month)
- Upgrade to Render paid plan
- Or use a service like UptimeRobot to ping every 10 minutes

---

## 🚨 Troubleshooting

### Backend Not Starting
1. Check Render logs in dashboard
2. Verify all environment variables are set
3. Make sure GROQ_API_KEY is correct

### Frontend Can't Connect to Backend
1. Check `.env.production` has correct backend URL
2. Verify CORS settings in backend include your Firebase URL
3. Rebuild and redeploy frontend

### Questions Not Generating
1. Test backend health endpoint
2. Check Groq API key is valid
3. Check browser console for errors

---

## 🎉 You're Almost Done!

**Current Status:**
- ✅ Frontend deployed and live
- ⏳ Backend needs: GitHub push + Render setup
- ⏳ Frontend needs: Update with backend URL and redeploy

**Time Estimate:**
- With GitHub: ~10 minutes
- Without GitHub: ~5 minutes with Render CLI

---

## 📞 Need Help?

- **Render Docs:** https://render.com/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Groq API:** https://console.groq.com/docs

**Check these files for more info:**
- `DEPLOY_NOW.md` - Quick deployment guide
- `DEPLOYMENT.md` - Comprehensive deployment options
- `DEPLOYMENT_GUIDE.md` - Detailed step-by-step guide
