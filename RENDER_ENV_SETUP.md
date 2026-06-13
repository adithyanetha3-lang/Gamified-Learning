# Render.com Environment Variables Setup Guide

## Quick Steps (5 minutes)

### 1. Login to Render
Go to: **https://dashboard.render.com**

### 2. Find Your Service
- Look for: **gamified-learning-api-7cmb**
- Click on it to open

### 3. Go to Environment Tab
- On the left sidebar, click **"Environment"**
- You'll see a list of environment variables

### 4. Add These Variables

Click **"Add Environment Variable"** for each one:

#### Variable 1: GROQ_API_KEY
```
Key: GROQ_API_KEY
Value: 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
```

#### Variable 2: GROQ_MODEL
```
Key: GROQ_MODEL
Value: llama-3.3-70b-versatile
```

#### Variable 3: ALLOWED_ORIGINS
```
Key: ALLOWED_ORIGINS
Value: https://gamified-learning-d1b24.web.app,https://gamified-learning-d1b24.firebaseapp.com
```

#### Variable 4: NODE_ENV
```
Key: NODE_ENV
Value: production
```

### 5. Save Changes
- Click the **"Save Changes"** button at the bottom
- Render will automatically start redeploying your service
- Watch the deployment progress in the **"Events"** or **"Logs"** tab

### 6. Wait for Deployment
- Takes about 2-3 minutes
- Status will show: **"Deploy succeeded"** when ready
- Green checkmark ✅ means it's live

### 7. Verify It's Working

**Test 1: Health Check**
Open this URL in your browser:
```
https://gamified-learning-api-7cmb.onrender.com/health
```

You should see:
```json
{
  "ok": true,
  "service": "skill-park-api",
  "llmConfigured": true,
  "llmProvider": "Groq (FREE)",
  ...
}
```

**Test 2: Generate Questions**
1. Go to your app: https://gamified-learning-d1b24.web.app
2. Login as a teacher
3. Click **"Generate"** in the navigation
4. Fill in the form:
   - Select a subject
   - Select a topic
   - Choose difficulty
   - Set number of questions (1-10)
5. Click **"🤖 Generate Questions"**
6. Wait 2-5 seconds
7. Questions should appear! ✨

## Visual Guide

### Where to Find Environment Variables on Render

```
Dashboard → Your Service → Environment (left sidebar)
```

### What It Should Look Like After Adding Variables

```
GROQ_API_KEY          = gsk_UXEf... (hidden)
GROQ_MODEL            = llama-3.3-70b-versatile
ALLOWED_ORIGINS       = https://gamified-learning-d1b24.web.app,...
NODE_ENV              = production
```

### Deployment Progress

You'll see logs like:
```
==> Starting deployment...
==> Building image...
==> Starting service...
==> Service is live ✅
```

## Troubleshooting

### Can't Find Environment Tab?
- Make sure you're in your web service (gamified-learning-api-7cmb)
- Not in the dashboard homepage
- Look for tabs: Overview, Events, Logs, **Environment**, Settings

### Variables Not Saving?
- Check that you clicked "Save Changes" button
- Wait for page to reload/confirm
- Refresh the page to verify they're there

### Deployment Failed?
- Check the **"Logs"** tab for error messages
- Common issue: syntax error in environment variable value
- Make sure there are no extra spaces in values
- ALLOWED_ORIGINS should have NO SPACES between URLs

### Still Getting Errors?
1. Check backend logs: Dashboard → Your Service → Logs
2. Check frontend console: Press F12 in browser → Console tab
3. Test health endpoint again
4. Contact support or share error message

## Alternative: Use Render CLI

If you prefer command line:

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Set environment variables
render env set GROQ_API_KEY=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
render env set GROQ_MODEL=llama-3.3-70b-versatile
render env set ALLOWED_ORIGINS=https://gamified-learning-d1b24.web.app,https://gamified-learning-d1b24.firebaseapp.com
render env set NODE_ENV=production
```

## What Happens After Setup?

### Backend Capabilities
- ✅ Generate AI questions using Groq's Llama 3.3 70B model
- ✅ FREE (no credit card needed)
- ✅ Fast (2-5 seconds per generation)
- ✅ High quality educational content
- ✅ 30 requests/minute rate limit
- ✅ 14,400 requests/day limit

### Frontend Features
- ✅ Teachers can generate custom questions
- ✅ Questions are contextual to subject and topic
- ✅ Multiple difficulty levels
- ✅ Optional lesson text input for context
- ✅ Preview before saving to question bank
- ✅ Bulk save to Firestore

---

**That's it!** Your backend is now fully configured and ready to generate AI questions. 🚀
