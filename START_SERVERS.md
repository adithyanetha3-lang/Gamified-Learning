# 🚀 How to Start Your App

## The Problem You're Facing
You need **TWO terminals** running at the same time:
1. **Backend** (port 3000) - handles question generation
2. **Frontend** (port 5173/5174) - the React app you see in browser

**If backend is not running, topics and questions won't work!**

---

## ✅ Step-by-Step Startup

### Terminal 1: Start Backend

```powershell
cd server
node index.js
```

**You should see:**
```
╔═══════════════════════════════════════╗
║   Skill Park API Server Started      ║
╚═══════════════════════════════════════╝
  Environment: development
  Port: 3000
  LLM Status: ✓ Groq (FREE)
```

✅ **Keep this terminal open!** Don't close it.

---

### Terminal 2: Start Frontend

Open a **NEW terminal** (don't close the first one!):

```powershell
npm run dev
```

**You should see:**
```
VITE v6.4.2  ready in 263 ms

➜  Local:   http://localhost:5174/
➜  Network: http://192.168.1.10:5174/
```

✅ **Keep this terminal open too!**

---

## 🧪 Test Everything Works

1. Open browser: **http://localhost:5174**
2. Go to **Subjects** page
3. Click **Mathematics** subject
4. Click **"➕ Add Topic"**
5. Fill in:
   - Name: "Algebra"
   - Description: "Basic algebra"
   - Difficulty: Medium
6. Click **"Create"**
7. Topic should appear! ✅

Then:
8. Go to **Generate** page
9. Select **Mathematics**
10. Select **Algebra** topic
11. Fill in lesson text
12. Click **"Generate Questions"**
13. Questions should generate in 2-5 seconds! ✅

---

## ❌ Common Issues

### Issue: "Port 3000 already in use"

**Fix:**
```powershell
netstat -ano | findstr :3000
taskkill /F /PID <number you see>
```

Then try starting backend again.

---

### Issue: "Failed to load topics"

**Cause:** Backend is not running!

**Fix:** Make sure Terminal 1 is showing "Server running on port 3000"

---

### Issue: Topics dropdown is empty

**Cause:** No topics created yet!

**Fix:** 
1. Go to Subjects page
2. Select a subject
3. Click "Add Topic"
4. Create a topic first!

---

## 📊 Quick Status Check

### Backend Running? ✓
- Terminal shows "Server running on port 3000"
- Terminal shows "LLM Status: ✓ Groq (FREE)"

### Frontend Running? ✓
- Terminal shows "Local: http://localhost:5174"
- Browser can access http://localhost:5174

### Both Running? ✓
- You can create subjects ✓
- You can create topics ✓  
- You can generate questions ✓
- Everything works! 🎉

---

## 🔄 Restart Everything

If things get messed up:

1. **Stop both terminals**: Press `Ctrl+C` in each
2. **Clear port 3000**:
   ```powershell
   netstat -ano | findstr :3000
   taskkill /F /PID <number>
   ```
3. **Start backend** (Terminal 1):
   ```powershell
   cd server
   node index.js
   ```
4. **Start frontend** (Terminal 2):
   ```powershell
   npm run dev
   ```
5. **Refresh browser**: `Ctrl+Shift+R`

---

## 💡 Remember

- **ALWAYS run backend first** (server folder)
- **Then run frontend** (root folder)
- **Keep BOTH terminals open**
- **Never close terminals while using the app**

---

## 🎯 Your Checklist

Before trying to create topics or generate questions:

- [ ] Terminal 1: Backend running on port 3000
- [ ] Terminal 2: Frontend running on port 5174
- [ ] Browser: Opened to http://localhost:5174
- [ ] Logged in as Teacher
- [ ] At least one subject exists
- [ ] Subject has at least one topic

✅ All checked? You're ready to generate questions!

---

**Need help? Check the console (F12) for error messages!**
