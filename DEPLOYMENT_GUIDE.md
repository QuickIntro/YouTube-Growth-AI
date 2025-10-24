# 🚀 YouTube Growth AI - Deployment Guide

Complete step-by-step guide to deploy YouTube Growth AI to production.

## 📋 Prerequisites Checklist

Before deploying, ensure you have:

- [ ] Google Cloud Console project with OAuth2 credentials
- [ ] YouTube Data API v3 enabled
- [ ] YouTube Analytics API enabled
- [ ] Gemini API key
- [ ] Supabase account and project
- [ ] Vercel account
- [ ] Render account (or alternative)
- [ ] Upstash Redis account
- [ ] Google AdSense account
- [ ] GitHub repository
- [ ] Domain name (optional)

## 🔧 Step 1: Google Cloud Setup

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "YouTube Growth AI"
3. Enable APIs:
   - YouTube Data API v3
   - YouTube Analytics API
   - Google+ API

### 1.2 Configure OAuth2

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure consent screen:
   - App name: YouTube Growth AI
   - User support email: your-email@example.com
   - Scopes: Add YouTube read scopes
4. Create OAuth client:
   - Application type: Web application
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://yourdomain.com/api/auth/callback/google
     ```
5. Save **Client ID** and **Client Secret**

### 1.3 Get API Keys

1. Go to **Credentials**
2. Click **Create Credentials** → **API Key**
3. Restrict key to YouTube Data API v3
4. Save the API key

## 🤖 Step 2: Gemini AI Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Save the Gemini API key

## 💾 Step 3: Database Setup (Supabase)

### 3.1 Create Project

1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Choose region closest to your users
4. Save database password

### 3.2 Run Migrations

1. Go to **SQL Editor** in Supabase dashboard
2. Run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  picture TEXT,
  access_token TEXT,
  refresh_token TEXT,
  language VARCHAR(10) DEFAULT 'bn',
  theme VARCHAR(10) DEFAULT 'dark',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Channels table
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel_id VARCHAR(255) UNIQUE NOT NULL,
  channel_title VARCHAR(255),
  description TEXT,
  subscriber_count BIGINT DEFAULT 0,
  view_count BIGINT DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  country VARCHAR(10),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id VARCHAR(255) REFERENCES channels(channel_id),
  video_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500),
  description TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMP,
  view_count BIGINT DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  duration VARCHAR(50),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id VARCHAR(255) REFERENCES channels(channel_id),
  date DATE NOT NULL,
  views BIGINT DEFAULT 0,
  watch_time_minutes BIGINT DEFAULT 0,
  average_view_duration FLOAT DEFAULT 0,
  ctr FLOAT DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,
  subscribers_gained INTEGER DEFAULT 0,
  subscribers_lost INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(channel_id, date)
);

-- AI Generations table
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  generation_type VARCHAR(50) NOT NULL,
  input_data JSONB,
  output_data JSONB,
  language VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Thumbnail Analysis table
CREATE TABLE thumbnail_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id VARCHAR(255),
  overall_score FLOAT,
  brightness_score FLOAT,
  contrast_score FLOAT,
  face_detection_score FLOAT,
  recommendations TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_channels_user_id ON channels(user_id);
CREATE INDEX idx_channels_channel_id ON channels(channel_id);
CREATE INDEX idx_videos_channel_id ON videos(channel_id);
CREATE INDEX idx_analytics_channel_id ON analytics(channel_id);
CREATE INDEX idx_analytics_date ON analytics(date);
CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_generations_type ON ai_generations(generation_type);
CREATE INDEX idx_thumbnail_analyses_user_id ON thumbnail_analyses(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3.3 Get Connection Details

1. Go to **Settings** → **Database**
2. Copy:
   - Connection string (URI)
   - Anon key
   - Service role key

## 🗄️ Step 4: Redis Setup (Upstash)

1. Go to [Upstash](https://upstash.com)
2. Create Redis database
3. Choose region
4. Copy **Redis URL**

## 💰 Step 5: Google AdSense Setup

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Create account / Sign in
3. Add your website
4. Get AdSense code:
   - Publisher ID: `ca-pub-XXXXXXXXXXXXXXXX`
5. Create ad units:
   - Dashboard ad unit
   - Tools page ad unit
6. Save ad unit IDs

## 🌐 Step 6: Frontend Deployment (Vercel)

### 6.1 Connect Repository

1. Go to [Vercel](https://vercel.com)
2. Click **Import Project**
3. Connect GitHub repository
4. Select `frontend` directory as root

### 6.2 Configure Environment Variables

Add these in Vercel dashboard:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback/google

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-random-32-char-string

# Backend API
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
BACKEND_URL=https://your-backend.onrender.com

# AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_TOOLS=0987654321

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 6.3 Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Get deployment URL

### 6.4 Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add custom domain
3. Configure DNS records

## 🔧 Step 7: Backend Deployment (Render)

### 7.1 Create Web Service

1. Go to [Render](https://render.com)
2. Click **New** → **Web Service**
3. Connect GitHub repository
4. Configure:
   - Name: youtube-growth-ai-backend
   - Root Directory: `backend`
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Plan: Free or Starter

### 7.2 Environment Variables

Add in Render dashboard:

```env
# Node
NODE_ENV=production
API_PORT=4000

# Google
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# YouTube API
YOUTUBE_API_KEY=your-api-key

# Gemini AI
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-pro

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
DATABASE_URL=postgresql://postgres:[password]@xxx.supabase.co:5432/postgres

# Redis
REDIS_URL=redis://default:[password]@xxx.upstash.io:6379

# JWT
JWT_SECRET=generate-random-32-char-string
JWT_EXPIRATION=7d

# Frontend URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Thumbnail Service
THUMBNAIL_SERVICE_URL=https://your-thumbnail-service.onrender.com
```

### 7.3 Deploy

1. Click **Create Web Service**
2. Wait for deployment
3. Get service URL

## 🖼️ Step 8: Thumbnail Service Deployment (Render)

### 8.1 Create Web Service

1. Create another Web Service on Render
2. Configure:
   - Name: youtube-growth-ai-thumbnail
   - Root Directory: `thumbnail-service`
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port 8000`

### 8.2 Environment Variables

```env
PYTHONUNBUFFERED=1
```

### 8.3 Deploy

1. Click **Create Web Service**
2. Wait for deployment
3. Get service URL
4. Update `THUMBNAIL_SERVICE_URL` in backend

## 🔄 Step 9: Update URLs

After all services are deployed:

1. **Update Backend URL** in frontend Vercel env
2. **Update Thumbnail Service URL** in backend Render env
3. **Update OAuth Redirect URIs** in Google Cloud Console
4. **Redeploy** all services

## ✅ Step 10: Verification

### 10.1 Test Authentication

1. Visit your frontend URL
2. Click "Sign in with Google"
3. Authorize YouTube access
4. Verify redirect to dashboard

### 10.2 Test API Endpoints

```bash
# Health check
curl https://your-backend.onrender.com/health

# Thumbnail service
curl https://your-thumbnail-service.onrender.com/health
```

### 10.3 Test Features

- [ ] Dashboard loads with channel data
- [ ] AI title generation works
- [ ] AI description generation works
- [ ] AI tag generation works
- [ ] Keyword analysis works
- [ ] Thumbnail analyzer works
- [ ] Analytics charts display
- [ ] AdSense ads appear
- [ ] Theme toggle works
- [ ] Language switch works

## 🔒 Step 11: Security Checklist

- [ ] All API keys are in environment variables (not code)
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] JWT secrets are strong and unique
- [ ] Database has proper indexes
- [ ] SSL/HTTPS is enabled
- [ ] OAuth redirect URIs are whitelisted
- [ ] Supabase RLS policies are configured (optional)

## 📊 Step 12: Monitoring Setup

### 12.1 Vercel Analytics

1. Enable in Vercel dashboard
2. Monitor frontend performance

### 12.2 Render Metrics

1. Check service health in Render dashboard
2. Monitor response times and errors

### 12.3 Supabase Monitoring

1. Monitor database queries
2. Check connection pool usage

## 🚨 Troubleshooting

### Frontend Issues

**Build fails:**
- Check environment variables
- Verify Node version (18+)
- Check for TypeScript errors

**OAuth not working:**
- Verify redirect URIs in Google Console
- Check NEXTAUTH_URL matches deployment URL
- Ensure NEXTAUTH_SECRET is set

### Backend Issues

**Service won't start:**
- Check logs in Render dashboard
- Verify all env variables are set
- Check database connection

**API errors:**
- Verify YouTube API key is valid
- Check Gemini API quota
- Verify Supabase connection

### Thumbnail Service Issues

**Analysis fails:**
- Check Python version (3.11)
- Verify OpenCV installation
- Check image upload size limits

## 🔄 CI/CD Pipeline

The GitHub Actions workflow automatically deploys on push to `main`:

1. Runs tests
2. Builds all services
3. Deploys to production

To trigger manual deployment:
```bash
git push origin main
```

## 📈 Scaling Considerations

### When to upgrade:

1. **Frontend (Vercel)**:
   - Upgrade to Pro when traffic > 100GB/month
   
2. **Backend (Render)**:
   - Upgrade from Free to Starter when always-on needed
   - Upgrade to Standard for better performance

3. **Database (Supabase)**:
   - Upgrade to Pro when > 500MB storage
   - Consider connection pooling

4. **Redis (Upstash)**:
   - Upgrade when > 10K commands/day

## 🎉 Deployment Complete!

Your YouTube Growth AI platform is now live! 

**Next Steps:**
1. Share with beta users
2. Monitor performance
3. Collect feedback
4. Iterate and improve

---

**Need help?** Check the main README or open an issue on GitHub.
