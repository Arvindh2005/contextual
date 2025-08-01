"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ensureProfile } from "@/lib/supabase-profiles";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function FuturisticSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      if (data?.user) {
        try {
          await ensureProfile(data.user);
        } catch (err) {
          console.error("Profile creation failed:", err);
        }
      }
      alert("Signup successful! Check your email for confirmation.");
      router.push("/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-purple-400/30 shadow-[0_0_25px_rgba(200,100,255,0.3)]"
      >
        <h1 className="text-3xl font-bold text-center text-purple-400 tracking-widest mb-6">
          Sign Up
        </h1>

        <form onSubmit={handleSignup} className="space-y-5">
          <FuturisticInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <FuturisticInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px #c864ff" }}
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-black font-semibold text-lg tracking-wide"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </motion.button>
        </form>

        <p className="mt-6 text-sm text-center text-cyan-200/70">
          Already have an account?{" "}
          <a
            className="text-purple-400 hover:text-purple-300 transition underline underline-offset-4"
            href="/login"
          >
            Login
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
      className="w-full px-4 py-3 rounded-lg bg-black/30 text-cyan-100 placeholder-purple-300/50 border border-purple-500/30 focus:ring-2 focus:ring-purple-400 outline-none transition-all"
    />
  );
}
