# 🔧 Question Generation Troubleshooting

## Problem: Questions Not Generating or Low Quality

You're seeing either:
1. Mock/sample questions like "Sample question 1"
2. Error "Failed to generate questions"
3. Questions generated but not diverse/unique

---

## ✅ Solution Checklist

### Step 1: Check Backend is Running

**The #1 most common issue is the backend not running!**

Open your terminal where you started the backend and check if you see:
```
╔═══════════════════════════════════════╗
║   Skill Park API Server Started      ║
╚═══════════════════════════════════════╝
  Environment: development
  Port: 3000
  LLM Status: ✓ Groq (FREE)
```

**If you DON'T see this:**

1. Stop any running terminals (Ctrl+C)
2. Kill port 3000:
   ```powershell
   netstat -ano | findstr :3000
   taskkill /F /PID <number you see>
   ```
3. Start backend:
   ```powershell
   cd server
   node index.js
   ```

**KEEP THIS TERMINAL OPEN!**

---

### Step 2: Test Backend Connection

Open browser to: **http://localhost:3000/health**

You should see:
```json
{
  "ok": true,
  "service": "skill-park-api",
  "llmConfigured": true,
  "llmProvider": "Groq (FREE)"
}
```

**If you see an error:**
- Backend is not running → Go to Step 1
- Can't connect → Check firewall settings

---

### Step 3: Verify Groq API Key

Check `server/.env` file:
```bash
GROQ_API_KEY=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
```

**Key should:**
- ✅ Start with `gsk_`
- ✅ Be a long string (48+ characters)
- ❌ NOT be `your_groq_api_key_here`

**If key is wrong:**
1. Get a new key: https://console.groq.com/keys
2. Replace in `server/.env`
3. Restart backend

---

### Step 4: Test API Directly

Use this command to test the backend directly:

```powershell
curl -X POST http://localhost:3000/api/questions/generate -H "Content-Type: application/json" -d "{\"subject\":\"Mathematics\",\"topic\":\"Algebra\",\"classLevel\":\"Grade 8\",\"difficulty\":\"medium\",\"count\":5,\"lessonText\":\"Basic algebra concepts\"}"
```

**Expected result:**
- Should see JSON with generated questions
- Should take 2-10 seconds
- Questions should be unique and diverse

**If you see an error:**
- "Connection refused" → Backend not running
- "Invalid request" → Check JSON format
- "Rate limit" → Wait a minute and try again

---

### Step 5: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try generating questions
4. Look for `/api/questions/generate` request

**Check the response:**
- **Status 200** = Success ✅
- **Status 500** = Backend error ❌
- **Status 0** or **Failed** = Backend not running ❌

Click on the request to see details:
- **Request** tab: Shows what frontend sent
- **Response** tab: Shows what backend returned
- **Headers** tab: Shows if request reached backend

---

## 🐛 Common Issues & Fixes

### Issue 1: Mock Questions Appear

**Symptoms:**
- Questions like "Sample question 1 for Basic Maths"
- Generic answers "First possible answer", "Second possible answer"

**Cause:** Frontend is using fallback mock data because:
1. Backend not running
2. API call failing
3. Groq API not responding

**Fix:**
1. Check backend is running (Step 1)
2. Check Network tab in DevTools (Step 5)
3. Look at backend terminal for errors

---

### Issue 2: "Failed to generate questions"

**Symptoms:**
- Error popup immediately
- No questions appear
- Console shows network error

**Cause:** Frontend cannot reach backend

**Fix:**
1. Verify backend running on port 3000
2. Check http://localhost:3000/health works
3. Check CORS settings in `server/.env`:
   ```
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
   ```
4. Restart both frontend and backend

---

### Issue 3: Questions Not Diverse

**Symptoms:**
- All questions very similar
- Same question format repeated
- Generic questions

**Cause:** 
1. Using mock data (not real AI)
2. Groq API call failing silently
3. Empty lesson text

**Fix:**
1. Verify real AI is being used (check backend logs)
2. Add detailed lesson text when generating
3. Increase temperature in backend (already set to 0.8)
4. Check backend logs for "Groq" mentions

---

### Issue 4: Backend Starts Then Crashes

**Symptoms:**
- Backend starts but immediately exits
- "Port already in use" error
- Server stops after a few seconds

**Fix:**
1. Kill all processes on port 3000:
   ```powershell
   netstat -ano | findstr :3000
   taskkill /F /PID <each PID shown>
   ```
2. Start fresh:
   ```powershell
   cd server
   node index.js
   ```
3. If still fails, reboot computer

---

### Issue 5: Groq API Errors

**Symptoms:**
- Backend logs show "Groq error"
- "Rate limit exceeded"
- "Invalid API key"

**Fix:**

**Rate Limit:**
- Wait 1 minute
- Groq has 30 requests/minute limit
- Try again

**Invalid Key:**
- Get new key: https://console.groq.com/keys
- Update `server/.env`
- Restart backend

**Network Error:**
- Check internet connection
- Try again in a few minutes
- Groq might be temporarily down

---

## 📊 Verify Everything Works

### Complete Test:

1. **Backend Test:**
   ```powershell
   cd server
   node index.js
   ```
   ✅ Should show "LLM Status: ✓ Groq (FREE)"

2. **Health Check:**
   - Open: http://localhost:3000/health
   - ✅ Should show `llmConfigured: true`

3. **Frontend Test:**
   - Open: http://localhost:5174
   - Login as Teacher
   - Go to Generate page
   - Fill in form
   - Click "Generate Questions"
   - ✅ Should see unique, diverse questions in 2-10 seconds

4. **Quality Check:**
   - Questions should be different from each other
   - Questions should be relevant to topic
   - Questions should have correct difficulty level
   - Options should make sense
   - One correct answer marked

---

## 🔍 Debug Mode

### Enable Detailed Logging:

1. In backend terminal, watch for logs when generating:
   ```
   === LLM Generation Request ===
   Provider: Groq
   Model: llama-3.1-70b-versatile
   Subject: Mathematics
   Topic: Algebra
   Count: 5
   Difficulty: medium
   Prompt length: 1234 characters
   Sending request to Groq...
   Response received from Groq
   Content length: 5678 characters
   Parsed 5 questions
   === Generation Complete ===
   ```

2. If you see "Falling back to mock data" → Real API call failed

3. Check the error message above that line

---

## 🎯 Expected Behavior

### When Working Correctly:

1. **Click "Generate Questions"**
2. **Button shows "Generating..."** (2-10 seconds)
3. **Questions appear** on the right side
4. **Questions are:**
   - ✅ Unique and diverse
   - ✅ Relevant to topic
   - ✅ Proper difficulty
   - ✅ 4 options each
   - ✅ One correct answer
   - ✅ Good explanations

---

## 🆘 Still Not Working?

### Last Resort Fixes:

1. **Full Restart:**
   ```powershell
   # Stop all terminals (Ctrl+C in each)
   # Close VS Code
   # Reopen VS Code
   # Start backend: cd server && node index.js
   # Start frontend: npm run dev
   ```

2. **Clear Everything:**
   ```powershell
   # Clear node modules
   cd server
   rmdir /s /q node_modules
   npm install
   
   cd..
   rmdir /s /q node_modules
   npm install
   ```

3. **Check Firewall:**
   - Windows Firewall might be blocking port 3000
   - Add exception for Node.js

4. **Use Different API:**
   - Get OpenAI key: https://platform.openai.com/api-keys
   - Or Anthropic key: https://console.anthropic.com
   - Add to `server/.env`:
     ```
     OPENAI_API_KEY=your_key_here
     ```
   - Restart backend

---

## 📞 Getting Help

### Information to Provide:

1. **Backend terminal output** (copy the whole thing)
2. **Browser console errors** (F12 → Console tab)
3. **Network tab** (F12 → Network → screenshot of failed request)
4. **What you tried** from this guide
5. **Operating System** (Windows/Mac/Linux)

---

**Most issues are solved by ensuring the backend is running and accessible on port 3000!**

Run these two commands in separate terminals:
```powershell
# Terminal 1
cd server
node index.js

# Terminal 2
npm run dev
```

Keep BOTH running while using the app! ��
