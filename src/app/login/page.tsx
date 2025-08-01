"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ensureProfile } from "@/lib/supabase-profiles";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function FuturisticLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      try {
        await ensureProfile(data.user);
      } catch (err) {
        console.error("Failed to ensure profile:", err);
      }
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-cyan-400/30 shadow-[0_0_25px_rgba(0,255,255,0.3)]"
      >
        <h1 className="text-3xl font-bold text-center text-cyan-400 tracking-widest mb-6">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <FuturisticInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <FuturisticInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px #00ffff" }}
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold text-lg tracking-wide"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        <p className="mt-6 text-sm text-center text-cyan-200/70">
          Don’t have an account?{" "}
          <a
            className="text-cyan-400 hover:text-cyan-300 transition underline underline-offset-4"
            href="/signup"
          >
            Sign Up
          </a>
        </p>
      </motion.div>
    </div>
  );
}

function FuturisticInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-lg bg-black/30 text-cyan-100 placeholder-cyan-400/50 border border-cyan-500/30 focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
    />
  );
}
