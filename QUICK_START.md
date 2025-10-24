# ⚡ YouTube Growth AI - Quick Start Guide

Get YouTube Growth AI running locally in under 10 minutes!

## 🚀 Prerequisites

Make sure you have installed:
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Python 3.11+** ([Download](https://www.python.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/)) - Optional but recommended
- **Git** ([Download](https://git-scm.com/))

## 📦 Option 1: Docker (Recommended - Easiest)

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/youtube-growth-ai.git
cd youtube-growth-ai
```

### Step 2: Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your API keys (use any text editor)
notepad .env  # Windows
nano .env     # Linux/Mac
```

**Minimum required variables:**
```env
# Get from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
YOUTUBE_API_KEY=your-api-key

# Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-key

# Get from: https://supabase.com (free tier)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Generate random 32-character strings
NEXTAUTH_SECRET=generate-random-32-chars
JWT_SECRET=generate-random-32-chars
```

### Step 3: Start Everything
```bash
docker-compose up --build
```

**That's it!** 🎉

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs
- **Thumbnail Service**: http://localhost:8000

### Stop Services
```bash
docker-compose down
```

---

## 📦 Option 2: Manual Setup (More Control)

### Step 1: Clone & Configure
```bash
git clone https://github.com/yourusername/youtube-growth-ai.git
cd youtube-growth-ai
cp .env.example .env
# Edit .env with your credentials
```

### Step 2: Install Dependencies

**Root:**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Thumbnail Service:**
```bash
cd thumbnail-service
pip install -r requirements.txt
cd ..
```

### Step 3: Setup Database

1. Create account at [Supabase](https://supabase.com)
2. Create new project
3. Go to SQL Editor and run the migration from `DEPLOYMENT_GUIDE.md`
4. Copy connection details to `.env`

### Step 4: Start Services

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 3 - Thumbnail Service:**
```bash
cd thumbnail-service
uvicorn main:app --reload
```

**Terminal 4 - Redis (if not using Docker):**
```bash
redis-server
```

### Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Thumbnail Service: http://localhost:8000

---

## 🔑 Getting API Keys

### 1. Google Cloud Console (OAuth2 & YouTube API)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable APIs:
   - YouTube Data API v3
   - YouTube Analytics API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Create API Key (restrict to YouTube APIs)

### 2. Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### 3. Supabase

1. Sign up at [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy:
   - Project URL
   - Anon/Public key
   - Service role key

### 4. Google AdSense (Optional for now)

1. Sign up at [Google AdSense](https://www.google.com/adsense/)
2. Get your publisher ID

---

## ✅ Verify Installation

### 1. Check Services

**Frontend:**
```bash
curl http://localhost:3000
# Should return HTML
```

**Backend:**
```bash
curl http://localhost:4000/health
# Should return: {"status":"ok"}
```

**Thumbnail Service:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### 2. Test Authentication

1. Open http://localhost:3000
2. Click "Sign in with Google"
3. Authorize YouTube access
4. Should redirect to dashboard

### 3. Test Features

- ✅ Dashboard loads with channel info
- ✅ AI title generation works
- ✅ Thumbnail analyzer accepts images
- ✅ Analytics charts display

---

## 🐛 Troubleshooting

### Port Already in Use

**Frontend (3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Backend (4000):**
```bash
# Change port in .env
API_PORT=4001
```

### Docker Issues

**Reset everything:**
```bash
docker-compose down -v
docker-compose up --build
```

**View logs:**
```bash
docker-compose logs -f [service-name]
```

### Database Connection Failed

1. Check Supabase project is active
2. Verify connection string in `.env`
3. Check if IP is whitelisted (Supabase → Settings → Database)

### OAuth Redirect Error

1. Verify redirect URI in Google Console matches exactly:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
2. Check `NEXTAUTH_URL` in `.env`

### Python/OpenCV Issues

**Windows:**
```bash
pip install opencv-python-headless
```

**Linux:**
```bash
sudo apt-get install python3-opencv
pip install opencv-python
```

### Redis Connection Failed

**Using Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Install locally:**
- Windows: [Download](https://github.com/microsoftarchive/redis/releases)
- Mac: `brew install redis && brew services start redis`
- Linux: `sudo apt-get install redis-server`

---

## 📝 Development Tips

### Hot Reload

All services support hot reload:
- Frontend: Automatic (Next.js)
- Backend: Automatic (NestJS watch mode)
- Thumbnail: Automatic (uvicorn --reload)

### View Logs

**Docker:**
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f thumbnail-service
```

**Manual:**
Check terminal windows where services are running

### Database GUI

Use Supabase dashboard or:
```bash
# Install Prisma Studio (optional)
npx prisma studio
```

### API Testing

**Use Swagger UI:**
http://localhost:4000/api/docs

**Or use curl:**
```bash
# Get channel data
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:4000/api/youtube/channel
```

---

## 🎯 Next Steps

1. ✅ **Customize Landing Page**
   - Edit `frontend/src/app/landing/page.tsx`
   - Update branding and content

2. ✅ **Add More Features**
   - Implement competitor analysis
   - Add more AI tools
   - Create reports

3. ✅ **Deploy to Production**
   - Follow `DEPLOYMENT_GUIDE.md`
   - Deploy to Vercel + Render

4. ✅ **Add Monitoring**
   - Set up error tracking (Sentry)
   - Add analytics (Google Analytics)

---

## 📚 Additional Resources

- **Full Documentation**: See `PROJECT_README.md`
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **API Documentation**: http://localhost:4000/api/docs
- **Architecture**: See `PROJECT_README.md` → Architecture section

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review error logs in terminal/Docker
3. Check GitHub Issues
4. Read full documentation in `PROJECT_README.md`

---

## 🎉 Success!

If everything is working:
- ✅ All services running
- ✅ Can sign in with Google
- ✅ Dashboard displays data
- ✅ AI tools generate content
- ✅ Thumbnail analyzer works

**You're ready to start developing!** 🚀

---

**Built with ❤️ for YouTubers**
