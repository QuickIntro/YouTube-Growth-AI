# 🚀 YouTube Growth AI - Complete SaaS Platform

A free, AI-powered YouTube optimization platform that helps YouTubers grow their channels using data insights, AI-generated content, and comprehensive analytics.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## 🎯 Overview

YouTube Growth AI is a comprehensive SaaS platform similar to vidIQ or TubeBuddy, but completely **free** and **ad-supported**. It provides:

- **AI-Powered Tools**: Title, description, and tag generation using Gemini AI
- **Analytics Dashboard**: Real-time channel and video analytics
- **Thumbnail Analyzer**: Computer vision-based thumbnail optimization
- **Keyword Research**: SEO insights and competitor analysis
- **Multi-language Support**: Bangla and English

## ✨ Features

### Core Features

1. **Google OAuth2 Authentication**
   - Secure login with YouTube channel access
   - Automatic channel data synchronization

2. **Dashboard & Analytics**
   - Real-time channel statistics
   - Views, CTR, engagement metrics
   - Interactive charts and graphs
   - Historical data tracking

3. **AI Content Generation** (Gemini API)
   - **Title Generator**: 5 viral title suggestions
   - **Description Generator**: SEO-optimized descriptions
   - **Tag Generator**: Relevant keyword tags
   - **Keyword Research**: Search volume and competition analysis

4. **Thumbnail Analyzer** (Python + OpenCV)
   - Brightness and contrast analysis
   - Face detection
   - Text region detection
   - Color vibrancy scoring
   - Actionable recommendations

5. **Competitor Analysis**
   - Channel comparison
   - Top performing videos
   - Tag analysis
   - Upload frequency insights

6. **Google AdSense Integration**
   - Responsive ad units
   - Strategic placement
   - Non-intrusive monetization

7. **Settings & Preferences**
   - Dark/Light mode toggle
   - Language switching (Bangla/English)
   - Account management
   - Data export

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TailwindCSS
- **State Management**: Zustand + React Query
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Framework**: NestJS
- **Runtime**: Node.js 18+
- **API**: RESTful + Swagger docs
- **Authentication**: JWT + Passport
- **Queue**: BullMQ + Redis
- **Validation**: class-validator

### Database
- **Primary**: Supabase (PostgreSQL)
- **Cache**: Redis
- **ORM**: Supabase Client

### AI & ML
- **AI**: Google Gemini API
- **Computer Vision**: OpenCV (Python)
- **Microservice**: FastAPI

### APIs
- **YouTube Data API v3**
- **YouTube Analytics API**
- **Google OAuth2**
- **Google AdSense**

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render / Cloud Run
- **Monitoring**: (Optional) Sentry

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │AI Tools  │  │Analytics │  │Settings  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                    │                                         │
│                    │  REST API + WebSocket                   │
└────────────────────┼─────────────────────────────────────────┘
                     │
┌────────────────────┼─────────────────────────────────────────┐
│                    ▼         Backend (NestJS)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Auth      │  │YouTube   │  │AI        │  │Analytics │   │
│  │Module    │  │Module    │  │Module    │  │Module    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│       │             │             │             │            │
│       └─────────────┴─────────────┴─────────────┘            │
│                     │                                         │
│              ┌──────┴──────┐                                 │
│              ▼             ▼                                 │
│        ┌──────────┐  ┌──────────┐                           │
│        │Supabase  │  │Redis     │                           │
│        │(Postgres)│  │(Cache)   │                           │
│        └──────────┘  └──────────┘                           │
└──────────────────────────────────────────────────────────────┘
                     │
┌────────────────────┼─────────────────────────────────────────┐
│                    ▼  Thumbnail Service (Python/FastAPI)    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  OpenCV + Computer Vision Analysis                   │   │
│  │  - Brightness/Contrast  - Face Detection             │   │
│  │  - Text Detection       - Color Analysis             │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker & Docker Compose (optional)
- Redis
- PostgreSQL (or Supabase account)

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/youtube-growth-ai.git
cd youtube-growth-ai
```

2. **Copy environment variables**
```bash
cp .env.example .env
```

3. **Configure `.env` file**
```env
# Google OAuth2
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# YouTube API
YOUTUBE_API_KEY=your-api-key

# Gemini AI
GEMINI_API_KEY=your-gemini-key

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key

# Redis
REDIS_URL=redis://localhost:6379

# AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxx
```

### Local Development

#### Option 1: Using Docker (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Services will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# Thumbnail Service: http://localhost:8000
# Redis: localhost:6379
# PostgreSQL: localhost:5432
```

#### Option 2: Manual Setup

**1. Install dependencies**
```bash
npm run setup
```

**2. Start services individually**

Terminal 1 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 2 - Backend:
```bash
cd backend
npm run start:dev
```

Terminal 3 - Thumbnail Service:
```bash
cd thumbnail-service
pip install -r requirements.txt
uvicorn main:app --reload
```

Terminal 4 - Redis:
```bash
redis-server
```

### Database Setup

1. **Create Supabase project** at https://supabase.com

2. **Run migrations**
```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  picture TEXT,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create channels table
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel_id VARCHAR(255) UNIQUE NOT NULL,
  channel_title VARCHAR(255),
  subscriber_count BIGINT,
  view_count BIGINT,
  video_count INTEGER,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id VARCHAR(255) REFERENCES channels(channel_id),
  date DATE NOT NULL,
  views BIGINT,
  watch_time_minutes BIGINT,
  average_view_duration FLOAT,
  ctr FLOAT,
  engagement_rate FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create AI generations table
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  generation_type VARCHAR(50),
  input_data JSONB,
  output_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_channels_user_id ON channels(user_id);
CREATE INDEX idx_analytics_channel_id ON analytics(channel_id);
CREATE INDEX idx_analytics_date ON analytics(date);
CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
```

## 🌐 Deployment

### Frontend (Vercel)

1. **Connect GitHub repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy**:
```bash
cd frontend
vercel --prod
```

### Backend (Render)

1. **Create new Web Service** on Render
2. **Connect repository**
3. **Configure**:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm run start:prod`
   - Environment: Add all backend env variables

### Thumbnail Service (Render)

1. **Create new Web Service** on Render
2. **Configure**:
   - Build Command: `cd thumbnail-service && pip install -r requirements.txt`
   - Start Command: `cd thumbnail-service && uvicorn main:app --host 0.0.0.0 --port 8000`

### Database (Supabase)

- Already hosted on Supabase cloud
- Configure connection string in environment variables

### Redis (Upstash)

1. **Create Redis database** at https://upstash.com
2. **Copy connection URL** to `REDIS_URL` env variable

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/google
- Authenticate with Google OAuth2
- Returns: JWT token

GET /api/auth/me
- Get current user info
- Requires: Bearer token
```

### YouTube Endpoints

```
GET /api/youtube/channel
- Get channel statistics
- Requires: Auth

GET /api/youtube/videos
- Get channel videos
- Requires: Auth

GET /api/youtube/analytics
- Get channel analytics
- Requires: Auth
- Query: ?days=30
```

### AI Endpoints

```
POST /api/ai/generate-titles
- Generate video titles
- Body: { currentTitle, description, keywords, language }
- Returns: { titles: string[] }

POST /api/ai/generate-description
- Generate video description
- Body: { title, keywords, language }
- Returns: { description: string }

POST /api/ai/generate-tags
- Generate video tags
- Body: { title, description, language }
- Returns: { tags: string[] }

POST /api/ai/analyze-keyword
- Analyze keyword
- Body: { keyword, language }
- Returns: { searchVolume, competition, relatedKeywords }
```

### Thumbnail Endpoints

```
POST /api/thumbnail/analyze
- Analyze thumbnail image
- Body: multipart/form-data (image file)
- Returns: {
    overall_score,
    brightness_score,
    contrast_score,
    face_detection_score,
    recommendations
  }
```

Full API documentation available at: `http://localhost:4000/api/docs`

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# E2E tests
npm run test:e2e
```

## 📊 Monitoring

- **Frontend**: Vercel Analytics
- **Backend**: Render metrics
- **Errors**: (Optional) Sentry integration
- **Logs**: Docker logs or cloud provider logs

## 🔒 Security

- JWT authentication with secure httpOnly cookies
- Rate limiting on all API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers
- Encrypted token storage in database

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👥 Team

YouTube Growth AI Team

## 🙏 Acknowledgments

- Google Gemini AI
- YouTube Data API
- Supabase
- Vercel
- Render

---

**Built with ❤️ for YouTubers by YouTubers**
