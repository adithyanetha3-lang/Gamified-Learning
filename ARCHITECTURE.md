# 🏗️ Architecture Overview - Skill Park Platform

**Visual guide to understanding the system**

---

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER LAYER                          │
├──────────────────────┬──────────────────────────────────────┤
│  Students            │  Teachers                            │
│  - Browse subjects   │  - Create subjects                   │
│  - Take quizzes      │  - Generate questions (AI)           │
│  - Earn XP           │  - Manage content                    │
│  - Track progress    │  - View analytics                    │
└──────────────────────┴──────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
├─────────────────────────────────────────────────────────────┤
│  Pages (16)          Services (7)        Components (18)    │
│  - Home              - Firestore         - AppShell         │
│  - Courses           - Quiz              - PageHeader       │
│  - Quiz              - Progress          - OptionCard       │
│  - Leaderboard       - Subject           - etc.             │
│  - Progress          - Topic                                │
│  - Teacher           - Question                             │
│  - etc.              - Leaderboard                          │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (REST)                         │
├─────────────────────────────────────────────────────────────┤
│  Backend Server (Express)                                   │
│  - Question Generation API                                  │
│  - Rate limiting (100 req/min)                              │
│  - Security headers                                         │
│  - Error handling                                           │
└─────────────────────────────────────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  Firebase Services       │    │  OpenAI API              │
├──────────────────────────┤    ├──────────────────────────┤
│  - Authentication        │    │  - gpt-4o-mini           │
│  - Firestore Database    │    │  - Question generation   │
│  - Real-time sync        │    │  - Prompt engineering    │
│  - Offline cache         │    └──────────────────────────┘
└──────────────────────────┘
```

---

## 📊 Data Flow

### Student Quiz Flow
```
Student                Frontend              Firestore           Services
  │                       │                     │                  │
  │ 1. Click "Start Quiz"│                     │                  │
  ├──────────────────────►│                     │                  │
  │                       │ 2. Get questions    │                  │
  │                       ├────────────────────►│                  │
  │                       │◄────────────────────┤                  │
  │                       │    (published only) │                  │
  │◄──────────────────────┤                     │                  │
  │   3. Display quiz     │                     │                  │
  │                       │                     │                  │
  │ 4. Submit answers     │                     │                  │
  ├──────────────────────►│                     │                  │
  │                       │ 5. Save attempt     │                  │
  │                       ├────────────────────►│                  │
  │                       │                     │                  │
  │                       │ 6. Calculate XP     │                  │
  │                       ├────────────────────────────────────────►│
  │                       │◄────────────────────────────────────────┤
  │                       │      (score, XP, level)                │
  │                       │                     │                  │
  │                       │ 7. Update progress  │                  │
  │                       ├────────────────────►│                  │
  │                       │                     │                  │
  │                       │ 8. Update leaderboard                  │
  │                       ├────────────────────►│                  │
  │◄──────────────────────┤                     │                  │
  │   9. Show results     │                     │                  │
```

### Teacher Question Generation Flow
```
Teacher               Frontend              Backend             OpenAI API        Firestore
  │                      │                     │                    │               │
  │ 1. Fill form         │                     │                    │               │
  │ (subject, topic...)  │                     │                    │               │
  ├─────────────────────►│                     │                    │               │
  │                      │                     │                    │               │
  │                      │ 2. Generate request │                    │               │
  │                      ├────────────────────►│                    │               │
  │                      │                     │                    │               │
  │                      │                     │ 3. Send prompt     │               │
  │                      │                     ├───────────────────►│               │
  │                      │                     │                    │               │
  │                      │                     │◄───────────────────┤               │
  │                      │                     │  4. Questions JSON │               │
  │                      │                     │                    │               │
  │                      │◄────────────────────┤                    │               │
  │◄─────────────────────┤ 5. Return questions│                    │               │
  │  6. Review UI        │                     │                    │               │
  │                      │                     │                    │               │
  │ 7. Approve           │                     │                    │               │
  ├─────────────────────►│                     │                    │               │
  │                      │ 8. Save to Firestore                    │               │
  │                      ├─────────────────────────────────────────────────────────►│
  │◄─────────────────────┤ 9. Confirmation    │                    │               │
  │  "Questions published"                     │                    │               │
```

---

## 🗄️ Database Schema (Firestore)

### Collections:

#### 1. users
```javascript
{
  uid: "user123",
  email: "student@example.com",
  name: "John Doe",
  role: "student", // or "teacher"
  createdAt: timestamp,
  lastLoginAt: timestamp
}
```

#### 2. subjects
```javascript
{
  id: "subj123",
  name: "Mathematics",
  description: "All math topics",
  createdBy: "teacherUid",
  createdAt: timestamp,
  topicCount: 5,
  questionCount: 50
}
```

#### 3. topics
```javascript
{
  id: "topic123",
  subjectId: "subj123",
  name: "Algebra Basics",
  description: "Introduction to algebra",
  createdBy: "teacherUid",
  createdAt: timestamp,
  questionCount: 10,
  published: true
}
```

#### 4. questions
```javascript
{
  id: "q123",
  subjectId: "subj123",
  topicId: "topic123",
  question: "What is 2 + 2?",
  options: ["2", "3", "4", "5"],
  correctAnswer: 2, // index
  difficulty: "easy",
  status: "published", // or "draft"
  createdBy: "teacherUid",
  createdAt: timestamp,
  aiGenerated: true
}
```

#### 5. quizAttempts
```javascript
{
  id: "attempt123",
  userId: "user123",
  topicId: "topic123",
  subjectId: "subj123",
  answers: [0, 2, 1, 3, 2], // indices
  score: 80, // percentage
  correctCount: 4,
  totalQuestions: 5,
  xpEarned: 150,
  completedAt: timestamp
}
```

#### 6. progress
```javascript
{
  userId: "user123",
  xp: 1500,
  level: 2,
  streak: 5,
  totalQuizzes: 10,
  badges: ["first_quiz", "perfect_score"],
  subjects: {
    "subj123": {
      quizzesCompleted: 5,
      averageScore: 85
    }
  },
  lastActivityAt: timestamp
}
```

#### 7. leaderboard (auto-computed)
```javascript
{
  userId: "user123",
  userName: "John Doe",
  xp: 1500,
  level: 2,
  rank: 1,
  quizzesCompleted: 10,
  averageScore: 85,
  updatedAt: timestamp
}
```

---

## 🔄 Service Layer Architecture

### Frontend Services:

```
firestoreService.js (Base)
├── Core CRUD operations
├── Real-time listeners
├── Batch operations
├── Error handling
├── Retry logic
└── Used by all other services
        │
        ├── subjectService.js
        │   ├── getSubjects()
        │   ├── createSubject()
        │   ├── updateSubject()
        │   └── deleteSubject()
        │
        ├── topicService.js
        │   ├── getTopics(subjectId)
        │   ├── createTopic()
        │   └── updateTopic()
        │
        ├── questionService.js
        │   ├── getQuestions(filters)
        │   ├── createQuestion()
        │   ├── approveQuestion()
        │   └── publishQuestions()
        │
        ├── quizService.js
        │   ├── getQuiz(topicId)
        │   ├── submitQuiz()
        │   ├── getUserQuizStats()
        │   └── calculateScore()
        │
        ├── progressService.js
        │   ├── getUserProgress()
        │   ├── updateXP()
        │   ├── checkLevelUp()
        │   ├── awardBadge()
        │   └── updateStreak()
        │
        └── leaderboardService.js
            ├── getLeaderboard()
            ├── getUserRank()
            └── subscribeToLeaderboard()
```

---

## 🔐 Security Architecture

### Authentication Flow:
```
User
  │
  │ 1. Sign up / Login
  ▼
Firebase Auth
  │
  │ 2. Returns ID token
  ▼
Frontend
  │
  │ 3. Store in AuthContext
  │ 4. Include in all requests
  ▼
Protected Routes
  │
  │ 5. Check auth state
  │ 6. Check user role
  ▼
Component Renders
```

### Security Layers:
```
┌────────────────────────────────────────┐
│  Layer 1: Firebase Authentication      │
│  - Email/password verification         │
│  - Token-based authentication          │
└────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│  Layer 2: Frontend Route Protection    │
│  - RoleRoute component                 │
│  - Redirect unauthorized users         │
└────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│  Layer 3: Firestore Security Rules     │
│  - Collection-level permissions        │
│  - User-based read/write rules         │
│  - Role-based access control           │
└────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│  Layer 4: Backend API Security         │
│  - Rate limiting (100 req/min)         │
│  - Input sanitization                  │
│  - Security headers                    │
│  - CORS whitelist                      │
└────────────────────────────────────────┘
```

---

## ⚡ Performance Optimization

### Build Optimization:
```
Source Code (src/)
        │
        │ Vite Build Process
        ▼
┌──────────────────────────────────┐
│  Code Splitting                  │
│  - Vendor chunks (React, etc.)   │
│  - Route-based chunks            │
│  - Page-specific chunks          │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│  Tree Shaking                    │
│  - Remove unused code            │
│  - Dead code elimination         │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│  Minification                    │
│  - Compress JavaScript           │
│  - Compress CSS                  │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│  Production Bundle               │
│  - react-vendor: 181KB (60KB gz) │
│  - firebase: 477KB (112KB gz)    │
│  - animation: 127KB (42KB gz)    │
│  - main: 34KB (11KB gz)          │
│  Total: 830KB (225KB gz)         │
└──────────────────────────────────┘
```

### Runtime Optimization:
```
User Request
     │
     ▼
┌──────────────────────┐
│  Lazy Loading        │
│  - Load route code   │
│  - on-demand only    │
└──────────────────────┘
     │
     ▼
┌──────────────────────┐
│  React Suspense      │
│  - Show loading      │
│  - While loading     │
└──────────────────────┘
     │
     ▼
┌──────────────────────┐
│  Firestore Cache     │
│  - Offline first     │
│  - Sync when online  │
└──────────────────────┘
     │
     ▼
┌──────────────────────┐
│  Component Render    │
│  - Optimized         │
│  - Memoization       │
└──────────────────────┘
```

---

## 🚀 Deployment Architecture

### Docker Container Structure:
```
┌─────────────────────────────────────────────┐
│  Docker Container (skill-park:latest)       │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────┐     │
│  │  Nginx (Port 80)                  │     │
│  │  - Serve static files             │     │
│  │  - Proxy API requests             │     │
│  └───────────────────────────────────┘     │
│                │                            │
│                ├─── /      → Frontend       │
│                └─── /api/* → Backend        │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │  Frontend (Static Files)          │     │
│  │  - dist/index.html                │     │
│  │  - dist/assets/*.js               │     │
│  │  - dist/assets/*.css              │     │
│  └───────────────────────────────────┘     │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │  Backend (Node.js/Express)        │     │
│  │  - Port 3000                      │     │
│  │  - API endpoints                  │     │
│  │  - OpenAI integration             │     │
│  └───────────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  Firebase       │    │  OpenAI API     │
│  - Auth         │    │  - Generation   │
│  - Firestore    │    └─────────────────┘
└─────────────────┘
```

### Cloud Deployment Options:
```
Option 1: Separate Services
├── Frontend → Vercel/Netlify/Firebase Hosting
└── Backend → Render/Heroku/Railway

Option 2: Docker Compose
├── Single VPS (DigitalOcean, Linode, etc.)
└── docker-compose up -d

Option 3: Container Orchestration
├── AWS Elastic Beanstalk
├── Google Cloud Run
└── Azure Container Instances
```

---

## 🔄 Real-time Data Sync

### Firestore Real-time Architecture:
```
Firestore Database
        │
        │ WebSocket Connection
        │
        ▼
Frontend Service Layer
        │
        ├── subscribeToLeaderboard()
        │   │
        │   └── Updates every time someone completes quiz
        │
        ├── subscribeToProgress()
        │   │
        │   └── Updates when XP/level changes
        │
        └── subscribeToQuestions()
            │
            └── Updates when teacher publishes new questions

Result: Live updates without page refresh
```

---

## 📦 Module Dependencies

### Frontend Dependencies:
```
react (18.3.1)
  ├── react-dom
  └── react-router-dom (7.5.2)
      └── Page routing

firebase (11.6.1)
  ├── @firebase/auth
  ├── @firebase/firestore
  └── @firebase/app

framer-motion (12.9.2)
  └── Animations (optional, can remove)

vite (6.3.2)
  └── Build tool
```

### Backend Dependencies:
```
express
  ├── cors
  ├── body-parser
  └── compression

dotenv
  └── Environment variables

(OpenAI SDK not needed - using fetch)
```

---

## 🎯 Request Flow Examples

### Example 1: Student Takes Quiz
```
1. GET /quiz/:topicId
   → firestoreService.getDocuments('questions', filters)
   → Returns published questions only
   
2. POST (Implicit) submitQuiz
   → quizService.submitQuiz(answers)
   → Calculates score
   → Creates quizAttempt document
   → progressService.updateXP(userId, xp)
   → Updates progress document
   → leaderboardService updates (triggered by progress change)
   
3. Result: XP awarded, level updated, leaderboard refreshed
```

### Example 2: Teacher Generates Questions
```
1. POST /api/questions/generate
   → Backend validates request
   → Builds prompt from template
   → Sends to OpenAI API
   → Parses JSON response
   → Returns questions to frontend
   
2. Teacher reviews and approves
   
3. POST (Implicit) publishQuestions
   → questionService.updateQuestions(ids, {status: 'published'})
   → Updates multiple question documents
   → Uses Firestore batch write
   
4. Result: Questions available to students immediately
```

---

## 🧩 Component Hierarchy

### Main App Structure:
```
App.jsx
  │
  ├── AuthContext (provides user state)
  │
  └── AppRouter
        │
        ├── Public Routes
        │   ├── / (Landing)
        │   └── /login (Auth)
        │
        ├── Protected Routes
        │   └── RoleRoute (checks authentication)
        │         │
        │         ├── Student Routes
        │         │   ├── /home → Home.jsx
        │         │   │           └── AppShell
        │         │   │               ├── HeaderBar
        │         │   │               ├── PageHeader
        │         │   │               ├── SummaryBar
        │         │   │               ├── OptionGrid
        │         │   │               │   └── OptionCard (×N)
        │         │   │               └── QuickActionPanel
        │         │   │
        │         │   ├── /courses → CoursesPage.jsx
        │         │   ├── /quiz/:id → QuizAttemptPage.jsx
        │         │   ├── /leaderboard → LeaderboardPage.jsx
        │         │   └── /progress → ProgressPage.jsx
        │         │
        │         └── Teacher Routes
        │             ├── /teacher → TeacherDashboard.jsx
        │             ├── /subjects → SubjectManagementPage.jsx
        │             ├── /generator → QuestionGeneratorPage.jsx
        │             └── /analytics → AnalyticsPage.jsx
        │
        └── Error Boundary
            └── Catches and displays errors gracefully
```

---

## 🔍 Monitoring & Observability

### Health Check System:
```
GET /health

Returns:
{
  status: "healthy" | "degraded",
  llmConfigured: true/false,
  uptime: 12345,
  environment: "production",
  timestamp: "2026-06-08T..."
}

Use for:
- Uptime monitoring
- Deployment verification
- Load balancer health checks
```

### Logging Architecture:
```
Application Code
      │
      │ logger.info()/error()/warn()
      ▼
Logger Utility
      │
      ├── Development: console.log with colors
      └── Production: structured JSON logs
            │
            ▼
      Log Aggregation Service
      (Future: Sentry, LogRocket, etc.)
```

---

## 📊 System Capacity

### Expected Capacity (Free Tier):
```
Firebase Free Tier:
├── Authentication: 50,000 users
├── Firestore Reads: 50,000/day
├── Firestore Writes: 20,000/day
└── Storage: 1 GB

Real Capacity Estimate:
├── Concurrent Users: 50-100
├── Daily Active Users: 200-500
├── Quizzes/day: 1,000-2,000
└── Questions stored: 10,000+
```

### Scaling Strategy:
```
Phase 1: Free Tier (0-500 users)
  └── Current setup sufficient

Phase 2: Paid Tier (500-5,000 users)
  ├── Firebase Blaze plan
  ├── CDN for assets
  └── Cloud Functions for heavy operations

Phase 3: Enterprise (5,000+ users)
  ├── Dedicated database
  ├── Load balancing
  ├── Caching layer (Redis)
  └── Multiple regions
```

---

## 🎓 Summary

The Skill Park platform uses a **modern, scalable architecture** with:

✅ **React frontend** with service layer pattern  
✅ **Firebase backend** for real-time sync  
✅ **OpenAI integration** for AI-powered features  
✅ **Security at multiple layers**  
✅ **Performance optimization** throughout  
✅ **Docker containerization** for easy deployment  

All designed for **rural education** with **low bandwidth** and **low-end devices** in mind.

---

**Document Created**: June 8, 2026  
**Version**: 2.0.0  
**Status**: Production Architecture  

