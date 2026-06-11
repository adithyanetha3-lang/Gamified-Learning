# 🚀 Pre-Launch Checklist - Skill Park Platform

**Complete this checklist before deploying to production**

---

## ⚠️ CRITICAL - MUST DO BEFORE LAUNCH

### 1. Deploy Firestore Security Rules (5 minutes) 🔴 CRITICAL

**Current Status**: ❌ Data is publicly accessible  
**Action Required**: Deploy security rules to protect user data

#### Steps:
```bash
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Navigate to: Firestore Database → Rules
4. Replace existing rules with the rules below
5. Click "Publish"
```

#### Security Rules (Copy & Paste):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is owner
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Helper function to get user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Helper function to check if user is teacher
    function isTeacher() {
      return isAuthenticated() && getUserRole() == 'teacher';
    }
    
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update, delete: if isAuthenticated() && isOwner(userId);
    }
    
    // Subjects - teachers can write, authenticated users can read
    match /subjects/{subjectId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isTeacher();
    }
    
    // Topics - teachers can write, authenticated users can read
    match /topics/{topicId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isTeacher();
    }
    
    // Questions - teachers can write, students can read published only
    match /questions/{questionId} {
      allow read: if isAuthenticated() && 
        (isTeacher() || resource.data.status == 'published');
      allow create, update, delete: if isTeacher();
    }
    
    // Quiz Attempts - users can only access their own attempts
    match /quizAttempts/{attemptId} {
      allow read: if isAuthenticated() && 
        (isOwner(resource.data.userId) || isTeacher());
      allow create: if isAuthenticated() && 
        isOwner(request.resource.data.userId);
      allow update: if isAuthenticated() && 
        isOwner(resource.data.userId);
      allow delete: if false; // Don't allow deletion
    }
    
    // Progress - users can only access their own progress
    match /progress/{userId} {
      allow read: if isAuthenticated() && 
        (isOwner(userId) || isTeacher());
      allow create, update: if isAuthenticated() && isOwner(userId);
      allow delete: if false; // Don't allow deletion
    }
    
    // Leaderboard - read-only for authenticated users
    match /leaderboard/{entryId} {
      allow read: if isAuthenticated();
      allow write: if false; // Updated via Cloud Functions only
    }
  }
}
```

**Verification**:
```bash
✓ Rules published successfully
✓ Test with student account - should see published questions only
✓ Test with teacher account - should see all questions
```

---

## 🔧 CONFIGURATION (15 minutes)

### 2. Configure Firebase Project

#### Create Firebase Project:
```bash
1. Go to: https://console.firebase.google.com
2. Click "Add project"
3. Name: "Skill Park" (or your preferred name)
4. Enable Google Analytics: Optional
5. Wait for project creation (~1 minute)
```

#### Enable Authentication:
```bash
1. In Firebase Console, go to: Authentication
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Save
```

#### Create Firestore Database:
```bash
1. In Firebase Console, go to: Firestore Database
2. Click "Create database"
3. Start in: "Production mode" (we'll add rules manually)
4. Select location: Choose closest to your users
5. Wait for database creation (~1 minute)
```

#### Get Firebase Credentials:
```bash
1. In Firebase Console, go to: Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Web" icon (</> symbol)
4. Register app name: "Skill Park Web"
5. Copy the config object (you'll need these values)
```

### 3. Configure Environment Variables

#### Frontend Environment (.env):
```bash
# Copy template
cp .env.example .env

# Edit .env with your values:
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
VITE_API_URL=http://localhost:3000
```

#### Backend Environment (server/.env):
```bash
# Copy template
cd server
cp .env.example .env

# Edit server/.env with your values:
PORT=3000
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key_here
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o-mini
FIREBASE_PROJECT_ID=your_project_id
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### 4. Get OpenAI API Key

```bash
1. Go to: https://platform.openai.com
2. Sign up / Log in
3. Go to: API Keys section
4. Click "Create new secret key"
5. Copy the key (you won't see it again!)
6. Paste into server/.env as OPENAI_API_KEY
```

**Alternative**: Use any OpenAI-compatible API:
- OpenRouter
- Together AI
- Local LLM (Ollama, etc.)

---

## 🧪 TESTING (15 minutes)

### 5. Local Testing Before Deployment

#### Start Development Servers:
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend  
cd server
npm run dev
```

#### Test Checklist:

**Backend Health Check**:
```bash
# Should return: {"status":"healthy","llmConfigured":true}
curl http://localhost:3000/health
```

**Teacher Flow**:
```
□ Sign up as teacher
□ Create subject "Test Subject"
□ Add topic "Test Topic"
□ Go to Generator
□ Generate 3 questions (AI)
□ Review questions
□ Approve questions
□ Publish questions
□ Verify in Question Bank
```

**Student Flow**:
```
□ Sign up as student (different email)
□ Browse subjects
□ Click "Test Subject"
□ See "Test Topic"
□ Click "Start Quiz"
□ Answer questions
□ Submit quiz
□ Verify XP awarded
□ Check progress page shows XP
□ Check leaderboard shows ranking
```

**Security Test**:
```
□ Log out
□ Try to access /learn directly
□ Should redirect to login ✓
□ Student account shouldn't access /teacher ✓
□ Teacher account shouldn't access student-only pages ✓
```

---

## 📦 DEPLOYMENT (10 minutes)

### 6. Choose Deployment Method

#### Option A: Docker Compose (Easiest)
```bash
# 1. Build and start
docker-compose up -d

# 2. Check logs
docker-compose logs -f

# 3. Verify
curl http://localhost:3000/health
open http://localhost:5173

# 4. Stop (if needed)
docker-compose down
```

#### Option B: Separate Deployments

**Frontend (Choose one)**:
```bash
# Vercel
npm run build
vercel --prod

# Netlify
npm run build
netlify deploy --prod --dir=dist

# Firebase Hosting
npm run build
firebase deploy --only hosting
```

**Backend (Choose one)**:
```bash
# Render.com
# - Create web service
# - Connect GitHub repo
# - Set root directory: server
# - Build: npm install
# - Start: npm start

# Railway
railway login
railway init
railway up

# Heroku
heroku create skill-park-api
git subtree push --prefix server heroku main
```

#### Option C: VPS (Manual)
See `DEPLOYMENT.md` for detailed instructions.

---

## ✅ POST-DEPLOYMENT VERIFICATION (5 minutes)

### 7. Production Smoke Tests

```bash
# Replace with your production URLs
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://your-api-domain.com

# Check backend health
curl $BACKEND_URL/health

# Check frontend loads
curl -I $FRONTEND_URL

# Test authentication flow manually:
1. Open $FRONTEND_URL
2. Sign up as teacher
3. Create test subject
4. Generate questions
5. Sign up as student (incognito)
6. Take quiz
7. Verify XP awarded
```

### 8. Monitor First 24 Hours

**Set up monitoring**:
```bash
□ UptimeRobot: Monitor frontend & backend uptime
□ Firebase Console: Check Firestore read/write metrics
□ Server logs: Watch for errors
□ OpenAI Dashboard: Monitor API usage
```

**Check metrics**:
```bash
□ Response times < 2s
□ No error spikes
□ Firestore costs within budget
□ OpenAI API costs reasonable
```

---

## 🎯 SUCCESS CRITERIA

### Before Declaring "LAUNCHED":

**Functionality** ✓
```
✓ Teacher can create subjects and topics
✓ Teacher can generate and publish questions
✓ Student can browse and take quizzes
✓ XP and leveling system works
✓ Leaderboard updates correctly
✓ Progress tracking accurate
✓ Both mobile and desktop work
```

**Security** ✓
```
✓ Firestore rules deployed and tested
✓ Authentication required for all pages
✓ Role-based access working
✓ HTTPS enabled (production)
✓ Environment variables secured
✓ No credentials in code
```

**Performance** ✓
```
✓ Pages load in < 3s
✓ No console errors
✓ Build successful
✓ All routes working
✓ Images load properly
✓ Mobile performance acceptable
```

**Monitoring** ✓
```
✓ Health check endpoint responding
✓ Uptime monitoring configured
✓ Error tracking ready
✓ Logs accessible
✓ Firebase metrics visible
```

---

## 🚨 ROLLBACK PLAN

### If Something Goes Wrong:

#### Backend Issues:
```bash
# Docker
docker-compose down
# Fix issue
docker-compose up -d

# Platform deployment
# Rollback to previous version via platform UI
```

#### Frontend Issues:
```bash
# Most platforms have instant rollback
# Or redeploy previous version:
git checkout <previous-commit>
npm run build
# Deploy
```

#### Database Issues:
```bash
# Firestore rules causing problems:
# - Revert to previous rules in Firebase Console
# - Or set to test mode temporarily (NOT recommended)
```

---

## 📞 SUPPORT CHECKLIST

### Have These Ready:

```bash
✓ Firebase Console access
✓ OpenAI API Dashboard access
✓ Deployment platform credentials
✓ Environment variable backups
✓ This checklist
✓ DEPLOYMENT.md documentation
✓ DEBUG_REPORT.md for troubleshooting
```

---

## 🎉 LAUNCH!

### When All Checkboxes Are Complete:

```bash
🎊 YOU'RE READY TO LAUNCH! 🎊

Next steps:
1. Announce to your users
2. Monitor closely for 24-48 hours
3. Collect feedback
4. Iterate and improve

Remember:
- Start with small user group (beta)
- Scale gradually
- Monitor costs (Firebase, OpenAI)
- Keep backups
- Have fun! 🚀
```

---

## 📋 QUICK REFERENCE

### Essential URLs:
```
Firebase Console:    https://console.firebase.google.com
OpenAI Dashboard:    https://platform.openai.com
GitHub Repo:         [Your repo URL]
Frontend Prod:       [Your frontend URL]
Backend Prod:        [Your backend URL]
Health Check:        [Your backend URL]/health
```

### Essential Commands:
```bash
# Local development
npm run dev                    # Frontend
cd server && npm run dev      # Backend

# Build
npm run build                 # Frontend
cd server && npm start        # Backend

# Docker
docker-compose up -d          # Start
docker-compose logs -f        # View logs
docker-compose down           # Stop

# Test backend
curl http://localhost:3000/health
```

---

**Created**: June 8, 2026  
**Status**: Ready to use  
**Time to Complete**: ~30-45 minutes (first time)  

**Good luck with your launch! 🚀🎓**

