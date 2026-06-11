# ⚡ Quick Start Guide - Skill Park Platform

**Get up and running in 5 minutes!**

---

## 🎯 What You'll Need

- Node.js 20+ installed
- Firebase account (free tier is fine)
- OpenAI API key (optional for testing)
- 5 minutes

---

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 minute)

```bash
# In project root
npm install

# In server directory
cd server
npm install
cd ..
```

### Step 2: Configure Firebase (2 minutes)

```bash
# 1. Go to https://console.firebase.google.com
# 2. Create new project (or use existing)
# 3. Enable Authentication → Email/Password
# 4. Create Firestore Database (production mode)
# 5. Copy your Firebase config
```

### Step 3: Create Environment Files (1 minute)

#### Frontend (.env):
```bash
# Copy and edit
cp .env.example .env
```

Edit `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_API_URL=http://localhost:3000
```

#### Backend (server/.env):
```bash
# Copy and edit
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=sk-your-key-here
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o-mini
ALLOWED_ORIGINS=http://localhost:5173
```

**Note**: Without OpenAI key, the app will use mock data for question generation.

### Step 4: Start Development Servers (1 minute)

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
npm run dev
```

You should see:
```
Frontend: http://localhost:5173
Backend:  http://localhost:3000
```

---

## 🧪 Test It Works (5 minutes)

### Backend Health Check:
```bash
# Open in browser or curl:
http://localhost:3000/health

# Should return:
{
  "status": "healthy",
  "llmConfigured": true,  # or false if no OpenAI key
  "uptime": 123
}
```

### Test Teacher Flow:

1. **Open Frontend**: http://localhost:5173
2. **Sign Up as Teacher**:
   - Click "Sign Up"
   - Email: `teacher@test.com`
   - Password: `Test123!`
   - Name: `Test Teacher`
   - Role: Select "Teacher"
   - Click "Sign Up"

3. **Create a Subject**:
   - Click "Subjects" from dashboard
   - Click "Create Subject"
   - Name: `Mathematics`
   - Description: `Basic math concepts`
   - Click "Create"

4. **Add a Topic**:
   - In Mathematics subject, click "Add Topic"
   - Name: `Algebra Basics`
   - Description: `Introduction to algebra`
   - Click "Add Topic"

5. **Generate Questions**:
   - Click "Generate" from menu
   - Select Subject: `Mathematics`
   - Select Topic: `Algebra Basics`
   - Class: `8`
   - Difficulty: `medium`
   - Number of questions: `5`
   - Lesson text: `Basic algebraic equations with variables`
   - Click "Generate Questions"
   - Wait 10-30 seconds

6. **Approve & Publish**:
   - Review generated questions
   - Click "Approve" on each
   - Click "Publish Selected"
   - Go to "Question Bank" to verify

### Test Student Flow:

1. **Open Incognito/Private Window**: http://localhost:5173
2. **Sign Up as Student**:
   - Email: `student@test.com`
   - Password: `Test123!`
   - Name: `Test Student`
   - Role: Select "Student"

3. **Take a Quiz**:
   - Click "Courses" from dashboard
   - Click "Mathematics"
   - Click "Algebra Basics"
   - Click "Start Quiz"
   - Answer the questions
   - Click "Submit Quiz"

4. **Check Progress**:
   - View XP earned
   - Click "Progress" from menu
   - See level and XP bar
   - Click "Leaderboard"
   - See your ranking

**✅ If all of the above works, your setup is complete!**

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
```bash
# Check backend is running:
curl http://localhost:3000/health

# If not running:
cd server
npm run dev
```

### "Firebase: Error (auth/...)"
```bash
# Check .env file has correct Firebase credentials
# Check Firebase Authentication is enabled
# Check Email/Password provider is enabled
```

### "Questions not generating"
```bash
# Without OpenAI key: App uses mock data (this is OK for testing)
# With OpenAI key: Check key is valid
# Check backend logs for errors
```

### "Cannot read subjects/questions"
```bash
# This is normal on first run - database is empty
# Create subjects and topics as teacher first
# Then generate and publish questions
```

### Port already in use
```bash
# Frontend (5173):
# Kill existing process or change port in vite.config.js

# Backend (3000):
# Change PORT in server/.env
```

---

## 📁 Project Structure (Where Everything Is)

```
gamified-learning/
├── src/                    Frontend source
│   ├── pages/             All page components
│   ├── services/          Firestore & API services
│   ├── components/        Reusable UI components
│   └── routes/            Routing configuration
├── server/                Backend source
│   ├── routes/            API endpoints
│   ├── services/          LLM integration
│   └── middleware/        Security & logging
├── .env                   Frontend config
└── server/.env            Backend config
```

---

## 🎓 User Accounts for Testing

### Create These Test Accounts:

**Teachers**:
```
teacher1@test.com / Test123!
teacher2@test.com / Test123!
```

**Students**:
```
student1@test.com / Test123!
student2@test.com / Test123!
student3@test.com / Test123!
```

**Why multiple students?** To see leaderboard rankings!

---

## 🔥 Quick Demo Script

### For showing the platform to others:

**Part 1: Teacher (5 min)**
```
1. Login as teacher
2. Dashboard shows: 0 students, 0 subjects
3. Create subject "Science"
4. Add topic "Physics - Motion"
5. Generate 5 questions
6. Approve and publish
7. Show question bank
```

**Part 2: Student (3 min)**
```
1. Login as student (different browser/incognito)
2. Dashboard shows Level 1, 0 XP
3. Browse subjects → Science
4. Start "Physics - Motion" quiz
5. Answer questions (click any answers)
6. Submit quiz
7. See XP earned (e.g., +100 XP)
8. Check progress page
9. Check leaderboard
```

**Part 3: Teacher Analytics (2 min)**
```
1. Back to teacher account
2. Dashboard now shows: 1 student
3. Go to Analytics
4. See student performance
5. See quiz completion stats
```

---

## 💡 Tips for Best Experience

### Development:
- Use **Chrome DevTools** to test mobile responsiveness
- Keep **both terminals** (frontend + backend) open
- Check **browser console** for errors
- Use **React DevTools** extension for debugging

### Testing:
- Use **incognito windows** for multiple accounts
- Test on **mobile viewport** (375px width)
- Test **slow 3G** network simulation
- Try **offline mode** (Firestore has offline cache)

### Production:
- See `DEPLOYMENT.md` for deployment guide
- See `PRE_LAUNCH_CHECKLIST.md` before going live
- See `FINAL_STATUS.md` for complete status

---

## 📚 Next Steps

### After Quick Start:

1. **Read Documentation**:
   - `README.md` - Project overview
   - `IMPLEMENTATION_COMPLETE.md` - Feature status
   - `DEPLOYMENT.md` - Deployment guide
   - `FINAL_STATUS.md` - Complete status report

2. **Customize**:
   - Update branding in components
   - Modify dashboard cards
   - Add more subjects
   - Customize XP values

3. **Deploy**:
   - Follow `PRE_LAUNCH_CHECKLIST.md`
   - Deploy Firestore security rules
   - Deploy to production
   - Test with real users

---

## 🎯 Success Checklist

After following this guide, you should have:

```
✓ Frontend running on http://localhost:5173
✓ Backend running on http://localhost:3000
✓ Created teacher account
✓ Created student account
✓ Generated questions with AI
✓ Published questions
✓ Taken quiz as student
✓ Earned XP and leveled up
✓ Seen leaderboard update
✓ Verified progress tracking
```

**All checked?** 🎉 **You're ready to customize and deploy!**

---

## 🆘 Need Help?

### Check These Resources:

1. **Backend not responding**: Check `server/.env` file exists
2. **Firebase errors**: Verify credentials in `.env` file
3. **Questions not appearing**: Make sure you published them as teacher
4. **Leaderboard empty**: Create multiple student accounts and take quizzes
5. **Build errors**: Run `npm install` in both root and `server/` directories

### Common Commands:

```bash
# Restart everything
# Close both terminals (Ctrl+C)
npm run dev              # Terminal 1
cd server && npm run dev # Terminal 2

# Clear node_modules (if issues)
rm -rf node_modules package-lock.json
npm install

# Check for errors
npm run build           # Should complete successfully

# View logs
# Backend logs show in Terminal 2
# Frontend errors show in browser console (F12)
```

---

## 🚀 Ready to Go Further?

### Explore Advanced Features:

- **Multi-language**: Add Telugu/Hindi translations
- **Analytics**: Deep dive into student performance
- **Gamification**: Customize badges and achievements
- **Mobile App**: Convert to Progressive Web App (PWA)
- **Bulk Import**: Add CSV import for questions
- **Video Lessons**: Integrate video content

### See Full Documentation:

- Architecture details in `IMPLEMENTATION_COMPLETE.md`
- Performance metrics in `OPTIMIZATION_REPORT.md`
- Security info in `DEBUG_REPORT.md`

---

**Time to Complete**: 5-10 minutes  
**Difficulty**: Easy  
**Result**: Fully functional local development environment  

**Happy coding! 🎓✨**

---

**Last Updated**: June 8, 2026  
**Version**: 2.0.0  
**Status**: Ready to use  

