"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

interface Profile {
  username: string;
  full_name: string;
  bio: string;
  theme_preference: "light" | "dark" | "system";
  avatar_url: string;
}

const AVATAR_BUCKET = "avatars";

export default function FuturisticProfile() {
  const [profile, setProfile] = useState<Profile>({
    username: "randomcyborg222",
    full_name: "",
    bio: "",
    theme_preference: "light",
    avatar_url: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log("[Avatar] Selected file:", file.name, file.size, file.type);

    setAvatarFile(file);

    const localUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, avatar_url: localUrl }));
  };

  const handleSave = async () => {
    console.group("ProfileSave");
    setLoading(true);

    try {
      console.log("[Auth] Fetching current user...");
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      console.log("[Auth] Result:", { user, userError });

      if (userError) throw userError;
      if (!user) throw new Error("User not logged in.");

      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        console.log("[Storage] Uploading avatar...");
        const ext = avatarFile.name.split(".").pop() ?? "png";
        const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;
        console.log("[Storage] Path:", filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(filePath, avatarFile, { upsert: true });

        console.log("[Storage] Upload response:", { uploadData, uploadError });
        if (uploadError) {
          if ((uploadError as any).statusCode === "404") {
            console.error(
              "Upload failed: Bucket may not exist. Create a bucket named:",
              AVATAR_BUCKET,
            );
          }
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from(AVATAR_BUCKET)
          .getPublicUrl(uploadData.path);

        avatarUrl = publicUrlData.publicUrl;
        console.log("[Storage] Public URL:", avatarUrl);
      } else {
        console.log("[Storage] No new avatar selected; keeping existing URL.");
      }

      console.log("[DB] Updating profile row...");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          full_name: profile.full_name,
          bio: profile.bio,
          theme_preference: profile.theme_preference,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      console.log("[DB] Update response:", { updateError });
      if (updateError) throw updateError;

      console.log("[DB] Profile updated successfully.");
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("[Save Error]", err);
      alert("Error saving profile. See console for details.");
    } finally {
      console.groupEnd();
      setLoading(false);
    }
  };

  const avatarSrc =
    profile.avatar_url && !profile.avatar_url.startsWith("blob:")
      ? profile.avatar_url
      : profile.avatar_url || "/default-avatar.png";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md rounded-2xl p-6 backdrop-blur-xl bg-white/5 shadow-[0_0_30px_rgba(0,255,255,0.3)] border border-cyan-400/30"
      >
        <h2 className="text-3xl font-bold text-cyan-400 text-center mb-6 tracking-widest">
          Your Profile
        </h2>

        <div className="flex justify-center mb-5">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-500 p-[3px] animate-spin-slow">
              <img
                src={avatarSrc}
                alt="avatar"
                className="w-full h-full rounded-full object-cover border-4 border-black"
              />
            </div>
            <input
              id="avatarUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <label
              htmlFor="avatarUpload"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 px-3 py-1 text-xs bg-cyan-600/80 text-black font-semibold rounded cursor-pointer opacity-0 group-hover:opacity-100 transition"
            >
              Change
            </label>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <FuturisticInput
            label="Username"
            value={profile.username}
            onChange={(e) =>
              setProfile({ ...profile, username: e.target.value })
            }
          />
          <FuturisticInput
            label="Full Name"
            value={profile.full_name}
            onChange={(e) =>
              setProfile({ ...profile, full_name: e.target.value })
            }
          />
          <FuturisticTextarea
            label="Bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
          <FuturisticSelect
            label="Theme Preference"
            value={profile.theme_preference}
            onChange={(e) =>
              setProfile({
                ...profile,
                theme_preference: e.target.value as Profile["theme_preference"],
              })
            }
          />
        </div>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px #00ffff" }}
          className="w-full mt-6 py-3 text-lg font-bold tracking-wide rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </motion.button>
      </motion.div>
    </div>
  );
}

function FuturisticInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-cyan-300 text-sm font-semibold tracking-wider">
      {label}
      <input
        {...props}
        className="mt-1 w-full px-3 py-2 rounded-md bg-black/30 text-cyan-100 border border-cyan-500/30 focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
      />
    </label>
  );
}

function FuturisticTextarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block text-cyan-300 text-sm font-semibold tracking-wider">
      {label}
      <textarea
        {...props}
        className="mt-1 w-full px-3 py-2 rounded-md bg-black/30 text-cyan-100 border border-cyan-500/30 focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
      />
    </label>
  );
}

function FuturisticSelect({
  label,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="block text-cyan-300 text-sm font-semibold tracking-wider">
      {label}
      <select
        {...props}
        className="mt-1 w-full px-3 py-2 rounded-md bg-black/30 text-cyan-100 border border-cyan-500/30 focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  );
}
