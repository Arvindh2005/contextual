"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TestPage() {
  const [status, setStatus] = useState("Testing...");

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setStatus("Supabase is connected ✅");
      } catch (err) {
        setStatus("❌ Supabase not working: " + (err as Error).message);
      }
    };

    checkSupabase();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="p-6 bg-base-100 rounded-lg shadow-md">
        <h1 className="text-xl font-bold">{status}</h1>
      </div>
    </div>
  );
}
