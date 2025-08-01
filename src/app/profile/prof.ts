export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  points: number;
  level: number;
  is_verified: boolean;
  theme_preference: string;
  preferences: Record<string, unknown> | null;
  badges: Record<string, unknown> | null;
  followers_count: number;
  last_seen: string | null;
  last_activity: string | null;
  created_at: string | null;
  updated_at: string | null;
};
