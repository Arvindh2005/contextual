import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { pipeline } from "@xenova/transformers";

const embedder = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2",
);

export async function POST(req: NextRequest) {
  try {
    const { postId, content } = await req.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: "Missing postId or content" },
        { status: 400 },
      );
    }

    const embedding = await embedder(content, {
      pooling: "mean",
      normalize: true,
    });

    const client = createClient();

    const { error } = await client.from("post_embeddings").upsert({
      post_id: String(postId), // cast if needed
      embedding: JSON.stringify(embedding.data),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Embedding Error]", error);
    return NextResponse.json(
      { error: "Failed to embed post" },
      { status: 500 },
    );
  }
}
