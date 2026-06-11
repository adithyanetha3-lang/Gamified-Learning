# 🚀 Production Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Environment Configuration
- [ ] `.env` file created with production values
- [ ] `server/.env` created with production values
- [ ] Firebase credentials configured
- [ ] OpenAI API key added (or LLM alternative)
- [ ] `ALLOWED_ORIGINS` set to production domains
- [ ] `NODE_ENV=production` set for backend
- [ ] All sensitive keys NOT committed to git

### Security
- [ ] Firebase security rules configured
- [ ] Rate limiting tested and configured
- [ ] CORS whitelist includes only production domains
- [ ] Security headers verified
- [ ] Input sanitization tested
- [ ] SSL/HTTPS certificates ready
- [ ] API keys rotated from development keys

### Code Quality
- [ ] Production build successful (`npm run build`)
- [ ] No console errors in build output
- [ ] All dependencies updated (`npm audit`)
- [ ] Security vulnerabilities resolved
- [ ] Code reviewed and tested
- [ ] Error boundaries tested

### Testing
- [ ] Authentication flow tested (signup/login)
- [ ] Student dashboard functional
- [ ] Teacher dashboard functional
- [ ] Question generation working
- [ ] Quiz taking functional
- [ ] Leaderboard displaying correctly
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility checked

### Performance
- [ ] Build size optimized (<500KB initial bundle)
- [ ] Code splitting verified
- [ ] Lazy loading implemented
- [ ] Images optimized
- [ ] Fonts optimized
- [ ] Caching strategy configured

## Deployment

### Frontend
- [ ] Built assets deployed to hosting service
- [ ] CDN configured (if applicable)
- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Environment variables set in hosting platform
- [ ] Redirect rules configured (SPA routing)

### Backend
- [ ] Server deployed and running
- [ ] Health check endpoint accessible (`/health`)
- [ ] Database connected (Firestore)
- [ ] LLM API responding
- [ ] Logs configured and accessible
- [ ] Process manager configured (PM2/systemd)
- [ ] Auto-restart on crash enabled

### Infrastructure
- [ ] Docker containers running (if using Docker)
- [ ] Load balancer configured (if applicable)
- [ ] Firewall rules set
- [ ] Backup strategy implemented
- [ ] Monitoring tools active

## Post-Deployment

### Verification
- [ ] Frontend accessible at production URL
- [ ] Backend health check returning 200
- [ ] User signup/login working
- [ ] API requests succeeding
- [ ] Firebase connection established
- [ ] LLM question generation functional
- [ ] No console errors in browser
- [ ] Mobile version working

### Monitoring
- [ ] Uptime monitoring configured
- [ ] Error tracking active
- [ ] Performance monitoring setup
- [ ] Log aggregation working
- [ ] Alerts configured for downtime
- [ ] Analytics tracking verified

### Documentation
- [ ] README updated with production URLs
- [ ] DEPLOYMENT.md reviewed
- [ ] API documentation current
- [ ] Team notified of deployment
- [ ] Runbook created for common issues

### Performance Testing
- [ ] Load testing completed
- [ ] Lighthouse score > 80
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Rate limiting functional

### Backup & Recovery
- [ ] Database backup verified
- [ ] Rollback plan documented
- [ ] Previous version tagged in git
- [ ] Recovery tested

## Post-Launch

### Week 1
- [ ] Monitor error rates daily
- [ ] Check uptime metrics
- [ ] Review user feedback
- [ ] Address critical bugs
- [ ] Performance optimization if needed

### Ongoing
- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly performance reviews
- [ ] User feedback incorporation
- [ ] Feature roadmap updates

---

## Quick Commands

### Health Check
```bash
curl https://your-api-domain.com/health
```

### View Logs (Docker)
```bash
docker-compose logs -f
```

### View Logs (PM2)
```bash
pm2 logs skill-park-api
```

### Restart Services (Docker)
```bash
docker-compose restart
```

### Restart Services (PM2)
```bash
pm2 restart skill-park-api
```

---

## Emergency Contacts

- **DevOps Lead:** [name@email.com]
- **Backend Lead:** [name@email.com]
- **Frontend Lead:** [name@email.com]
- **Firebase Admin:** [name@email.com]

---

**Last Review:** [Date]
**Next Review:** [Date + 1 month]
