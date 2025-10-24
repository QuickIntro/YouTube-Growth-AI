# 🚀 YouTube Growth AI - Complete SaaS Platform

<div align="center">

**Free, AI-Powered YouTube Channel Optimization Platform**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python)](https://python.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deploy](#-deployment)

</div>

---

## 🎯 Overview

YouTube Growth AI is a **complete, production-ready SaaS platform** that helps YouTubers optimize and grow their channels using AI-powered tools, analytics, and insights. Built with modern technologies and completely **free** (ad-supported).

## ✨ Features

### 🔐 Authentication
- Google OAuth2 integration
- YouTube channel access
- Secure JWT tokens
- Session management

### 📊 Dashboard
- Real-time channel statistics
- Interactive analytics charts
- Recent videos overview
- Growth metrics & trends

### 🤖 AI-Powered Tools (Gemini API)
- **Title Generator** - 5 viral title suggestions
- **Description Generator** - SEO-optimized content
- **Tag Generator** - Relevant keyword tags
- **Keyword Analyzer** - Search volume & competition

### 🖼️ Thumbnail Analyzer (OpenCV)
- Brightness & contrast analysis
- Face detection
- Text region detection
- Color vibrancy scoring
- Actionable recommendations

### 📈 Analytics & Insights
- Historical data tracking
- Performance metrics
- Video ranking
- Engagement analysis
- Competitor insights

### ⚙️ Settings
- Dark/Light mode toggle
- Language switching (Bangla/English)
- Account management
- Data export

### 💰 Monetization
- Google AdSense integration
- Strategic ad placement
- Non-intrusive design

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker (optional but recommended)

### Option 1: Docker (Easiest)

```bash
# Clone repository
git clone https://github.com/yourusername/youtube-growth-ai.git
cd youtube-growth-ai

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker-compose up --build
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- API Docs: http://localhost:4000/api/docs
- Thumbnail Service: http://localhost:8000

### Option 2: Manual Setup

```bash
# Install dependencies
npm run setup

# Start services (4 terminals)
npm run dev:frontend   # Terminal 1
npm run dev:backend    # Terminal 2
npm run dev:thumbnail  # Terminal 3
redis-server           # Terminal 4
```

📖 **Full guide:** See [QUICK_START.md](QUICK_START.md)

---

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18 + TypeScript
- TailwindCSS
- NextAuth.js
- React Query
- Recharts

### Backend
- NestJS
- Node.js 18+
- TypeScript
- Passport + JWT
- BullMQ + Redis
- Swagger

### Database
- Supabase (PostgreSQL)
- Redis

### AI & ML
- Google Gemini API
- OpenCV + FastAPI
- Python 3.11+

### DevOps
- Docker + Docker Compose
- GitHub Actions
- Vercel + Render

---

## 📚 Documentation

- **[PROJECT_README.md](PROJECT_README.md)** - Complete documentation
- **[QUICK_START.md](QUICK_START.md)** - Local development guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project overview
- **API Docs** - http://localhost:4000/api/docs (when running)

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Render)
- Connect GitHub repository
- Configure environment variables
- Deploy

### Database (Supabase)
- Create project
- Run migrations from DEPLOYMENT_GUIDE.md
- Copy connection details

📖 **Full guide:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🏗️ Project Structure

```
youtube-growth-ai/
├── frontend/          # Next.js frontend
├── backend/           # NestJS backend
├── thumbnail-service/ # Python microservice
├── .github/          # CI/CD workflows
├── docker-compose.yml
├── .env.example
└── docs/             # Documentation
```

---

## 🔑 Required API Keys

1. **Google Cloud Console**
   - OAuth2 Client ID & Secret
   - YouTube Data API Key

2. **Gemini API**
   - API Key from Google AI Studio

3. **Supabase**
   - Project URL
   - Anon Key
   - Service Role Key

4. **Google AdSense** (Optional)
   - Publisher ID

📖 **Setup guide:** See [QUICK_START.md](QUICK_START.md#-getting-api-keys)

---

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# E2E tests
npm run test:e2e
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- Google Gemini AI
- YouTube Data API
- Supabase
- Vercel
- Render
- OpenCV Community

---

## 📞 Support

- 📧 Email: support@youtubegrowth.ai
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/youtube-growth-ai/issues)
- 📖 Docs: [Full Documentation](PROJECT_README.md)

---

## 🎉 What's Included

✅ Complete frontend (Next.js)  
✅ Complete backend (NestJS)  
✅ Thumbnail analyzer microservice (Python)  
✅ Database schema & migrations  
✅ Docker configuration  
✅ CI/CD pipeline  
✅ Comprehensive documentation  
✅ Production-ready deployment configs  

---

<div align="center">

**Built with ❤️ for YouTubers by YouTubers**

⭐ Star this repo if you find it helpful!

[Get Started](QUICK_START.md) • [Documentation](PROJECT_README.md) • [Deploy](DEPLOYMENT_GUIDE.md)

</div>
All text content is inline in the HTML. Search for:
- Bengali text (e.g., `কি কি সম্ভব?`)
- English text (e.g., `Features`)
- Replace with your own content

### Add Google AdSense
Replace the ad placeholders with actual AdSense code:
```html
<!-- Current placeholder -->
<div class="ad-slot rounded-lg p-4 text-center">
  <div class="text-slate-400 text-xs font-medium">Ad slot (Google AdSense)</div>
</div>

<!-- Replace with -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

## 🎯 SEO Optimization

### Meta Tags Included
- Title tag
- Description meta tag
- Open Graph tags for social sharing
- Viewport meta for mobile responsiveness

### Recommendations
1. Add favicon: `<link rel="icon" href="favicon.ico">`
2. Add canonical URL: `<link rel="canonical" href="https://yourdomain.com/">`
3. Add structured data (JSON-LD) for better SEO
4. Optimize images (when you add real screenshots)

## 📱 Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Production Deployment

### Before Going Live
1. Replace Tailwind CDN with production build
2. Add actual Google AdSense code
3. Replace mockup screenshots with real images
4. Add favicon and app icons
5. Set up Google Analytics
6. Configure proper meta tags with your domain
7. Test on multiple devices and browsers

### Build for Production (Optional)
If you want to optimize further:

```bash
# Install Tailwind CLI
npm install -D tailwindcss

# Create tailwind.config.js
npx tailwindcss init

# Build optimized CSS
npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify
```

## 📊 Performance Tips
- Current setup loads fast (<1.5s) with CDN
- For production, consider:
  - Self-hosting fonts
  - Using a build process for Tailwind
  - Lazy loading images
  - Minifying HTML

## 🌐 Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License
All rights reserved © 2025 YouTube Growth AI

## 🤝 Support
For questions or issues, contact through the website footer links.

---

**Ready to deploy!** Just open `index.html` in your browser to see the landing page in action.
