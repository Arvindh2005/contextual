"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      <div className="flex-1">
        <Link href="/" className="text-xl font-bold">
          ContextualApp
        </Link>
      </div>
      <div className="flex-none">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="font-medium">Hi, {user.email}</span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn btn-primary btn-sm">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
