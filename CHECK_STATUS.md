# ⚡ Quick Status Check

Run these checks to diagnose the issue:

## 1. Check Backend Health

Open in browser:
```
http://localhost:3000/health
```

**Expected (Good)**:
```json
{
  "ok": true,
  "llmConfigured": true,
  "llmProvider": "Groq (FREE)"
}
```

**If you see error**: Backend not running!

**Fix**:
```bash
cd server
npm run dev
```

---

## 2. Check LLM Provider

Open in browser:
```
http://localhost:3000/api/questions/provider
```

**Expected (Good)**:
```json
{
  "success": true,
  "data": {
    "configured": true,
    "name": "Groq",
    "model": "llama-3.1-70b-versatile"
  }
}
```

**If configured: false**: API key issue!

---

## 3. Check Browser Console

1. Open generator page
2. Press F12
3. Go to Console tab
4. Look for:
   - ✅ No red errors = Good
   - ❌ "Failed to fetch" = Backend not running
   - ❌ "Network error" = Backend not reachable
   - ❌ "500" error = Backend error

---

## 4. Check Backend Terminal

Look for terminal with backend server.

**Should show**:
```
Server running on port 3000
LLM Status: ✓ Groq (FREE)
```

**If not running**: Start it!
```bash
cd server
npm run dev
```

---

## 5. Test Question Generation

1. Go to generator page
2. Fill form:
   - Subject: Test
   - Topic: Testing
   - Class: 5
   - Difficulty: Easy
   - Count: 3
   - Lesson: Test lesson
3. Click "Generate"
4. Watch what happens

**Expected**:
- Loading indicator
- Questions appear after 2-5 seconds
- 3 different questions

**If shows "sample questions"**:
- Backend not running OR
- Backend can't reach Groq

---

## Quick Fixes

### Backend Not Running
```bash
cd server
npm run dev
```

### Port 3000 in Use
```bash
# Kill process on port 3000
taskkill /F /IM node.exe

# Restart
cd server
npm run dev
```

### React Warning (Harmless)
Already fixed in code. Just refresh:
```
Ctrl + Shift + R
```

---

## What Each Error Means

### "Failed to fetch"
= Backend server not running
**Fix**: Start backend (`cd server && npm run dev`)

### "Live LLM service unavailable"
= Backend running but can't reach Groq
**Fix**: Check API key in `server/.env`

### "Network error"
= Can't reach backend
**Fix**: Check backend is on port 3000

### Questions all the same
= Old code cached
**Fix**: Restart backend, refresh frontend

---

## Complete Checklist

```
□ Backend running? (http://localhost:3000/health)
□ LLM configured? (http://localhost:3000/api/questions/provider)
□ Frontend loaded? (http://localhost:5173)
□ No console errors? (F12 → Console)
□ Can generate questions?
□ Questions are diverse?
```

If ALL checked ✅ = Everything working!

---

**Next**: Tell me what you see at http://localhost:3000/health
