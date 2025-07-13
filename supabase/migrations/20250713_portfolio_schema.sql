-- Folyx Portfolio Schema Migration
-- Run this in Supabase SQL Editor

-- Portfolios table
CREATE TABLE portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  template_id TEXT DEFAULT 'modern',
  template_config JSONB DEFAULT '{}',
  content_data JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  custom_domain TEXT,
  seo_title TEXT,
  seo_description TEXT,
  view_count INTEGER DEFAULT 0,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connected platforms table
CREATE TABLE connected_platforms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform_type TEXT NOT NULL, -- 'github', 'linkedin', 'dribbble', etc.
  platform_username TEXT,
  platform_user_id TEXT,
  access_token TEXT, -- Encrypted
  refresh_token TEXT, -- Encrypted
  platform_data JSONB DEFAULT '{}', -- Cached platform data
  last_sync TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending', -- 'pending', 'syncing', 'completed', 'error'
  sync_error TEXT,
  auto_sync_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio projects table (processed from platforms)
CREATE TABLE portfolio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  source_platform TEXT, -- 'github', 'dribbble', 'manual', etc.
  source_id TEXT, -- Original ID from platform
  title TEXT NOT NULL,
  description TEXT,
  enhanced_description TEXT, -- AI-enhanced version
  technologies JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  links JSONB DEFAULT '{}', -- {demo, github, live, etc.}
  metrics JSONB DEFAULT '{}', -- stars, views, likes, etc.
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio analytics
CREATE TABLE portfolio_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  visitor_id TEXT, -- Anonymous visitor tracking
  event_type TEXT NOT NULL, -- 'view', 'contact_click', 'project_click', etc.
  event_data JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_slug ON portfolios(slug);
CREATE INDEX idx_portfolios_published ON portfolios(is_published);
CREATE INDEX idx_connected_platforms_user_id ON connected_platforms(user_id);
CREATE INDEX idx_connected_platforms_type ON connected_platforms(platform_type);
CREATE INDEX idx_portfolio_projects_portfolio_id ON portfolio_projects(portfolio_id);
CREATE INDEX idx_portfolio_projects_featured ON portfolio_projects(is_featured);
CREATE INDEX idx_portfolio_analytics_portfolio_id ON portfolio_analytics(portfolio_id);
CREATE INDEX idx_portfolio_analytics_event_type ON portfolio_analytics(event_type);

-- Row Level Security (RLS) policies
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;

-- Portfolios policies
CREATE POLICY "Users can view their own portfolios" ON portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolios" ON portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios" ON portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios" ON portfolios
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Published portfolios are publicly viewable" ON portfolios
  FOR SELECT USING (is_published = true);

-- Connected platforms policies
CREATE POLICY "Users can manage their own platform connections" ON connected_platforms
  FOR ALL USING (auth.uid() = user_id);

-- Portfolio projects policies
CREATE POLICY "Users can manage projects for their portfolios" ON portfolio_projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = portfolio_projects.portfolio_id 
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view projects for published portfolios" ON portfolio_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = portfolio_projects.portfolio_id 
      AND portfolios.is_published = true
    )
  );

-- Analytics policies (insert only for tracking)
CREATE POLICY "Allow analytics insertion" ON portfolio_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view analytics for their portfolios" ON portfolio_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = portfolio_analytics.portfolio_id 
      AND portfolios.user_id = auth.uid()
    )
  );

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connected_platforms_updated_at BEFORE UPDATE ON connected_platforms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_projects_updated_at BEFORE UPDATE ON portfolio_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(input_title TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Create base slug from title
  base_slug := lower(regexp_replace(input_title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment if needed
  WHILE EXISTS (SELECT 1 FROM portfolios WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;