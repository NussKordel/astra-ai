"use server";

import { openrouter, MODELS } from "@/lib/openrouter/client";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { tutorSystemPrompt } from "@/lib/openrouter/prompts/tutor";

async function ensureProfile(supabase: any, userId: string) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existing) {
    await supabase.from("profiles").insert({
      id: userId,
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
}

export async function sendMessage(
  conversationId: string,
  content: string,
  imageUrl?: string
) {
  const supabase = createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("subject, user_id")
    .eq("id", conversationId)
    .single();

  if (!conversation) throw new Error("Conversation not found");

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

  return response;
}

export async function createConversation(subject: string, userId: string) {
  const supabase = createClient();
  await ensureProfile(supabase, userId);

  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, subject, module: "tutor" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  imageUrl?: string
) {
  const supabase = createClient();
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
    image_url: imageUrl || null,
  });
  if (error) throw error;
}

// Upload with Service Role (bypasses RLS)
export async function uploadHomeworkImage(formData: FormData) {
  const serviceSupabase = createServiceClient();
  const file = formData.get("file") as File;

  if (!file) throw new Error("No file provided");

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { data, error } = await serviceSupabase.storage
    .from("homework-images")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = serviceSupabase.storage
    .from("homework-images")
    .getPublicUrl(fileName);

  return publicUrl;
}

// Upload PDF with Service Role
export async function uploadPDF(formData: FormData) {
  const serviceSupabase = createServiceClient();
  const file = formData.get("file") as File;

  if (!file) throw new Error("No file provided");
  if (file.type !== "application/pdf") throw new Error("Only PDF files allowed");

  const fileName = `pdf-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;

  const { data, error } = await serviceSupabase.storage
    .from("homework-images")
    .upload(fileName, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    console.error("PDF upload error:", error);
    throw new Error(`PDF upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = serviceSupabase.storage
    .from("homework-images")
    .getPublicUrl(fileName);

  return publicUrl;
}
