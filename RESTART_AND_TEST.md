# 🔄 Restart and Test Instructions

## ⚠️ Issue: Changes Not Taking Effect

**Problem**: You modified code but server is still using old code  
**Solution**: Restart the backend server  
**Time**: 1 minute  

---

## 🚀 Step-by-Step Restart

### Step 1: Stop Backend Server

1. **Find the terminal** running the backend
   - Look for terminal showing "Server running on port 3000"

2. **Stop it**:
   - Press **Ctrl+C** in that terminal
   - Wait for it to fully stop

### Step 2: Restart Backend Server

In the same terminal:

```bash
cd server
npm run dev
```

**Expected output**:
```
╔═══════════════════════════════════════╗
║   Skill Park API Server Started      ║
╚═══════════════════════════════════════╝
  Environment: development
  Port: 3000
  LLM Status: ✓ Groq (FREE)
  Time: [current time]
```

✅ **Backend is ready!**

---

## 🧪 Step 3: Test Question Generation

### A. Refresh Frontend

1. Go to: http://localhost:5174/generator
2. Hard refresh: **Ctrl+Shift+R**

### B. Generate Questions

Fill in the form:

```
Subject: Science
Topic: Safe Drinking Water  
Class: 5
Difficulty: Medium
Count: 5

Lesson Text:
Water must be clean and safe for drinking. 
Students should understand:
1. Sources of water contamination
2. Methods to purify water (boiling, filtering)
3. Storage of clean water
4. Identifying unsafe water
5. Importance of clean water for health
```

### C. Click "Generate Questions"

Wait 2-5 seconds...

### D. Check Console Logs

**Backend terminal** should show:
```
=== LLM Generation Request ===
Provider: Groq
Model: llama-3.1-70b-versatile
Subject: Science
Topic: Safe Drinking Water
Count: 5
Difficulty: Medium
Prompt length: XXXX characters
Sending request to Groq...
Response received from Groq
Content length: XXXX characters
Parsed 5 questions
=== Generation Complete ===
```

✅ If you see this, it's working!

---

## ✅ Expected Results

### Questions Should Be:

**Question 1** (Definition - Remember):
```
"What is contaminated water?"
Options about water contamination
```

**Question 2** (Process - Understand):
```
"Why is boiling water important for safety?"
Options explaining boiling process
```

**Question 3** (Application - Apply):
```
"How would you make river water safe to drink?"
Options with different purification methods
```

**Question 4** (Comparison - Analyze):
```
"Compare boiling vs filtering. Which removes more bacteria?"
Options comparing methods
```

**Question 5** (Problem-solving - Evaluate):
```
"A village has no clean water source. What is the best solution?"
Options with practical solutions
```

### Key Features:
- ✅ Each question is DIFFERENT
- ✅ Different question formats (What, Why, How, Compare)
- ✅ Different cognitive levels (Remember, Understand, Apply, Analyze, Evaluate)
- ✅ Different aspects of topic (contamination, purification, storage, safety, health)
- ✅ NO repetition

---

## 🐛 Troubleshooting

### Issue: Backend won't stop

**Solution**:
```bash
# Windows - Force kill Node processes
taskkill /F /IM node.exe

# Then restart
cd server
npm run dev
```

### Issue: "Port 3000 in use"

**Solution**:
```bash
# Find and kill process on port 3000
netstat -ano | findstr :3000
# Note the PID (last number)
taskkill /F /PID [PID_NUMBER]

# Then restart
npm run dev
```

### Issue: Still getting similar questions

**Check**:
1. ✅ Backend restarted?
2. ✅ Frontend refreshed (Ctrl+Shift+R)?
3. ✅ Using good lesson text with multiple points?
4. ✅ Backend terminal shows new logs?

**If still not working**:
- Check backend terminal for errors
- Check browser console (F12) for errors
- Try generating only 3 questions first
- Make sure Groq API key is valid

### Issue: "Mock questions" instead of Groq

**Cause**: Backend can't reach Groq API

**Check**:
1. Internet connection working?
2. Groq API key in `server/.env`?
3. Backend terminal shows "LLM Status: ✓ Groq"?

**Test API key**:
```bash
cd server
node -e "console.log('API Key:', process.env.GROQ_API_KEY ? 'Found' : 'Missing')"
```

### Issue: Questions fail to generate

**Check browser console** (F12):
- Look for red errors
- Look for "Failed to fetch" or network errors

**Check backend logs**:
- Look for error messages
- Look for "LLM Generation Failed"
- Check the error details

---

## 📊 Success Checklist

After restart and test:

```
□ Backend stopped (Ctrl+C)
□ Backend restarted (npm run dev)
□ Saw "Server running" message
□ Saw "LLM Status: ✓ Groq"
□ Frontend refreshed (Ctrl+Shift+R)
□ Generated 5 questions
□ Saw detailed logs in backend terminal
□ Questions are diverse and unique
□ No two questions are similar
□ Different question formats used
□ Success! ✅
```

---

## 💡 Pro Tips

### 1. Always Restart After Code Changes
- Backend caches code
- Changes don't apply until restart
- Use `npm run dev` (has auto-restart in some setups)

### 2. Check Both Terminals
- **Terminal 1**: Backend logs (port 3000)
- **Terminal 2**: Frontend dev server (port 5174)
- Watch for errors in both

### 3. Use Browser Dev Tools
- Press **F12**
- Go to **Console** tab
- Watch for errors or warnings
- Check **Network** tab for API calls

### 4. Write Better Lesson Text
**Bad**:
```
Topic: Water
Lesson: Learn about water
```

**Good**:
```
Topic: Safe Drinking Water
Lesson: Students should understand:
1. Sources of contamination (bacteria, chemicals, dirt)
2. Purification methods (boiling, filtering, chlorination)
3. Proper storage (covered containers, clean places)
4. Health risks of dirty water
5. Community water safety practices
```

Better lesson text = Better question variety!

---

## 🎯 Quick Restart Commands

```bash
# Stop backend (Ctrl+C in backend terminal)

# Restart backend
cd server
npm run dev

# Refresh frontend (in browser)
# Press Ctrl+Shift+R
```

**That's it!** ✅

---

## 📞 Still Having Issues?

### Check These:
1. **Backend terminal** - Any errors?
2. **Browser console** (F12) - Any errors?
3. **API key** - Valid and in `.env`?
4. **Internet** - Connected?
5. **Ports** - 3000 and 5174 available?

### Collect This Info:
1. Backend terminal output (copy all text)
2. Browser console errors (screenshot)
3. Example of generated questions
4. What you expected vs what you got

---

**Remember**: Always restart backend after code changes! 🔄

**Time to restart**: 30 seconds  
**Time to test**: 1 minute  
**Expected result**: Diverse, unique questions! 🎉
