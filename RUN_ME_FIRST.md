# 🚀 YouTube Growth AI - Quick Start

## ⚡ Automated Setup (Recommended)

### **Step 1: Run Setup Script**
```powershell
.\setup.ps1
```

This will automatically:
- ✅ Create `.env` file
- ✅ Install all dependencies (frontend, backend, Python)
- ✅ Verify everything is ready

**Time: ~5 minutes**

---

### **Step 2: Setup Database**

1. Go to: https://dzdnperklrtelnjiscgy.supabase.co
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Copy **entire contents** of `database/schema.sql`
5. Paste and click **"Run"**

**Time: ~2 minutes**

---

### **Step 3: Start Application**
```powershell
.\start.ps1
```

This will automatically:
- ✅ Open 3 terminal windows (Frontend, Backend, Thumbnail Service)
- ✅ Start all services
- ✅ Open browser at http://localhost:3000

**Time: ~30 seconds**

---

### **Step 4: Test the App**

1. Browser opens automatically at http://localhost:3000
2. Click **"Sign in with Google"**
3. Authorize YouTube access
4. You should see your dashboard! 🎉

---

## 🛑 Stop Services

```powershell
.\stop.ps1
```

This will stop all running services.

---

## 📋 Manual Setup (Alternative)

If automated scripts don't work, follow these steps:

### **1. Create .env file**
```powershell
copy .env.example .env
```

### **2. Install Dependencies**
```powershell
# Root
npm install

# Frontend
cd frontend
npm install
cd ..

# Backend
cd backend
npm install
cd ..

# Thumbnail Service
cd thumbnail-service
pip install -r requirements.txt
cd ..
```

### **3. Start Services (4 terminals)**

**Terminal 1 - Frontend:**
```powershell
cd frontend
npm run dev
```

**Terminal 2 - Backend:**
```powershell
cd backend
npm run start:dev
```

**Terminal 3 - Thumbnail Service:**
```powershell
cd thumbnail-service
python -m uvicorn main:app --reload --port 8000
```

**Terminal 4 - Redis (Optional):**
```powershell
redis-server
```

---

## ✅ Verify Everything Works

### **Check Services:**
- Frontend: http://localhost:3000 (should show landing page)
- Backend: http://localhost:4000/health (should return `{"status":"ok"}`)
- API Docs: http://localhost:4000/api/docs (should show Swagger UI)
- Thumbnail: http://localhost:8000/health (should return `{"status":"healthy"}`)

### **Test Features:**
1. ✅ Sign in with Google
2. ✅ View dashboard
3. ✅ Generate AI titles
4. ✅ Analyze thumbnail
5. ✅ View analytics
6. ✅ Change settings

---

## 🐛 Troubleshooting

### **Issue: "Execution policy error"**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Issue: "Port already in use"**
Run the stop script:
```powershell
.\stop.ps1
```

### **Issue: "Python not found"**
Install Python 3.11+ from: https://www.python.org/downloads/

Make sure to check "Add Python to PATH" during installation.

### **Issue: "npm not found"**
Install Node.js 18+ from: https://nodejs.org/

### **Issue: "Database connection failed"**
Make sure you ran the SQL schema in Supabase (Step 2 above).

---

## 📚 Additional Documentation

- **[QUICK_START.md](QUICK_START.md)** - Detailed local setup guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment
- **[PROJECT_README.md](PROJECT_README.md)** - Complete documentation
- **[FEATURES_COMPLETE.md](FEATURES_COMPLETE.md)** - All features list
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture

---

## 🎯 Quick Commands

```powershell
# Setup (run once)
.\setup.ps1

# Start all services
.\start.ps1

# Stop all services
.\stop.ps1

# Check what's running
netstat -ano | findstr "3000 4000 8000"
```

---

## 🎉 Success Checklist

- [ ] Setup script completed successfully
- [ ] Database schema created in Supabase
- [ ] All services started (3 terminal windows)
- [ ] Frontend loads at http://localhost:3000
- [ ] Can sign in with Google
- [ ] Dashboard displays after login
- [ ] AI tools generate content
- [ ] Thumbnail analyzer works

**If all checked, you're ready to go!** 🚀

---

## 📞 Need Help?

1. Check [QUICK_START.md](QUICK_START.md) troubleshooting section
2. Review error logs in terminal windows
3. Verify all API keys in `.env` file
4. Make sure database schema was created

---

**Total Setup Time: ~10 minutes**

**Happy Coding! 🎬✨**
