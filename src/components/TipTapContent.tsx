"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import { motion } from "framer-motion";

interface TipTapContentProps {
  content: string;
}

export default function TipTapContent({ content }: TipTapContentProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure the component only renders on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: true }),
      Image,
      Typography,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    editable: false,
    immediatelyRender: false, // Fix hydration issues with SSR
  });

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="prose prose-invert max-w-none leading-relaxed text-gray-200"
    >
      <EditorContent editor={editor} />
    </motion.div>
  );
}
