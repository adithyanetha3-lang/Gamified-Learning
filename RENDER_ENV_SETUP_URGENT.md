# 🚨 URGENT: Fix Groq API Key on Render

## Current Problem

Your Render logs show: **"Invalid API key"** ❌

This means:
- ✅ Code is deployed and running
- ✅ Deployment succeeded
- ❌ **GROQ_API_KEY is not set correctly on Render**
- ❌ AI is NOT working
- ❌ Falling back to generic templates

## Quick Fix (5 minutes)

### Step 1: Go to Render Environment Settings

1. Open: https://dashboard.render.com
2. Click on your service: **gamified-learning-api**
3. Click **"Environment"** in the left sidebar
4. You'll see a list of environment variables

### Step 2: Add/Update GROQ API Key

Click **"Add Environment Variable"** or edit existing ones:

**Variable 1:**
```
Key:   GROQ_API_KEY
Value: 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
```

**Variable 2:**
```
Key:   GROQ_MODEL
Value: llama-3.3-70b-versatile
```

**Variable 3:**
```
Key:   NODE_ENV
Value: production
```

**Variable 4:**
```
Key:   ALLOWED_ORIGINS
Value: https://gamified-learning-d1b24.web.app,https://gamified-learning-d1b24.firebaseapp.com
```

### Step 3: Save and Redeploy

1. Click **"Save Changes"**
2. Render will **automatically redeploy** (30-60 seconds)
3. Wait for "Live" status

### Step 4: Verify It Works

**Test Backend Health:**
```bash
curl https://gamified-learning-api-7cmb.onrender.com/health
```

Should show:
```json
{
  "ok": true,
  "llmConfigured": true,
  "provider": "Groq (FREE)"
}
```

**Test Lesson Generation:**
1. Login as Teacher
2. Go to Subject Management
3. Generate a lesson for "Inorganic Chemistry"
4. Content should be **topic-specific** with real chemistry terms

---

## Why This Happened

- Local `.env` file has the correct API key ✅
- But Render uses **separate environment variables** ⚠️
- You need to set them in Render dashboard manually
- Local env files are NOT uploaded to Render (for security)

---

## What You Should See After Fix

### Render Logs (Success) ✅
```
🚀 Server running on port 3000
🔥 Groq AI configured
Model: llama-3.3-70b-versatile
✅ Health check: OK
```

### Lesson Content (Topic-Specific) ✅
```
🎯 Inorganic Chemistry

📖 Introduction
Inorganic chemistry focuses on inorganic compounds - those NOT 
based on carbon-hydrogen bonds. Includes:
- Metal complexes
- Coordination compounds
- Transition elements
- Main group chemistry

📚 Coordination Compounds
- Central metal ion + ligands
- Coordination number = number of bonds
- Example: [Cu(NH3)4]²⁺
  - Cu²⁺ = central ion
  - NH3 = ligands (4 total)
  - Square planar geometry

✨ Oxidation States
- Variable oxidation states in d-block metals
- Fe: +2, +3
- Cu: +1, +2
- Mn: +2, +3, +4, +6, +7
```

---

## Screenshot Guide

### Where to Find Environment Variables

1. **Render Dashboard** → Your Service
2. **Left Sidebar** → Click "Environment"
3. **You'll see:**
   - List of current variables
   - "Add Environment Variable" button
   - Save/Cancel buttons at bottom

### Current Error in Logs
```
❌ AI generation failed: LLM API error: 401 - {"error":{"message":"Invalid API key"}}
📚 Falling back to Smart Lesson Generator
```

### After Fix - Logs Should Show
```
✅ Using AI (Groq) for topic-specific lesson
✅ Generated lesson using AI
Source: Groq AI (llama-3.3-70b-versatile)
```

---

## Troubleshooting

### If Still Shows "Invalid API key"

**Check:**
1. Variable name is exactly: `GROQ_API_KEY` (all caps, no spaces)
2. Value starts with: `gsk_`
3. No extra spaces before/after the key
4. Clicked "Save Changes" button
5. Waited 1 minute for redeploy

**Try:**
- Copy-paste the key again (don't type it)
- Delete the variable and create a new one
- Check if there are multiple GROQ_API_KEY variables (delete duplicates)

### If Redeploy Doesn't Start

1. Click "Manual Deploy" dropdown
2. Select "Deploy latest commit"
3. Wait for deployment to finish

---

## Quick Test Command

After setting environment variables, test immediately:

```bash
# Test health endpoint
curl https://gamified-learning-api-7cmb.onrender.com/health

# Test lesson generation
curl -X POST https://gamified-learning-api-7cmb.onrender.com/api/lessons/generate \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Chemistry",
    "topic": "Inorganic Chemistry",
    "description": "Basics of inorganic compounds",
    "difficulty": "medium"
  }'
```

Should return actual chemistry content, NOT generic templates!

---

## Summary

| Step | Action | Status |
|------|--------|--------|
| 1 | Open Render Dashboard | ⏳ Do now |
| 2 | Click "Environment" | ⏳ Do now |
| 3 | Add GROQ_API_KEY | ⏳ Do now |
| 4 | Add GROQ_MODEL | ⏳ Do now |
| 5 | Click "Save Changes" | ⏳ Do now |
| 6 | Wait 1 minute | ⏳ Wait |
| 7 | Test lesson generation | ⏳ After deploy |

---

**The fix is simple:** Just add the environment variables in Render dashboard!

**Time required:** 2 minutes to add variables + 1 minute for redeploy = **3 minutes total**

---

**Last Updated:** June 28, 2026 5:50 PM  
**Priority:** 🚨 URGENT - Blocking AI features  
**Impact:** HIGH - All lesson generation affected
