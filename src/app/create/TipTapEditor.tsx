"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { lowlight } from "lowlight/lib/common";
import { useEffect } from "react";
import TiptapToolbar from "./TipTapToolbar";

export interface TiptapEditorProps {
  content?: string;
  onChange?: (value: string) => void;
}

export default function TiptapEditor({
  content = "",
  onChange,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      ListItem,
      CodeBlockLowlight.configure({ lowlight }),
      Image,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="mt-4">
      <TiptapToolbar editor={editor} />
      <div className="border border-cyan-500/30 rounded-lg bg-black/30 p-2 min-h-[200px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
