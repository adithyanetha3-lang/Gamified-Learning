# 🚀 Groq Setup Guide - FREE AI for Education

**Get started with Groq in 5 minutes - completely FREE!**

---

## ✅ Why Groq?

- ✅ **100% FREE** - No credit card required
- ✅ **Extremely Fast** - 2-10x faster than competitors
- ✅ **High Quality** - Llama 3.1 70B produces excellent educational content
- ✅ **Generous Limits** - 30 requests/min, 14,400/day
- ✅ **Easy Setup** - 5 minutes total

---

## 📋 Step-by-Step Setup

### Step 1: Get Your Free API Key (2 minutes)

1. **Visit Groq Console**: https://console.groq.com/

2. **Sign Up** (if you don't have an account):
   - Click "Sign Up"
   - Use Google, GitHub, or email
   - **No credit card required!** ✅

3. **Go to API Keys**: https://console.groq.com/keys

4. **Create New Key**:
   - Click "Create API Key"
   - Give it a name (e.g., "Skill Park")
   - Copy the key (starts with `gsk_`)
   - **Save it somewhere safe** - you won't see it again!

---

### Step 2: Add API Key to Project (1 minute)

1. **Open the backend .env file**:
   ```bash
   # Location: server/.env
   # Use any text editor (VS Code, Notepad, etc.)
   ```

2. **Replace the placeholder**:
   ```bash
   # Find this line:
   GROQ_API_KEY=your_groq_api_key_here
   
   # Replace with your actual key:
   GROQ_API_KEY=gsk_your_actual_key_here
   ```

3. **Save the file** (Ctrl+S)

---

### Step 3: Restart Backend (1 minute)

```bash
# If backend is running, stop it (Ctrl+C)

# Then restart:
cd server
npm run dev

# You should see:
# Server running on port 3000
# LLM configured: true
# Provider: Groq
```

---

### Step 4: Verify Setup (1 minute)

#### Check Health Endpoint:
```bash
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "llmConfigured": true,
  "provider": "Groq",
  "model": "llama-3.1-70b-versatile"
}
```

#### Check Provider Info:
```bash
curl http://localhost:3000/api/questions/provider

# Expected response:
{
  "success": true,
  "data": {
    "configured": true,
    "name": "Groq",
    "model": "llama-3.1-70b-versatile"
  }
}
```

---

### Step 5: Test Question Generation! (2 minutes)

1. **Open Frontend**: http://localhost:5173

2. **Login as Teacher**:
   - Email: `teacher@test.com`
   - Password: `Test123!`
   - (Or create new teacher account)

3. **Navigate to "Generate"** page

4. **Fill in the form**:
   - Subject: `Mathematics`
   - Topic: `Algebra Basics`
   - Class Level: `8`
   - Difficulty: `medium`
   - Number of Questions: `5`
   - Lesson Text: `Linear equations with variables`

5. **Click "Generate Questions"**

6. **Watch the magic!** ✨
   - Questions generate in 2-5 seconds
   - High-quality, curriculum-aligned
   - Ready for review and approval

---

## 🎯 Complete .env Configuration

Your `server/.env` should look like this:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# GROQ CONFIGURATION (ACTIVE)
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama-3.1-70b-versatile

# SECURITY
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 🚀 Available Groq Models

### Recommended: `llama-3.1-70b-versatile`
- Best balance of speed and quality
- Excellent for educational content
- **Default choice** ✅

### Fastest: `llama-3.1-8b-instant`
- Extremely fast responses
- Still good quality
- Use if speed is critical

### Alternative: `mixtral-8x7b-32768`
- Good reasoning
- Large context window (32k tokens)
- Use for longer lesson content

To change model, edit `server/.env`:
```bash
GROQ_MODEL=llama-3.1-8b-instant
```

---

## 📊 Rate Limits (All FREE)

- **Per Minute**: 30 requests
- **Per Day**: 14,400 requests
- **Context Window**: 8,000 tokens (Llama), 32,768 tokens (Mixtral)

### What This Means:
- Generate 30 sets of questions per minute
- 14,400 question sets per day
- **More than enough for 100-500 students!**

### If You Hit Rate Limits:
- Wait 1 minute and try again
- Reduce concurrent generations
- Consider caching questions
- Still completely FREE!

---

## ✅ Verification Checklist

```bash
□ Groq account created (free)
□ API key obtained from console.groq.com/keys
□ API key added to server/.env
□ Backend server restarted
□ Health check shows "llmConfigured: true"
□ Provider endpoint shows "Groq"
□ Test questions generated successfully
□ Questions are high quality
□ Generation is fast (2-5 seconds)
```

---

## 🎓 Example Question Quality

### Input:
- Subject: Mathematics
- Topic: Algebra Basics  
- Class: 8
- Difficulty: Medium

### Groq Output (Llama 3.1 70B):
```
Question 1:
"If 3x + 5 = 20, what is the value of x?"
Options:
A) 3
B) 5 ✓ (Correct)
C) 7
D) 10

Question 2:
"Which of the following represents a linear equation?"
Options:
A) y = x² + 3
B) y = 2x + 1 ✓ (Correct)
C) y = 1/x
D) y = √x
```

**Quality**: Excellent! ✅
- Curriculum-aligned
- Age-appropriate
- Clear and unambiguous
- Plausible distractors

---

## 🐛 Troubleshooting

### "LLM not configured" error:

**Check 1**: API key is in `.env`
```bash
cat server/.env | grep GROQ_API_KEY
# Should show your key
```

**Check 2**: Key doesn't have "your_" in it
```bash
# Wrong: GROQ_API_KEY=your_groq_api_key_here
# Right: GROQ_API_KEY=gsk_abc123xyz...
```

**Check 3**: Backend restarted
```bash
cd server
npm run dev
```

---

### "API key invalid" error:

**Solution 1**: Regenerate key
- Go to https://console.groq.com/keys
- Delete old key
- Create new key
- Update `.env`

**Solution 2**: Check for spaces
```bash
# Wrong: GROQ_API_KEY= gsk_abc123...
# Right: GROQ_API_KEY=gsk_abc123...
```

---

### "Rate limit exceeded" error:

**Solution**: Wait 60 seconds
- Groq has 30 requests/minute limit
- Wait 1 minute
- Try again
- Still FREE!

---

### Questions are generic/low quality:

**Solution 1**: Provide better lesson text
```bash
# Bad:  lessonText: "algebra"
# Good: lessonText: "Solving linear equations with one variable using inverse operations. Example: 2x + 5 = 13"
```

**Solution 2**: Use llama-3.1-70b (not 8b)
```bash
GROQ_MODEL=llama-3.1-70b-versatile
```

---

## 💡 Pro Tips

### 1. Provide Detailed Context
The more context you provide, the better the questions:
```bash
Good: "Linear equations, solving for x, using inverse operations"
Better: "Students should understand how to isolate variables using addition/subtraction and multiplication/division"
```

### 2. Batch Generate During Setup
Generate and approve 50-100 questions initially:
- Reduces real-time API calls
- Builds question bank
- Students can start immediately

### 3. Reuse Good Questions
- Save approved questions
- Use them across multiple quizzes
- Reduces API usage

### 4. Cache Common Topics
- Pre-generate for common topics
- Store in question bank
- Serve from database

---

## 🎉 You're All Set!

With Groq configured, you now have:
- ✅ FREE AI-powered question generation
- ✅ Fast generation (2-5 seconds)
- ✅ High-quality educational content
- ✅ Generous usage limits
- ✅ No costs or credit card needed

**Start generating questions now!** 🚀

---

## 📞 Need Help?

### Resources:
- **Groq Documentation**: https://console.groq.com/docs
- **Groq Discord**: https://discord.gg/groq
- **Platform Troubleshooting**: TROUBLESHOOTING.md
- **All LLM Options**: LLM_SETUP_GUIDE.md

### Quick Support:
1. Check `/health` endpoint
2. Review backend logs
3. Verify API key in `.env`
4. Check rate limits
5. Review TROUBLESHOOTING.md

---

## 🔄 Alternative Models

If you want to try other providers later:

### For Best Quality:
→ **Claude 3.5 Sonnet** ($3/1M tokens)
→ See LLM_SETUP_GUIDE.md

### For Multilingual:
→ **Google Gemini** (FREE tier)
→ See LLM_SETUP_GUIDE.md

But **Groq is perfect for most use cases** - free, fast, and high quality!

---

**Setup Time**: 5 minutes  
**Cost**: FREE forever  
**Quality**: Excellent  
**Speed**: 2-5 seconds per generation  

**Ready to go!** 🎓✨

---

**Document Created**: June 8, 2026  
**Version**: 1.0  
**Status**: Production Ready  

