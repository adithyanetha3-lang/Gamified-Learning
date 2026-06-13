@echo off
echo ========================================
echo  BACKEND DEPLOYMENT HELPER
echo ========================================
echo.
echo Your FRONTEND is already LIVE at:
echo https://gamified-learning-d1b24.web.app
echo.
echo ========================================
echo  NEXT STEPS - Choose One:
echo ========================================
echo.
echo Option 1: Deploy via GitHub (Recommended)
echo ==========================================
echo 1. Create repo at: https://github.com/new
echo 2. Run these commands:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/gamified-learning.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Go to: https://render.com
echo 4. Connect your GitHub repo
echo 5. Configure as Web Service (see BACKEND_DEPLOYMENT_INSTRUCTIONS.md)
echo.
echo ========================================
echo Option 2: Deploy via Render CLI
echo ========================================
echo 1. Install CLI: npm install -g @render/cli
echo 2. Login: render login
echo 3. Deploy: cd server && render up
echo.
echo ========================================
echo  IMPORTANT ENVIRONMENT VARIABLES
echo ========================================
echo Add these in Render dashboard:
echo.
echo NODE_ENV=production
echo PORT=3000
echo GROQ_API_KEY=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
echo GROQ_MODEL=llama-3.3-70b-versatile
echo ALLOWED_ORIGINS=https://gamified-learning-d1b24.web.app
echo.
echo ========================================
echo  AFTER BACKEND DEPLOYMENT
echo ========================================
echo 1. Get your backend URL from Render
echo 2. Create .env.production with:
echo    VITE_API_URL=https://your-backend-url.onrender.com
echo 3. Rebuild: npm run build
echo 4. Redeploy: firebase deploy --only hosting
echo.
echo ========================================
echo  DOCUMENTATION
echo ========================================
echo Full guide: BACKEND_DEPLOYMENT_INSTRUCTIONS.md
echo Quick guide: DEPLOY_NOW.md
echo Status: DEPLOYMENT_STATUS.md
echo.
echo ========================================
pause
