"use server";

import { openrouter, MODELS } from "@/lib/openrouter/client";
import { createClient } from "@/lib/supabase/server";
import { tutorSystemPrompt } from "@/lib/openrouter/prompts/tutor";

export async function sendMessage(
  conversationId: string,
  content: string,
  imageUrl?: string
) {
  const supabase = createClient();

  // Get conversation details
  const { data: conversation } = await supabase
    .from("conversations")
    .select("subject, user_id")
    .eq("id", conversationId)
    .single();

  if (!conversation) throw new Error("Conversation not found");

  // Get user's grade level
  const { data: profile } = await supabase
    .from("profiles")
    .select("grade_level")
    .eq("id", conversation.user_id)
    .single();

  const gradeLevel = profile?.grade_level || "Klasse 10";

  // Get conversation history
  const { data: messages } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const systemPrompt = tutorSystemPrompt(conversation.subject, gradeLevel);

  const conversationHistory = (messages as Array<{ role: string; content: string }> | null)?.map((m: { role: string; content: string }) => ({
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

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      subject,
      module: "tutor",
    })
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

export async function uploadHomeworkImage(formData: FormData) {
  const supabase = createClient();
  const file = formData.get("file") as File;

  if (!file) throw new Error("No file provided");

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("homework-images")
    .upload(fileName, file, {
      contentType: file.type,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("homework-images").getPublicUrl(fileName);

  return publicUrl;
}
