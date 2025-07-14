-- First, let's drop the existing connected_platforms table if it has wrong structure
-- and recreate it properly
DROP TABLE IF EXISTS connected_platforms CASCADE;

-- Create connected_platforms table for storing OAuth connections
CREATE TABLE connected_platforms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('github', 'linkedin', 'dribbble', 'twitter', 'behance')),
  platform_user_id TEXT NOT NULL,
  platform_username TEXT NOT NULL,
  platform_display_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  profile_data JSONB DEFAULT '{}',
  scope TEXT,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one connection per user per platform
  UNIQUE(user_id, platform)
);

-- Create indexes for better performance
CREATE INDEX idx_connected_platforms_user_id ON connected_platforms(user_id);
CREATE INDEX idx_connected_platforms_platform ON connected_platforms(platform);
CREATE INDEX idx_connected_platforms_verified_at ON connected_platforms(verified_at);

-- Enable RLS
ALTER TABLE connected_platforms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own platform connections"
  ON connected_platforms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own platform connections"
  ON connected_platforms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platform connections"
  ON connected_platforms FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own platform connections"
  ON connected_platforms FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_content table for storing processed content like resumes
CREATE TABLE IF NOT EXISTS user_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('resume', 'cover_letter', 'portfolio_text', 'bio')),
  original_text TEXT,
  structured_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one content per type per user
  UNIQUE(user_id, content_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_content_user_id ON user_content(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_type ON user_content(content_type);
CREATE INDEX IF NOT EXISTS idx_user_content_created_at ON user_content(created_at);

-- Enable RLS
ALTER TABLE user_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_content
CREATE POLICY "Users can view their own content"
  ON user_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content"
  ON user_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content"
  ON user_content FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
  ON user_content FOR DELETE
  USING (auth.uid() = user_id);

-- Create functions to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_connected_platforms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updated_at updates
CREATE TRIGGER trigger_connected_platforms_updated_at
  BEFORE UPDATE ON connected_platforms
  FOR EACH ROW
  EXECUTE FUNCTION update_connected_platforms_updated_at();

CREATE TRIGGER trigger_user_content_updated_at
  BEFORE UPDATE ON user_content
  FOR EACH ROW
  EXECUTE FUNCTION update_user_content_updated_at();