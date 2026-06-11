# 🚀 Deployment Guide for Skill Park

This guide covers deploying the Skill Park platform to production.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Cloud Platform Deployment](#cloud-platform-deployment)
- [Post-Deployment](#post-deployment)

## Prerequisites

- Node.js 20+ installed
- Docker and Docker Compose (for containerized deployment)
- Firebase project with Authentication and Firestore configured
- OpenAI API key (or compatible LLM service)

## Environment Setup

### 1. Frontend Environment Variables

Create `.env` in the project root:

```env
NODE_ENV=production

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend API URL (update after backend deployment)
VITE_API_URL=https://api.yourskillpark.com
```

### 2. Backend Environment Variables

Create `.env` in the `server/` directory:

```env
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://yourskillpark.com,https://www.yourskillpark.com
RATE_LIMIT_MAX=100

# LLM Configuration
OPENAI_API_KEY=your_openai_api_key
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o-mini
```

## Docker Deployment

### Quick Start with Docker Compose

```bash
# 1. Build and start services
docker-compose up -d

# 2. Check health
curl http://localhost:3000/health

# 3. View logs
docker-compose logs -f

# 4. Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t skill-park:latest .

# Run container
docker run -d \
  --name skill-park \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  skill-park:latest

# Check logs
docker logs -f skill-park
```

## Manual Deployment

### Frontend Deployment

```bash
# 1. Install dependencies
npm ci --production

# 2. Build for production
npm run build

# 3. Preview locally
npm run preview

# 4. Deploy the 'dist' folder to your hosting service
# Examples: Netlify, Vercel, Firebase Hosting, AWS S3 + CloudFront
```

### Backend Deployment

```bash
# 1. Navigate to server directory
cd server

# 2. Install dependencies
npm ci --production

# 3. Start production server
NODE_ENV=production npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start index.js --name skill-park-api
pm2 save
pm2 startup
```

## Cloud Platform Deployment

### Firebase Hosting (Frontend)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Render.com (Backend)

1. Connect your GitHub repository
2. Create a new Web Service
3. Configure:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment: Node 20
4. Add environment variables from `.env`

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

### AWS Elastic Beanstalk (Full Stack)

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init skill-park --platform node.js --region us-east-1

# Create environment and deploy
eb create skill-park-prod
eb deploy
```

### Heroku (Backend)

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create skill-park-api

# Add environment variables
heroku config:set NODE_ENV=production
heroku config:set OPENAI_API_KEY=your_key

# Deploy
git subtree push --prefix server heroku main
```

## Post-Deployment

### 1. Health Check

```bash
curl https://your-api-domain.com/health
```

Expected response:
```json
{
  "ok": true,
  "service": "skill-park-api",
  "version": "1.0.0",
  "llmConfigured": true
}
```

### 2. Firebase Security Rules

Update Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
  }
}
```

### 3. Monitoring Setup

- Enable Firebase Analytics
- Set up error tracking (Sentry, LogRocket)
- Configure uptime monitoring (UptimeRobot, Pingdom)
- Set up log aggregation (CloudWatch, Datadog)

### 4. Performance Optimization

- Enable CDN for static assets
- Configure caching headers
- Enable gzip/brotli compression
- Set up SSL/TLS certificates
- Configure rate limiting

### 5. Backup Strategy

- Enable Firebase Firestore automatic backups
- Schedule regular database exports
- Version control your environment configurations

## SSL/HTTPS Setup

Most cloud platforms handle SSL automatically. For manual setup:

```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d yourskillpark.com -d www.yourskillpark.com
```

## Scaling Considerations

- Use a load balancer for multiple backend instances
- Implement Redis for session management and caching
- Consider Firebase Cloud Functions for serverless scaling
- Use Firebase Hosting CDN for frontend assets

## Troubleshooting

### Backend won't start
- Check environment variables are set
- Verify PORT is not already in use
- Check firewall rules allow the port

### Frontend can't connect to API
- Verify CORS settings in backend
- Check VITE_API_URL is correct
- Ensure API is publicly accessible

### LLM generation fails
- Verify OPENAI_API_KEY is valid
- Check API quota and billing
- Review rate limits

## Security Checklist

- [ ] All environment variables secured
- [ ] Firebase security rules configured
- [ ] HTTPS enabled everywhere
- [ ] Rate limiting active
- [ ] CORS properly configured
- [ ] API keys not exposed in frontend
- [ ] Regular security updates scheduled

## Support

For issues or questions:
- Check logs: `docker-compose logs` or `pm2 logs`
- Review health endpoint: `/health`
- Contact: your-support-email@example.com

---

**Last Updated:** June 2026
**Version:** 1.0.0
