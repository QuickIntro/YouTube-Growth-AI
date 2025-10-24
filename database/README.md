# 🗄️ Database Setup Guide

## 📋 Overview

This directory contains the complete database schema for YouTube Growth AI.

**Supabase Project:** https://dzdnperklrtelnjiscgy.supabase.co

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Access Supabase SQL Editor

1. Go to: https://dzdnperklrtelnjiscgy.supabase.co
2. Sign in to your Supabase account
3. Navigate to **SQL Editor** (left sidebar)

### Step 2: Run the Schema

1. Click **"New Query"**
2. Copy the entire contents of `schema.sql`
3. Paste into the SQL Editor
4. Click **"Run"** or press `Ctrl+Enter`

**Expected Result:** ✅ All tables created successfully with confirmation message

### Step 3: Verify Tables Created

Go to **Table Editor** (left sidebar) and verify these tables exist:

- ✅ users
- ✅ channels
- ✅ videos
- ✅ analytics
- ✅ ai_generations
- ✅ thumbnail_analyses
- ✅ jobs
- ✅ competitor_analyses
- ✅ user_settings

### Step 4: Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL:** `https://dzdnperklrtelnjiscgy.supabase.co`
   - **anon/public key:** `eyJ...` (long string)
   - **service_role key:** `eyJ...` (long string)

### Step 5: Update .env File

```bash
# Copy example to .env
copy .env.example .env

# Edit .env and add your Supabase keys
SUPABASE_URL=https://dzdnperklrtelnjiscgy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Database Schema

### Tables Overview

| Table | Purpose | Rows (Est.) |
|-------|---------|-------------|
| **users** | User accounts & OAuth tokens | 1K-10K |
| **channels** | YouTube channel data | 1K-10K |
| **videos** | Video metadata & stats | 10K-100K |
| **analytics** | Daily channel analytics | 100K-1M |
| **ai_generations** | AI generation history | 10K-100K |
| **thumbnail_analyses** | Thumbnail analysis results | 1K-10K |
| **jobs** | Background job tracking | 10K-100K |
| **competitor_analyses** | Competitor analysis data | 1K-10K |
| **user_settings** | User preferences | 1K-10K |

### Key Relationships

```
users (1) ──→ (N) channels
channels (1) ──→ (N) videos
channels (1) ──→ (N) analytics
users (1) ──→ (N) ai_generations
users (1) ──→ (N) thumbnail_analyses
users (1) ──→ (1) user_settings
```

---

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies:
- ✅ Users can only access their own data
- ✅ Automatic filtering based on `auth.uid()`
- ✅ Secure by default

### Data Protection

- ✅ OAuth tokens encrypted at rest
- ✅ Foreign key constraints for data integrity
- ✅ Cascade deletes for cleanup
- ✅ Indexes for performance

---

## 🛠️ Maintenance

### Automatic Cleanup

The schema includes maintenance functions:

```sql
-- Clean old analytics (keeps last 90 days)
SELECT cleanup_old_analytics();

-- Reset daily AI quotas
SELECT reset_daily_ai_quota();
```

### Scheduled Jobs (Optional)

Set up in Supabase Dashboard → Database → Cron Jobs:

```sql
-- Run daily at midnight
SELECT cron.schedule(
  'cleanup-analytics',
  '0 0 * * *',
  'SELECT cleanup_old_analytics();'
);

SELECT cron.schedule(
  'reset-ai-quota',
  '0 0 * * *',
  'SELECT reset_daily_ai_quota();'
);
```

---

## 📈 Useful Queries

### Check User Count
```sql
SELECT COUNT(*) FROM users;
```

### View Recent AI Generations
```sql
SELECT 
  u.email,
  ag.generation_type,
  ag.created_at
FROM ai_generations ag
JOIN users u ON u.id = ag.user_id
ORDER BY ag.created_at DESC
LIMIT 10;
```

### Channel Statistics
```sql
SELECT * FROM channel_stats_latest;
```

### User AI Usage Summary
```sql
SELECT * FROM user_ai_usage;
```

### Top Users by AI Usage
```sql
SELECT 
  u.email,
  COUNT(*) as total_generations,
  SUM(ag.tokens_used) as total_tokens
FROM ai_generations ag
JOIN users u ON u.id = ag.user_id
GROUP BY u.email
ORDER BY total_generations DESC
LIMIT 10;
```

---

## 🔍 Troubleshooting

### Issue: "relation already exists"
**Solution:** Tables already created. Skip or drop existing tables first.

```sql
-- Drop all tables (CAUTION: deletes all data)
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS competitor_analyses CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS thumbnail_analyses CASCADE;
DROP TABLE IF EXISTS ai_generations CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS channels CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then run schema.sql again
```

### Issue: "permission denied"
**Solution:** Make sure you're using the service_role key in your backend, not anon key.

### Issue: RLS blocking queries
**Solution:** Ensure `auth.uid()` is set correctly or use service_role key for backend operations.

---

## 📝 Schema Modifications

### Adding a New Column

```sql
ALTER TABLE users 
ADD COLUMN new_field VARCHAR(255);
```

### Creating a New Index

```sql
CREATE INDEX idx_table_column 
ON table_name(column_name);
```

### Modifying RLS Policies

```sql
-- Drop existing policy
DROP POLICY "policy_name" ON table_name;

-- Create new policy
CREATE POLICY "new_policy_name"
  ON table_name FOR SELECT
  USING (auth.uid()::text = user_id::text);
```

---

## 🎯 Next Steps

After database setup:

1. ✅ **Update .env** with Supabase credentials
2. ✅ **Test connection** from backend
   ```bash
   cd backend
   npm run start:dev
   ```
3. ✅ **Verify tables** in Supabase dashboard
4. ✅ **Start application** and test sign-in

---

## 📞 Support

- **Supabase Docs:** https://supabase.com/docs
- **SQL Reference:** https://www.postgresql.org/docs/
- **Project Docs:** See [QUICK_START.md](../QUICK_START.md)

---

## ✅ Checklist

- [ ] SQL script executed successfully
- [ ] All 9 tables visible in Table Editor
- [ ] API keys copied to .env file
- [ ] Backend can connect to database
- [ ] RLS policies working correctly
- [ ] Sample queries return results

**Once all checked, your database is ready!** 🎉
