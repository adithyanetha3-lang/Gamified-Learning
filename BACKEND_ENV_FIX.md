# Backend Environment Fix

## Problem
The backend on Render.com needs the correct environment variables configured:
1. **Groq API Key** - For AI question generation
2. **CORS Origins** - To allow requests from Firebase hosting

## Solution - Update Render.com Environment Variables

### Step 1: Go to Render Dashboard
1. Visit: https://dashboard.render.com
2. Login with your account
3. Click on your service: **gamified-learning-api-7cmb**

### Step 2: Update Environment Variables
1. Click on **"Environment"** in the left sidebar
2. Add/Update these environment variables:

```
GROQ_API_KEY=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
GROQ_MODEL=llama-3.3-70b-versatile
ALLOWED_ORIGINS=https://gamified-learning-d1b24.web.app,https://gamified-learning-d1b24.firebaseapp.com
NODE_ENV=production
```

### Step 3: Save and Deploy
1. Click **"Save Changes"** button
2. Render will automatically redeploy your backend with new environment variables
3. Wait 2-3 minutes for deployment to complete

### Step 4: Test the Backend
1. Visit: https://gamified-learning-api-7cmb.onrender.com/health
2. You should see: `"llmConfigured": true` and `"llmProvider": "Groq (FREE)"`
3. If you see this, the backend is ready!

### Step 5: Test Question Generation
1. Go to your app: https://gamified-learning-d1b24.web.app
2. Login as a teacher
3. Navigate to **"Generate"** page
4. Select a subject, topic, difficulty, and number of questions
5. Click **"🤖 Generate Questions"**
6. Questions should be generated in 2-5 seconds!

## What Changed?

### Before:
- ❌ No Groq API key configured
- ❌ CORS only allowed "yourdomain.com"
- ❌ Backend returned mock questions or errors

### After:
- ✅ Groq API key configured (FREE, no credit card needed)
- ✅ CORS allows Firebase hosting URLs
- ✅ Backend generates real AI questions using Groq's llama-3.3-70b-versatile model

## Troubleshooting

### If you see "Failed to generate questions"
1. **Check browser console (F12)**:
   - CORS error? → Make sure ALLOWED_ORIGINS is set correctly on Render
   - 500 error? → Check Render logs for error details
   - Timeout? → Groq API might be rate limited (wait 1 minute)

2. **Check backend health**:
   - Visit: https://gamified-learning-api-7cmb.onrender.com/health
   - Look for: `"llmConfigured": true`
   - Look for: `"llmProvider": "Groq (FREE)"`

3. **Check Render logs**:
   - Go to Render dashboard → Your service → "Logs" tab
   - Look for any errors when generating questions

### If CORS error persists
Make sure the ALLOWED_ORIGINS includes BOTH:
- `https://gamified-learning-d1b24.web.app`
- `https://gamified-learning-d1b24.firebaseapp.com`

Separated by comma, no spaces.

## Files Updated
- ✅ `server/.env.production` - Updated with Groq API key and correct CORS origins

## Next Steps
1. Update environment variables on Render.com (see Step 2 above)
2. Wait for automatic redeployment (2-3 minutes)
3. Test the health endpoint
4. Test question generation from the app

---

**Note**: The Groq API key used here is FREE and requires no credit card. It has generous rate limits:
- 30 requests per minute
- 14,400 requests per day
- Perfect for an educational platform!
