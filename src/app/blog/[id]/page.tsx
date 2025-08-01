"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import TipTapContent from "@/components/TipTapContent";

interface Post {
  id: string;
  title: string;
  content: string;
  media_urls: string[];
  created_at: string;
}

interface RelatedPost {
  id: string;
  title: string;
}

export default function SingleBlogPage() {
  const { id } = useParams();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [prevPost, setPrevPost] = useState<RelatedPost | null>(null);
  const [nextPost, setNextPost] = useState<RelatedPost | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchPost(id as string);
  }, [id]);

  const fetchPost = async (postId: string) => {
    setLoading(true);

    try {
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (postError) throw postError;
      setPost(postData);

      const { data: relatedData, error: relatedError } = await supabase.rpc(
        "get_related_posts",
        { post_id: postId },
      );
      if (relatedError) console.error("Related posts error:", relatedError);
      else setRelatedPosts(relatedData || []);

      const { data: prevData } = await supabase
        .from("posts")
        .select("id, title")
        .lt("created_at", postData.created_at)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { data: nextData } = await supabase
        .from("posts")
        .select("id, title")
        .gt("created_at", postData.created_at)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      setPrevPost(prevData || null);
      setNextPost(nextData || null);
    } catch (err) {
      console.error("Failed to fetch post:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-cyan-400">
        Loading post...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-red-400">
        Post not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto bg-white/5 rounded-2xl p-6 border border-cyan-400/20 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl"
      >
        <h1 className="text-4xl font-bold text-cyan-400 mb-4 text-center tracking-wider">
          {post.title}
        </h1>

        {post.media_urls?.length > 0 && (
          <div className="mb-6">
            {post.media_urls.map((url, i) => (
              <motion.img
                key={i}
                src={url}
                alt={`media-${i}`}
                className="w-full rounded-lg mb-4 shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.2 }}
              />
            ))}
          </div>
        )}

        <TipTapContent content={post.content} />

        <div className="flex justify-between mt-10">
          {prevPost ? (
            <button
              onClick={() => router.push(`/blog/${prevPost.id}`)}
              className="px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400"
            >
              ← {prevPost.title}
            </button>
          ) : (
            <div />
          )}
          {nextPost ? (
            <button
              onClick={() => router.push(`/blog/${nextPost.id}`)}
              className="px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400"
            >
              {nextPost.title} →
            </button>
          ) : (
            <div />
          )}
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-cyan-300 mb-4">
              Related Posts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedPosts.map((rp) => (
                <motion.div
                  key={rp.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => router.push(`/blog/${rp.id}`)}
                  className="p-4 bg-white/10 rounded-lg hover:bg-white/20 cursor-pointer"
                >
                  {rp.title}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
