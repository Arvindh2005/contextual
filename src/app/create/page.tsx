"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import TiptapEditor from "./TipTapEditor";

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  async function embedPost(postId: number, content: string) {
    try {
      const res = await fetch("/api/embed-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON response: ${text}`);
      }

      if (!res.ok) throw new Error(data.error || "Embedding failed");

      console.log("[Embedding] Success", data);
    } catch (err) {
      console.error("[Embedding] Error:", err);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags((prev) => [...prev, newTag]);
      setNewTag("");
    }
  };

  const handleSubmit = async () => {
    if (!title) return alert("Title is required");
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("User not logged in.");

      const uploadedUrls: string[] = [];
      for (const file of files) {
        const filePath = `posts/${user.id}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("post-media")
          .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("post-media")
          .getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }

      const { data: postData, error: insertError } = await supabase
        .from("posts")
        .insert({
          title,
          content,
          media_urls: uploadedUrls,
          user_id: user.id,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      await embedPost(postData.id, content);

      for (const tag of tags) {
        const { data: tagData, error: tagError } = await supabase
          .from("tags")
          .upsert({ name: tag })
          .select("id")
          .single();
        if (tagError) console.warn("[Tags] Upsert error:", tagError);

        if (tagData) {
          const { error: ptError } = await supabase.from("post_tags").insert({
            post_id: postData.id,
            tag_id: tagData.id,
          });
          if (ptError) console.warn("[Tags] post_tags insert error:", ptError);
        }
      }

      alert("Post created!");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("[Post Creation Error]", err);
      alert(`Failed to create post: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl p-6 rounded-2xl bg-white/5 border border-cyan-400/30 shadow-[0_0_40px_rgba(0,255,255,0.3)] backdrop-blur-xl"
      >
        <h1 className="text-3xl font-bold text-center text-cyan-400 mb-6 tracking-widest">
          Create Post
        </h1>

        <FuturisticInput
          label="Title"
          placeholder="Enter post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TiptapEditor content={content} onChange={(val) => setContent(val)} />

        <div className="mt-4">
          <label className="text-cyan-300 text-sm font-semibold tracking-wider">
            Tags
          </label>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 rounded-md bg-black/30 text-cyan-100 border border-cyan-500/30 focus:ring-2 focus:ring-cyan-400 outline-none"
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 rounded-md bg-cyan-500 text-black font-bold hover:bg-cyan-400"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-cyan-300 text-sm font-semibold tracking-wider">
            Upload Files
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mt-2 block w-full text-sm text-cyan-100"
          />
          <ul className="mt-2 text-xs text-cyan-400">
            {files.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px #00ffff" }}
          className="w-full mt-6 py-3 text-lg font-bold tracking-wide rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish"}
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
    <label className="block text-cyan-300 text-sm font-semibold tracking-wider mb-4">
      {label}
      <input
        {...props}
        className="mt-1 w-full px-3 py-2 rounded-md bg-black/30 text-cyan-100 border border-cyan-500/30 focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
      />
    </label>
  );
}
