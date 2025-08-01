"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  Code,
  ImageIcon,
} from "lucide-react";

export default function TiptapToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const addImage = () => {
    const url = prompt("Enter image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-2 mb-2 bg-black/50 p-2 rounded-lg border border-cyan-400/30">
      <button
        className="btn-toolbar"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        className="btn-toolbar"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        className="btn-toolbar"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        className="btn-toolbar"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        className="btn-toolbar"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        className="btn-toolbar"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="w-4 h-4" />
      </button>
      <button className="btn-toolbar" onClick={addImage}>
        <ImageIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
