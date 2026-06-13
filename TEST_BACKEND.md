# Backend Testing Guide

## Quick Test URLs

### 1. Health Check
```
https://gamified-learning-api-7cmb.onrender.com/health
```

**Expected Response:**
```json
{
  "ok": true,
  "service": "skill-park-api",
  "version": "1.0.0",
  "environment": "production",
  "llmConfigured": true,
  "llmProvider": "Groq (FREE)",
  "timestamp": "2026-06-12T...",
  "uptime": 123.456
}
```

**Key Field:** `llmConfigured: true` ✅

---

### 2. Root Endpoint
```
https://gamified-learning-api-7cmb.onrender.com/
```

**Expected Response:**
```json
{
  "ok": true,
  "service": "skill-park-api",
  "message": "Skill Park API is running.",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "generateQuestions": "POST /api/questions/generate"
  }
}
```

---

## Testing with cURL (Command Line)

### Health Check
```bash
curl https://gamified-learning-api-7cmb.onrender.com/health
```

### Generate Questions (Test API)
```bash
curl -X POST https://gamified-learning-api-7cmb.onrender.com/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Mathematics",
    "topic": "Algebra",
    "classLevel": "Grade 8",
    "difficulty": "medium",
    "count": 3
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question": "What is 2x + 3 = 11?",
        "options": ["x = 4", "x = 5", "x = 6", "x = 7"],
        "correctAnswer": 0
      },
      ...
    ],
    "metadata": {
      "source": "groq",
      "model": "llama-3.3-70b-versatile",
      "count": 3,
      "subject": "Mathematics",
      "topic": "Algebra",
      "difficulty": "medium"
    }
  }
}
```

---

## Testing from Frontend (Browser)

### Option 1: Use the App
1. Go to: https://gamified-learning-d1b24.web.app
2. Login as teacher
3. Navigate to **"Generate"** page
4. Fill the form
5. Click **"🤖 Generate Questions"**
6. Check browser console (F12) for requests

### Option 2: Browser Console Test
1. Go to: https://gamified-learning-d1b24.web.app
2. Open browser console (F12)
3. Paste this code:

```javascript
// Test API call
fetch('https://gamified-learning-api-7cmb.onrender.com/api/questions/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    subject: 'Mathematics',
    topic: 'Algebra',
    classLevel: 'Grade 8',
    difficulty: 'medium',
    count: 3
  })
})
.then(res => res.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

---

## What to Check

### ✅ Success Indicators
- `llmConfigured: true` in health check
- `llmProvider: "Groq (FREE)"` in health check
- Questions generated in 2-5 seconds
- Response has `success: true`
- Questions array has correct number of items
- Each question has: question, options, correctAnswer

### ❌ Error Indicators

#### CORS Error
```
Access to fetch at 'https://...' from origin 'https://gamified-learning-d1b24.web.app' 
has been blocked by CORS policy
```
**Fix:** Update ALLOWED_ORIGINS on Render

#### LLM Not Configured
```json
{
  "llmConfigured": false,
  "llmProvider": null
}
```
**Fix:** Add GROQ_API_KEY on Render

#### Timeout Error
```
Failed to fetch
```
**Reason:** First request to cold backend (Render free tier)
**Fix:** Wait 30-60 seconds and try again

#### 500 Server Error
```json
{
  "error": {
    "message": "Internal server error"
  }
}
```
**Fix:** Check Render logs for details

---

## Reading Render Logs

### How to Access Logs
1. Go to: https://dashboard.render.com
2. Click: gamified-learning-api-7cmb
3. Click: **"Logs"** tab (left sidebar)
4. See real-time logs

### What to Look For

**Good Logs:**
```
Skill Park API Server Started
Environment: production
Port: 3000
LLM Status: ✓ Groq (FREE)
```

**Error Logs:**
```
Error: GROQ_API_KEY is not defined
```
→ Environment variable not set

```
Error: Invalid API key
```
→ Wrong API key value

```
CORS error
```
→ ALLOWED_ORIGINS not set correctly

---

## Common Issues & Solutions

### Issue 1: "Backend not responding"
- **Check:** Is Render service running?
- **Go to:** Render dashboard → Check status
- **Solution:** If stopped, click "Manual Deploy" button

### Issue 2: "llmConfigured: false"
- **Check:** Environment variables on Render
- **Solution:** Add GROQ_API_KEY and GROQ_MODEL

### Issue 3: "CORS error"
- **Check:** ALLOWED_ORIGINS includes Firebase hosting URL
- **Solution:** Add both URLs (web.app and firebaseapp.com)

### Issue 4: "Timeout on first request"
- **Check:** Render free tier has cold starts
- **Solution:** Wait 30-60 seconds, try again

### Issue 5: "Rate limit exceeded"
- **Check:** Groq has 30 requests/minute limit
- **Solution:** Wait 1 minute, try again

---

## Performance Expectations

### First Request (Cold Start)
- **Time:** 30-60 seconds
- **Reason:** Render spins up inactive services
- **Solution:** Wait and retry

### Subsequent Requests
- **Time:** 2-5 seconds
- **Reason:** Service is warmed up
- **Performance:** Fast and consistent

### Rate Limits (Groq FREE tier)
- **Per minute:** 30 requests
- **Per day:** 14,400 requests
- **Enough for:** 500+ students generating questions

---

## Emergency Contact Info

**Render Support:**
- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs
- Status: https://status.render.com

**Groq API:**
- Console: https://console.groq.com
- Docs: https://console.groq.com/docs
- Pricing: FREE (no credit card)

**Firebase:**
- Console: https://console.firebase.google.com
- Hosting: Project "gamified-learning-d1b24"

---

## Success Criteria ✅

- [x] Health endpoint returns `llmConfigured: true`
- [x] Health endpoint shows `llmProvider: "Groq (FREE)"`
- [x] Question generation works from frontend
- [x] Questions appear in 2-5 seconds
- [x] No CORS errors in browser console
- [x] Questions are relevant to subject/topic
- [x] Questions have correct format (question, options, correctAnswer)

**If all checked → Backend is fully working! 🎉**
