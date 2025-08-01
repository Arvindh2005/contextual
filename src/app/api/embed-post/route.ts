import { NextRequest, NextResponse } from "next/server";
import { pipeline } from "@xenova/transformers";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const embedder = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2",
);

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const access_token =
      cookieStore.get("sb-your-project-ref-auth-token")?.value ?? null;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        global: {
          headers: {
            Authorization: access_token ? `Bearer ${access_token}` : "",
          },
        },
      },
    );

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

    const embeddingArray = Object.values(embedding.data);

    const embeddingLiteral = JSON.stringify(embeddingArray);

    const { error } = await supabase.from("post_embeddings").upsert({
      post_id: String(postId),
      embedding: embeddingLiteral,
    });

    if (error) {
      console.error("[Supabase Upsert Error]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Embedding Error]", err);
    return NextResponse.json(
      { error: "Failed to embed post" },
      { status: 500 },
    );
  }
}
