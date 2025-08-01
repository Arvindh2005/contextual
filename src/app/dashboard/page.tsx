"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { supabase } from "@/lib/supabaseClient";
import { fetchProfile } from "@/lib/supabase-profiles";
import type { Profile } from "@/app/profile/prof";

export default function FuturisticDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      console.group("[Dashboard Load]");
      console.log("[Auth] Checking user...");
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!user || error) {
        console.error("[Auth Error]", error);
        router.push("/login");
        return;
      }
      console.log("[Auth] User ID:", user.id);

      console.log("[Profile] Fetching profile...");
      const p = await fetchProfile(user.id);
      console.log("[Profile Data]", p);
      setProfile(p);
      setLoading(false);
      console.groupEnd();
    })();
  }, [router]);

  const themeToken = useMemo(() => {
    if (!profile) return "dark";
    return ["light", "dark", "system"].includes(profile.theme_preference)
      ? profile.theme_preference
      : "dark";
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner label="Loading futuristic dashboard..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-cyan-300">
        <p className="mb-4 opacity-70">No profile found.</p>
        <Link href="/profile" className="btn btn-primary">
          Create Profile
        </Link>
      </div>
    );
  }

  const displayName = profile.full_name || profile.username;
  const verified = profile.is_verified;
  const points = profile.points ?? 0;
  const level =
    profile.level !== null && profile.level !== undefined
      ? Number(profile.level)
      : 1;
  const nextLevelAt = level * 100;
  const progressPct = Math.min(100, Math.round((points / nextLevelAt) * 100));

  return (
    <div
      data-theme={themeToken}
      className="relative min-h-screen w-full overflow-x-hidden px-4 sm:px-8 pb-24 bg-gradient-to-br from-black via-gray-900 to-black text-cyan-300"
    >
      <BackgroundGlows />
      <div className="h-16" />

      <div className="mx-auto max-w-6xl w-full space-y-10">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl border border-cyan-400/30 bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_25px_rgba(0,255,255,0.3)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <UserAvatar
                url={profile.avatar_url}
                name={displayName}
                size={72}
              />
              <div>
                <h1 className="text-3xl font-bold tracking-widest text-cyan-400">
                  {displayName}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-cyan-200/70">
                  <span>@{profile.username}</span>
                  {verified && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200">
                      VERIFIED
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link
              href="/profile"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-bold shadow-lg hover:shadow-cyan-400/50 transition"
            >
              Edit Profile
            </Link>
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <StatPanel
            label="Points"
            value={points.toLocaleString()}
            desc="Earn by engaging"
            accent="cyan"
          />
          <StatPanel
            label="Level"
            value={level.toString()}
            desc={`Next at ${nextLevelAt}`}
            accent="purple"
          />
          <StatPanel
            label="Progress"
            value={`${progressPct}%`}
            desc="Toward next level"
            accent="blue"
            progress={progressPct}
          />
        </motion.section>

        <ActionsGrid />

        <ActivitySection />
      </div>
    </div>
  );
}

function BackgroundGlows() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-[160px]" />
      <div className="absolute top-20 -right-20 h-72 w-72 rounded-full bg-purple-500/10 blur-[140px]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-96 w-[32rem] rounded-full bg-blue-500/5 blur-[180px]" />
    </div>
  );
}

function UserAvatar({
  url,
  name,
  size = 64,
}: {
  url: string | null;
  name: string;
  size?: number;
}) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div
      className="relative rounded-full ring-2 ring-cyan-400/30 overflow-hidden flex items-center justify-center bg-black/30 text-cyan-200 font-semibold text-lg shadow-lg"
      style={{ width: size, height: size }}
    >
      {url ? (
        <Image
          src={url}
          alt="user avatar"
          width={size}
          height={size}
          className="object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

interface StatPanelProps {
  label: string;
  value: string;
  desc?: string;
  accent?: "cyan" | "purple" | "blue";
  progress?: number;
}
function StatPanel({
  label,
  value,
  desc,
  accent = "cyan",
  progress,
}: StatPanelProps) {
  return (
    <div
      className={`rounded-xl border border-${accent}-400/30 bg-black/20 p-6 shadow-[0_0_20px_rgba(0,255,255,0.15)] hover:scale-[1.02] transition-transform`}
    >
      <p className="text-sm uppercase tracking-wider text-cyan-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {desc && <p className="mt-1 text-xs text-cyan-200/70">{desc}</p>}
      {typeof progress === "number" && (
        <div className="mt-4 w-full bg-cyan-900/30 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ActionsGrid() {
  const actions = [
    {
      title: "Upload",
      desc: "Docs, PDFs, images",
      href: "/upload",
      btn: "Upload",
    },
    {
      title: "AI Search",
      desc: "Semantic search your knowledge",
      href: "/search",
      btn: "Search",
    },
    { title: "Polls", desc: "Create & vote", href: "/polls", btn: "Open" },
    {
      title: "Quizzes",
      desc: "Gamified learning",
      href: "/quizzes",
      btn: "Start",
    },
  ];
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 text-cyan-300">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {actions.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="group rounded-xl border border-cyan-400/20 bg-black/20 p-5 backdrop-blur-md shadow hover:scale-[1.02] transition"
          >
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">
              {a.title}
            </h3>
            <p className="text-sm text-cyan-200/70 mb-4">{a.desc}</p>
            <span className="px-3 py-1 text-xs font-semibold rounded bg-gradient-to-r from-cyan-500 to-purple-600 text-black">
              {a.btn}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ActivitySection() {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 text-cyan-300">
        Recent Activity
      </h2>
      <div className="rounded-xl border border-cyan-400/20 bg-black/20 p-6 text-cyan-200/70">
        Nothing yet. Upload something or create a poll!
      </div>
    </section>
  );
}

function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-cyan-300">
      <span className="loading loading-spinner loading-lg text-cyan-400" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
