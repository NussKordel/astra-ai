import { NextRequest, NextResponse } from "next/server";
import { openrouter, MODELS } from "@/lib/openrouter/client";
import { createClient } from "@/lib/supabase/server";
import { tutorSystemPrompt } from "@/lib/openrouter/prompts/tutor";

async function ensureProfile(supabase: any, userId: string) {
  const { data: existing } = await supabase.from("profiles").select("id").eq("id", userId).single();
  if (!existing) {
    await supabase.from("profiles").insert({
      id: userId,
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { conversationId, content, imageUrl } = await request.json();

    const supabase = createClient();

    const { data: conversation } = await supabase
      .from("conversations")
      .select("subject, user_id")
      .eq("id", conversationId)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    await ensureProfile(supabase, conversation.user_id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("grade_level")
      .eq("id", conversation.user_id)
      .single();

    const gradeLevel = profile?.grade_level || "Klasse 10";

    const { data: messages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    const systemPrompt = tutorSystemPrompt(conversation.subject, gradeLevel);

    const conversationHistory =
      (messages as Array<{ role: string; content: string }> | null)?.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })) || [];

    const userMessageContent = imageUrl
      ? [
          { type: "text" as const, text: content },
          { type: "image_url" as const, image_url: { url: imageUrl } },
        ]
      : content;

    const response = await openrouter.chat.completions.create({
      model: imageUrl ? MODELS.vision : MODELS.default,
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: userMessageContent },
      ],
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response as any) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
