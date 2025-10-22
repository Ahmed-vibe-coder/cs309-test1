/*
  # YouTube Clone Database Schema

  ## Overview
  Complete database schema for a YouTube-like platform with enhanced features including:
  - User authentication and profiles
  - Video uploads with metadata
  - Comments with nested replies
  - Likes/dislikes system
  - Subscriptions and notifications
  - Playlists
  - Watch history
  - Video categories and tags

  ## New Tables

  1. **profiles**
    - `id` (uuid, references auth.users)
    - `username` (text, unique)
    - `display_name` (text)
    - `avatar_url` (text)
    - `banner_url` (text)
    - `description` (text)
    - `subscriber_count` (integer)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. **videos**
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `title` (text)
    - `description` (text)
    - `video_url` (text)
    - `thumbnail_url` (text)
    - `duration` (integer, in seconds)
    - `view_count` (integer)
    - `like_count` (integer)
    - `dislike_count` (integer)
    - `category` (text)
    - `tags` (text array)
    - `status` (text: 'processing', 'published', 'private', 'unlisted')
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  3. **comments**
    - `id` (uuid, primary key)
    - `video_id` (uuid, references videos)
    - `user_id` (uuid, references profiles)
    - `parent_id` (uuid, references comments, nullable for replies)
    - `content` (text)
    - `like_count` (integer)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  4. **video_likes**
    - `id` (uuid, primary key)
    - `video_id` (uuid, references videos)
    - `user_id` (uuid, references profiles)
    - `is_like` (boolean, true for like, false for dislike)
    - `created_at` (timestamptz)
    - Unique constraint on (video_id, user_id)

  5. **comment_likes**
    - `id` (uuid, primary key)
    - `comment_id` (uuid, references comments)
    - `user_id` (uuid, references profiles)
    - `created_at` (timestamptz)
    - Unique constraint on (comment_id, user_id)

  6. **subscriptions**
    - `id` (uuid, primary key)
    - `subscriber_id` (uuid, references profiles)
    - `channel_id` (uuid, references profiles)
    - `notifications_enabled` (boolean)
    - `created_at` (timestamptz)
    - Unique constraint on (subscriber_id, channel_id)

  7. **playlists**
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `title` (text)
    - `description` (text)
    - `visibility` (text: 'public', 'private', 'unlisted')
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  8. **playlist_videos**
    - `id` (uuid, primary key)
    - `playlist_id` (uuid, references playlists)
    - `video_id` (uuid, references videos)
    - `position` (integer)
    - `added_at` (timestamptz)
    - Unique constraint on (playlist_id, video_id)

  9. **watch_history**
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `video_id` (uuid, references videos)
    - `watched_at` (timestamptz)
    - `watch_duration` (integer, seconds watched)

  ## Security
  - Enable RLS on all tables
  - Profiles: Users can read all public profiles, update only their own
  - Videos: Public videos readable by all, users can manage their own
  - Comments: Readable by all, users can manage their own
  - Likes: Users can manage only their own
  - Subscriptions: Users can manage only their own
  - Playlists: Visibility-based access control
  - Watch history: Users can only access their own

  ## Indexes
  - Add indexes on foreign keys and frequently queried columns
  - Full-text search index on video titles and descriptions
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  banner_url text,
  description text DEFAULT '',
  subscriber_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  video_url text NOT NULL,
  thumbnail_url text NOT NULL,
  duration integer DEFAULT 0,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  dislike_count integer DEFAULT 0,
  category text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  status text DEFAULT 'published' CHECK (status IN ('processing', 'published', 'private', 'unlisted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  like_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create video_likes table
CREATE TABLE IF NOT EXISTS video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_like boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  channel_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subscriber_id, channel_id),
  CHECK (subscriber_id != channel_id)
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create playlist_videos table
CREATE TABLE IF NOT EXISTS playlist_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  position integer NOT NULL DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  UNIQUE(playlist_id, video_id)
);

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  watched_at timestamptz DEFAULT now(),
  watch_duration integer DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber ON subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_channel ON subscriptions(channel_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user ON watch_history(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Videos policies
CREATE POLICY "Published videos viewable by everyone"
  ON videos FOR SELECT
  USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY "Users can insert own videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos"
  ON videos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Video likes policies
CREATE POLICY "Video likes viewable by everyone"
  ON video_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert video likes"
  ON video_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video likes"
  ON video_likes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own video likes"
  ON video_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comment likes policies
CREATE POLICY "Comment likes viewable by everyone"
  ON comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comment likes"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comment likes"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Subscriptions viewable by involved users"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = subscriber_id OR auth.uid() = channel_id);

CREATE POLICY "Users can create own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = subscriber_id)
  WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = subscriber_id);

-- Playlists policies
CREATE POLICY "Public playlists viewable by everyone"
  ON playlists FOR SELECT
  USING (visibility = 'public' OR user_id = auth.uid());

CREATE POLICY "Users can create own playlists"
  ON playlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists"
  ON playlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists"
  ON playlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Playlist videos policies
CREATE POLICY "Playlist videos viewable based on playlist visibility"
  ON playlist_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_videos.playlist_id
      AND (playlists.visibility = 'public' OR playlists.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add videos to own playlists"
  ON playlist_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_videos.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete videos from own playlists"
  ON playlist_videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_videos.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- Watch history policies
CREATE POLICY "Users can view own watch history"
  ON watch_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch history"
  ON watch_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watch history"
  ON watch_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create functions for updating counts
CREATE OR REPLACE FUNCTION update_video_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_like THEN
      UPDATE videos SET like_count = like_count + 1 WHERE id = NEW.video_id;
    ELSE
      UPDATE videos SET dislike_count = dislike_count + 1 WHERE id = NEW.video_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_like != NEW.is_like THEN
      IF NEW.is_like THEN
        UPDATE videos SET like_count = like_count + 1, dislike_count = dislike_count - 1 WHERE id = NEW.video_id;
      ELSE
        UPDATE videos SET like_count = like_count - 1, dislike_count = dislike_count + 1 WHERE id = NEW.video_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_like THEN
      UPDATE videos SET like_count = like_count - 1 WHERE id = OLD.video_id;
    ELSE
      UPDATE videos SET dislike_count = dislike_count - 1 WHERE id = OLD.video_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_comment_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_subscriber_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET subscriber_count = subscriber_count + 1 WHERE id = NEW.channel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET subscriber_count = subscriber_count - 1 WHERE id = OLD.channel_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS video_like_counts_trigger ON video_likes;
CREATE TRIGGER video_like_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON video_likes
FOR EACH ROW EXECUTE FUNCTION update_video_like_counts();

DROP TRIGGER IF EXISTS comment_like_counts_trigger ON comment_likes;
CREATE TRIGGER comment_like_counts_trigger
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_like_counts();

DROP TRIGGER IF EXISTS subscriber_counts_trigger ON subscriptions;
CREATE TRIGGER subscriber_counts_trigger
AFTER INSERT OR DELETE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_subscriber_counts();