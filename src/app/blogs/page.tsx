"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Post {
  id: string;
  title: string;
  content: string;
  media_urls: string[];
  created_at: string;
  post_tags: { tags: { name: string } }[];
}

const PAGE_SIZE = 6;

export default function BlogsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const router = useRouter();
  const page = useRef(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchPosts(0, searchQuery, activeTag);
  }, [searchQuery, activeTag]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchPosts(page.current + 1, searchQuery, activeTag);
      }
    });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, searchQuery, activeTag]);

  const fetchPosts = async (
    pageIndex: number,
    search: string,
    tag: string | null,
  ) => {
    if (pageIndex === 0) setLoading(true);
    else setLoadingMore(true);

    let query = supabase
      .from("posts")
      .select(
        "id, title, content, media_urls, created_at, post_tags(tags(name))",
      )
      .order("created_at", { ascending: false })
      .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1);

    if (search) {
      query = query.textSearch("title", search, { type: "websearch" });
    }

    const { data, error } = await query;
    if (error) console.error("Error fetching posts:", error);
    else {
      const filteredData = tag
        ? (data || []).filter((p) =>
            p.post_tags.some((t) => t.tags.name === tag),
          )
        : data || [];

      if (pageIndex === 0) setPosts(filteredData);
      else setPosts((prev) => [...prev, ...filteredData]);

      setHasMore((filteredData.length || 0) === PAGE_SIZE);
      page.current = pageIndex;
    }

    setLoading(false);
    setLoadingMore(false);
  };

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((post) =>
      post.post_tags.forEach((pt) => tagSet.add(pt.tags.name)),
    );
    return Array.from(tagSet);
  }, [posts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-2xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ boxShadow: "0 0 20px #00ffff" }}
          className="rounded-xl border border-cyan-400/30 shadow-[0_0_20px_rgba(0,255,255,0.2)] bg-black/40 backdrop-blur-md p-1"
        >
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-transparent text-cyan-100 outline-none placeholder-cyan-400 text-lg"
          />
        </motion.div>
      </div>

      {allTags.length > 0 && (
        <div className="max-w-2xl mx-auto mb-8 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-3 py-1 rounded-full text-sm font-semibold border ${
              activeTag === null
                ? "bg-cyan-500 text-black border-cyan-500"
                : "bg-black/30 text-cyan-300 border-cyan-400/40 hover:bg-cyan-500/30"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                activeTag === tag
                  ? "bg-cyan-500 text-black border-cyan-500"
                  : "bg-black/30 text-cyan-300 border-cyan-400/40 hover:bg-cyan-500/30"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <SkeletonGrid />
      ) : posts.length === 0 ? (
        <p className="text-center text-cyan-300">No posts found.</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => router.push(`/blog/${post.id}`)}
                className="cursor-pointer bg-white/5 rounded-xl p-4 border border-cyan-400/30 shadow-[0_0_20px_rgba(0,255,255,0.2)] backdrop-blur-xl"
              >
                {post.media_urls?.[0] && (
                  <img
                    src={post.media_urls[0]}
                    alt="Post preview"
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}
                <h2 className="text-xl font-bold text-cyan-300">
                  {post.title}
                </h2>
                <p className="text-gray-300 text-sm mt-1 line-clamp-3">
                  {post.content.replace(/<[^>]*>/g, "").slice(0, 120)}...
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.post_tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/50"
                    >
                      {tag.tags.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {loadingMore && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full"
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="animate-pulse bg-white/5 rounded-xl p-4 border border-cyan-400/20 backdrop-blur-xl"
        >
          <div className="w-full h-40 bg-cyan-900/30 rounded-lg mb-3"></div>
          <div className="h-4 bg-cyan-900/30 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-cyan-900/30 rounded w-full mb-2"></div>
          <div className="h-3 bg-cyan-900/30 rounded w-5/6"></div>
        </motion.div>
      ))}
    </div>
  );
}
