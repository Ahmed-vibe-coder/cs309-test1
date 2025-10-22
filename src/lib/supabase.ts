import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  banner_url?: string;
  description?: string;
  subscriber_count: number;
  created_at: string;
  updated_at: string;
};

export type Video = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  view_count: number;
  like_count: number;
  dislike_count: number;
  category: string;
  tags: string[];
  status: 'processing' | 'published' | 'private' | 'unlisted';
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type Comment = {
  id: string;
  video_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  like_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  replies?: Comment[];
};

export type Subscription = {
  id: string;
  subscriber_id: string;
  channel_id: string;
  notifications_enabled: boolean;
  created_at: string;
};

export type Playlist = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  visibility: 'public' | 'private' | 'unlisted';
  created_at: string;
  updated_at: string;
};
