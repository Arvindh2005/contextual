import { supabase } from "@/lib/supabaseClient";
import type { Profile } from "@/app/profile/prof";
import type { User } from "@supabase/supabase-js";

/** Fetch the full profile for a user. */
export async function fetchProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("fetchProfile error:", error);
    return null;
  }
  return data as Profile | null;
}

/** Ensure the user has a full profile row; create with defaults if missing. */
export async function ensureProfile(user: User): Promise<Profile | null> {
  const existing = await fetchProfile(user.id);
  if (existing) {
    // Update last_seen
    await supabase
      .from("profiles")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", user.id);
    return existing;
  }

  const defaultUsername =
    user.email
      ?.split("@")[0]
      ?.replace(/[^a-zA-Z0-9_]/g, "_")
      .slice(0, 30) ?? `user_${user.id.slice(0, 8)}`;

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      username: defaultUsername,
      full_name: user.user_metadata?.full_name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      bio: null,
      points: 0,
      level: 1,
      is_verified: false,
      theme_preference: "light",
      preferences: {},
      badges: {},
      followers_count: 0,
      last_seen: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    console.error("ensureProfile insert error:", error);
    return null;
  }
  return data as Profile;
}

/** Update profile fields. */
export async function saveProfile(updates: Profile): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({
      username: updates.username,
      full_name: updates.full_name,
      avatar_url: updates.avatar_url,
      bio: updates.bio,
      points: updates.points,
      level: updates.level,
      is_verified: updates.is_verified,
      theme_preference: updates.theme_preference,
      preferences: updates.preferences,
      badges: updates.badges,
      followers_count: updates.followers_count,
      updated_at: new Date().toISOString(),
    })
    .eq("id", updates.id);

  if (error) {
    console.error("saveProfile error:", error);
    return false;
  }
  return true;
}
