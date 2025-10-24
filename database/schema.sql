-- ========================================
-- YouTube Growth AI - Database Schema
-- Supabase PostgreSQL
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id VARCHAR(255) UNIQUE NOT NULL,
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

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ========================================
-- 2. CHANNELS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS channels (
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_channels_user_id ON channels(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_channel_id ON channels(channel_id);

-- ========================================
-- 3. VIDEOS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id VARCHAR(255) REFERENCES channels(channel_id) ON DELETE CASCADE,
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_videos_channel_id ON videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_video_id ON videos(video_id);
CREATE INDEX IF NOT EXISTS idx_videos_published_at ON videos(published_at DESC);

-- ========================================
-- 4. ANALYTICS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id VARCHAR(255) REFERENCES channels(channel_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views BIGINT DEFAULT 0,
  watch_time_minutes BIGINT DEFAULT 0,
  average_view_duration FLOAT DEFAULT 0,
  ctr FLOAT DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,
  subscribers_gained INTEGER DEFAULT 0,
  subscribers_lost INTEGER DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(channel_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_channel_id ON analytics(channel_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_channel_date ON analytics(channel_id, date DESC);

-- ========================================
-- 5. AI GENERATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  generation_type VARCHAR(50) NOT NULL,
  input_data JSONB,
  output_data JSONB,
  language VARCHAR(10),
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_type ON ai_generations(generation_type);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at ON ai_generations(created_at DESC);

-- ========================================
-- 6. THUMBNAIL ANALYSES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS thumbnail_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id VARCHAR(255),
  overall_score FLOAT,
  brightness_score FLOAT,
  contrast_score FLOAT,
  face_detection_score FLOAT,
  text_detection_score FLOAT,
  color_vibrancy JSONB,
  recommendations TEXT[],
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_thumbnail_analyses_user_id ON thumbnail_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_thumbnail_analyses_video_id ON thumbnail_analyses(video_id);
CREATE INDEX IF NOT EXISTS idx_thumbnail_analyses_created_at ON thumbnail_analyses(created_at DESC);

-- ========================================
-- 6b. TITLE/DESCRIPTION/TAG ANALYSES TABLES
-- ========================================
CREATE TABLE IF NOT EXISTS title_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id VARCHAR(255),
  input JSONB,
  output JSONB,
  score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS description_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id VARCHAR(255),
  input JSONB,
  output JSONB,
  score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tag_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id VARCHAR(255),
  input JSONB,
  output JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_title_analyses_user_id ON title_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_description_analyses_user_id ON description_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_tag_analyses_user_id ON tag_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_title_analyses_created_at ON title_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_description_analyses_created_at ON description_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tag_analyses_created_at ON tag_analyses(created_at DESC);

-- ========================================
-- 7. JOBS TABLE - for BullMQ tracking
-- ========================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payload JSONB,
  result JSONB,
  error TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_job_id ON jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- ========================================
-- 8. COMPETITOR ANALYSES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS competitor_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  competitor_channel_id VARCHAR(255) NOT NULL,
  competitor_channel_title VARCHAR(255),
  analysis_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_competitor_analyses_user_id ON competitor_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_analyses_channel_id ON competitor_analyses(competitor_channel_id);

-- ========================================
-- 9. USER SETTINGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT true,
  email_reports BOOLEAN DEFAULT false,
  ai_quota_daily INTEGER DEFAULT 50,
  ai_quota_used INTEGER DEFAULT 0,
  quota_reset_at TIMESTAMP DEFAULT NOW(),
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE thumbnail_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE title_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE description_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_analyses ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Policies for channels table
CREATE POLICY "Users can view own channels"
  ON channels FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own channels"
  ON channels FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own channels"
  ON channels FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Policies for videos table
CREATE POLICY "Users can view videos from own channels"
  ON videos FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM channels WHERE user_id::text = auth.uid()::text
    )
  );

-- Policies for analytics table
CREATE POLICY "Users can view own analytics"
  ON analytics FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id FROM channels WHERE user_id::text = auth.uid()::text
    )
  );

-- Policies for ai_generations table
CREATE POLICY "Users can view own AI generations"
  ON ai_generations FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own AI generations"
  ON ai_generations FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policies for thumbnail_analyses table
CREATE POLICY "Users can view own thumbnail analyses"
  ON thumbnail_analyses FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own thumbnail analyses"
  ON thumbnail_analyses FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policies for title_analyses
CREATE POLICY "Users can view own title analyses"
  ON title_analyses FOR SELECT
  USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own title analyses"
  ON title_analyses FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policies for description_analyses
CREATE POLICY "Users can view own description analyses"
  ON description_analyses FOR SELECT
  USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own description analyses"
  ON description_analyses FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policies for tag_analyses
CREATE POLICY "Users can view own tag analyses"
  ON tag_analyses FOR SELECT
  USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own tag analyses"
  ON tag_analyses FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policies for jobs table
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Policies for competitor_analyses table
CREATE POLICY "Users can view own competitor analyses"
  ON competitor_analyses FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own competitor analyses"
  ON competitor_analyses FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policies for user_settings table
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- ========================================
-- SAMPLE DATA (Optional - for testing)
-- ========================================

-- Uncomment to insert sample data
/*
INSERT INTO users (google_id, email, name, language, theme) VALUES
  ('sample-google-id-1', 'test@example.com', 'Test User', 'bn', 'dark');
*/

-- ========================================
-- VIEWS (for easier querying)
-- ========================================

-- View for channel statistics with latest analytics
CREATE OR REPLACE VIEW channel_stats_latest AS
SELECT 
  c.id,
  c.channel_id,
  c.channel_title,
  c.subscriber_count,
  c.view_count,
  c.video_count,
  a.views AS daily_views,
  a.watch_time_minutes,
  a.ctr,
  a.engagement_rate,
  a.date AS analytics_date
FROM channels c
LEFT JOIN LATERAL (
  SELECT * FROM analytics 
  WHERE channel_id = c.channel_id 
  ORDER BY date DESC 
  LIMIT 1
) a ON true;

-- View for user AI usage summary
CREATE OR REPLACE VIEW user_ai_usage AS
SELECT 
  user_id,
  generation_type,
  COUNT(*) AS total_generations,
  SUM(tokens_used) AS total_tokens,
  MAX(created_at) AS last_generation
FROM ai_generations
GROUP BY user_id, generation_type;

-- ========================================
-- MAINTENANCE FUNCTIONS
-- ========================================

-- Function to clean old analytics data (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics 
  WHERE date < CURRENT_DATE - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily AI quota
CREATE OR REPLACE FUNCTION reset_daily_ai_quota()
RETURNS void AS $$
BEGIN
  UPDATE user_settings 
  SET ai_quota_used = 0, quota_reset_at = NOW()
  WHERE quota_reset_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'YouTube Growth AI Database Schema';
  RAISE NOTICE 'Successfully created all tables!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  1. users';
  RAISE NOTICE '  2. channels';
  RAISE NOTICE '  3. videos';
  RAISE NOTICE '  4. analytics';
  RAISE NOTICE '  5. ai_generations';
  RAISE NOTICE '  6. thumbnail_analyses';
  RAISE NOTICE '  7. jobs';
  RAISE NOTICE '  8. competitor_analyses';
  RAISE NOTICE '  9. user_settings';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Update .env with Supabase credentials';
  RAISE NOTICE '  2. Test connection from backend';
  RAISE NOTICE '  3. Start your application';
  RAISE NOTICE '========================================';
END $$;
