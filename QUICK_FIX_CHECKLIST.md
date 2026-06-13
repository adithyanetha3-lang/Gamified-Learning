# 🔧 Quick Fix Checklist - Backend Not Working

## Problem
Backend is running but can't generate questions.

## Root Cause
❌ Missing Groq API key on Render.com  
❌ Wrong CORS configuration

## Solution (5 minutes)

### ☐ Step 1: Go to Render Dashboard
```
https://dashboard.render.com
→ Login
→ Click: gamified-learning-api-7cmb
```

### ☐ Step 2: Click "Environment" (Left Sidebar)

### ☐ Step 3: Add These 4 Variables

```
GROQ_API_KEY
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

GROQ_MODEL
llama-3.3-70b-versatile

ALLOWED_ORIGINS
https://gamified-learning-d1b24.web.app,https://gamified-learning-d1b24.firebaseapp.com

NODE_ENV
production
```

### ☐ Step 4: Click "Save Changes"

### ☐ Step 5: Wait 2-3 Minutes
- Watch deployment progress
- Wait for "Deploy succeeded" ✅

### ☐ Step 6: Test Health Endpoint
```
https://gamified-learning-api-7cmb.onrender.com/health
```

Should show:
```json
"llmConfigured": true,
"llmProvider": "Groq (FREE)"
```

### ☐ Step 7: Test Question Generation
```
1. Go to: https://gamified-learning-d1b24.web.app
2. Login as teacher
3. Click "Generate"
4. Select subject, topic, difficulty
5. Click "🤖 Generate Questions"
6. Wait 2-5 seconds
7. See questions appear! ✨
```

## ✅ Done!

Your backend is now fully working:
- ✅ AI question generation enabled
- ✅ CORS configured for Firebase hosting
- ✅ FREE Groq API (no credit card)
- ✅ Fast generation (2-5 seconds)

---

## 🆘 Need Help?

**If health check shows `llmConfigured: false`**
→ Groq API key not set correctly on Render

**If you see CORS error in browser console (F12)**
→ ALLOWED_ORIGINS not set correctly

**If you see timeout error**
→ Backend is cold (first request takes 30-60 seconds)
→ Try again, next requests will be fast

**If deployment fails**
→ Check Logs tab on Render
→ Look for error messages

---

## 📚 Detailed Guides
- `BACKEND_ENV_FIX.md` - Full explanation
- `RENDER_ENV_SETUP.md` - Step-by-step with screenshots
