# 🔧 Troubleshooting Guide - Common Issues

**Quick fixes for common problems**

---

## ❌ "Failed to load learning content" Error

### Symptoms:
- Error message appears on Learn page
- "Failed to load learning content. Please try again."
- No subjects showing

### Root Causes & Solutions:

#### 1. Empty Database (Most Common) ✅
**This is NORMAL on first run!**

**Solution**: Create test data as a teacher:

```bash
1. Login as Teacher (or create teacher account)
2. Click "Subjects" from menu
3. Click "Create Subject"
   - Name: "Mathematics"
   - Description: "Basic math concepts"
   - Icon: 📐 (optional)
   - Click "Create"
4. Click "Add Topic" in the subject
   - Name: "Algebra Basics"
   - Description: "Introduction to algebra"
   - Click "Add"
5. Click "Generate" from menu
   - Select subject and topic
   - Generate 5 questions
6. Go to "Question Bank"
   - Approve questions
   - Click "Publish Selected"
7. Now logout and login as Student
   - You'll see "Mathematics" subject!
```

#### 2. Firestore Security Rules Not Set ⚠️
**Check if this is the issue**:

Open browser console (F12) → Look for errors like:
```
FirebaseError: Missing or insufficient permissions
```

**Solution**: Set up Firestore rules

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `gamified-learning-d1b24`
3. Go to: Firestore Database → Rules
4. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow read/write for development
    // WARNING: Change this before production!
    match /{document=**} {
      allow read, write: if true;
    }
    
    // For production, use rules from PRE_LAUNCH_CHECKLIST.md
  }
}
```

5. Click "Publish"
6. Refresh your app

#### 3. Firebase Not Connected
**Check if this is the issue**:

Open browser console (F12) → Look for errors like:
```
FirebaseError: Firebase App not initialized
```

**Solution**: Check your `.env` file

1. Open `.env` file in project root
2. Verify all Firebase values are filled:
```env
VITE_FIREBASE_API_KEY=AIzaSy... (should be filled)
VITE_FIREBASE_AUTH_DOMAIN=...firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gamified-learning-d1b24
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

3. If any are empty, get them from Firebase Console
4. Restart dev server: `npm run dev`

#### 4. Network/Internet Issue
**Check if this is the issue**:

Error message mentions "unavailable" or "connection"

**Solution**:
1. Check your internet connection
2. Try accessing https://firebase.google.com
3. Check if firewall is blocking Firebase
4. Try different network/disable VPN

---

## ❌ "Cannot connect to backend" (Question Generation)

### Symptoms:
- Questions not generating
- Error when clicking "Generate Questions"
- Backend health check fails

### Solutions:

#### 1. Backend Not Running
**Check**: Is the backend server running?

```bash
# Terminal 2 should show:
cd server
npm run dev

# Should see:
Server running on port 3000
LLM configured: true/false
```

**Solution**: Start the backend
```bash
cd server
npm install  # if first time
npm run dev
```

#### 2. OpenAI Key Missing
**Check**: Backend logs show "LLM configured: false"

**Solution**: Add OpenAI API key
```bash
1. Open server/.env
2. Add your key:
   OPENAI_API_KEY=sk-your-key-here
3. Restart backend
4. Questions will now generate (or use mock data)
```

#### 3. Port Already in Use
**Error**: "Port 3000 is already in use"

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in server/.env:
PORT=3001

# Then update frontend .env:
VITE_API_URL=http://localhost:3001
```

---

## ❌ Authentication Issues

### "User not authenticated" or redirect loops

#### Solution 1: Clear Storage
```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
// Then refresh page
```

#### Solution 2: Check Firebase Auth
1. Go to Firebase Console
2. Authentication → Sign-in method
3. Verify "Email/Password" is enabled
4. Check if user exists in Authentication → Users

#### Solution 3: Re-login
1. Logout
2. Clear browser cache (Ctrl+Shift+Del)
3. Login again

---

## ❌ "Student can access teacher pages" (Security)

### This is a Firebase security rules issue

**Solution**: Deploy proper security rules from PRE_LAUNCH_CHECKLIST.md

For now (development only):
1. The app has client-side protection (RoleRoute)
2. This prevents UI access
3. For full security, deploy Firestore rules

---

## ❌ Build Errors

### "Module not found" or import errors

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Also for backend
cd server
rm -rf node_modules package-lock.json
npm install
```

### Build fails with memory error

**Solution**:
```bash
# Increase Node memory
set NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

---

## ❌ Page Not Loading / White Screen

### Check browser console for errors

**Common fixes**:

1. **Check route**: Make sure URL is correct
   - `/learn` ✅
   - `/courses` ✅
   - `/quiz` ✅
   - Not: `/app/learn` ❌

2. **Hard refresh**: Ctrl+F5

3. **Clear cache**:
```javascript
// Browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

4. **Check if logged in**: Some routes require authentication

---

## ❌ Firestore Read/Write Errors

### "Missing or insufficient permissions"

**Temporary fix (development)**:
```javascript
// Firestore Rules - Set to allow all (temporarily)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Production fix**: Use rules from PRE_LAUNCH_CHECKLIST.md

---

## ❌ XP Not Updating

### Check progress service

**Solution**:
1. Check browser console for errors
2. Verify progress document exists in Firestore:
   - Collection: `progress`
   - Document ID: user's UID
3. If doesn't exist, take a quiz - it will be created

---

## ❌ Leaderboard Empty

### Need multiple students with quiz attempts

**Solution**:
1. Create 2-3 student accounts
2. Have each take a quiz
3. Leaderboard will populate automatically

---

## 🔍 Debug Checklist

When something doesn't work, check:

```
□ Browser console (F12) - Any errors?
□ Network tab - API calls failing?
□ Frontend running? (http://localhost:5173)
□ Backend running? (http://localhost:3000)
□ Backend health check: curl http://localhost:3000/health
□ Firebase authenticated? (Check top-right of page)
□ Correct role? (Student vs Teacher)
□ Database has data? (Check Firebase Console)
□ Firestore rules allow access?
□ .env files configured correctly?
□ Node modules installed? (npm install)
```

---

## 🆘 Getting More Help

### Enable Debug Logging

1. Open browser console (F12)
2. Type: `localStorage.setItem('debug', 'true')`
3. Refresh page
4. You'll see detailed logs

### Check Health Status

```bash
# Backend health
curl http://localhost:3000/health

# Should return:
{
  "status": "healthy",
  "llmConfigured": true,
  "uptime": 12345
}
```

### Common Console Commands

```javascript
// Check auth state
console.log(localStorage.getItem('skillpark_user'));

// Check Firebase connection
console.log(firebase.app().name);

// Clear all data
localStorage.clear();
sessionStorage.clear();

// Force reload
location.reload(true);
```

---

## 📞 Still Stuck?

1. Check all error messages in browser console
2. Check backend terminal for errors
3. Verify all services in QUICK_START.md are running
4. Review DEBUG_REPORT.md for similar issues
5. Check Firebase Console for data

---

## ✅ Quick Fixes Summary

| Problem | Quick Fix |
|---------|-----------|
| No subjects showing | Login as teacher → Create subject → Publish |
| Permission denied | Set Firestore rules to allow all (dev) |
| Backend not responding | `cd server && npm run dev` |
| Auth issues | Clear storage + re-login |
| Build errors | Delete node_modules + npm install |
| White screen | Check console + verify route |
| XP not updating | Take a quiz as student |
| Leaderboard empty | Create multiple students |

---

**Most Common Issue**: Empty database - just create content as teacher first! ✅

**Document Created**: June 8, 2026  
**Status**: Ready to use  

