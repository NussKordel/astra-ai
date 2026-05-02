"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import {
  createConversation,
  saveMessage,
  uploadHomeworkImage,
} from "./actions";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image_url: string | null;
  created_at: string;
}

export default function TutorChatPage() {
  const params = useParams();
  const subject = decodeURIComponent(params.subject as string);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [apiLimitReached, setApiLimitReached] = useState(false);
  const [apiCallsUsed, setApiCallsUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("api_calls_used, coupon_code, subscription_tier, trial_ends_at")
        .eq("id", user.id)
        .single();

      if (profile) {
        setApiCallsUsed(profile.api_calls_used || 0);
        const isUnlimited = 
          profile.coupon_code === "ASTRAUNLIMITED" ||
          profile.subscription_tier === "plus" ||
          profile.subscription_tier === "abitur" ||
          (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date());
        if (!isUnlimited && (profile.api_calls_used || 0) >= 3) {
          setApiLimitReached(true);
        }
      }

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .eq("subject", subject)
        .eq("module", "tutor")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      let convId: string;
      if (existing) {
        convId = existing.id;
      } else {
        const newConv = await createConversation(subject, user.id);
        convId = newConv.id;
      }

      setConversationId(convId);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (msgs) setMessages(msgs);
    }
    init();
  }, [subject]);

  const handleSend = async (content: string, imageUrl?: string) => {
    if (!conversationId) return;
    if (apiLimitReached) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("api_calls_used, coupon_code, subscription_tier, trial_ends_at")
      .eq("id", user.id)
      .single();

    const isUnlimited = 
      profile?.coupon_code === "ASTRAUNLIMITED" ||
      profile?.subscription_tier === "plus" ||
      profile?.subscription_tier === "abitur" ||
      (profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date());

    if (!isUnlimited && (profile?.api_calls_used || 0) >= 3) {
      setApiLimitReached(true);
      setApiCallsUsed(profile?.api_calls_used || 0);
      return;
    }

    await saveMessage(conversationId, "user", content, imageUrl);

    const tempId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "user", content, image_url: imageUrl || null, created_at: new Date().toISOString() },
    ]);

    setLoading(true);
    setStreamingContent("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content, imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      }

      await saveMessage(conversationId, "assistant", fullResponse);

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: fullResponse, image_url: null, created_at: new Date().toISOString() },
      ]);

      if (!isUnlimited) {
        await supabase.from("profiles").update({ api_calls_used: (profile?.api_calls_used || 0) + 1 }).eq("id", user.id);
        setApiCallsUsed((prev) => prev + 1);
        if ((profile?.api_calls_used || 0) + 1 >= 3) setApiLimitReached(true);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMsg = error.message || "KI momentan nicht verfügbar, bitte versuche es erneut.";
      await saveMessage(conversationId, "assistant", errorMsg);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: errorMsg, image_url: null, created_at: new Date().toISOString() },
      ]);
    }

    setLoading(false);
    setStreamingContent("");
  };

  const handleUploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return await uploadHomeworkImage(formData);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#0a0a0a]">
      <div className="px-6 py-4 border-b border-white/5">
        <h1 className="text-xl font-semibold text-white">{subject}</h1>
        <p className="text-sm text-muted-foreground">
          KI-Nachhilfe · {apiLimitReached ? "Limit erreicht" : `${apiCallsUsed}/3 Nachrichten im Free-Tier`}
        </p>
      </div>

      {apiLimitReached && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-amber-400 text-sm font-medium mb-2">
            Du hast dein Free-Limit von 3 Nachrichten erreicht.
          </p>
          <a href="/settings" className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium">
            Upgrade auf Astra Plus
          </a>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
        {messages.length === 0 && !loading && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg mb-2">Willkommen zum {subject}-Tutor!</p>
            <p>Ich führe dich Schritt für Schritt durch die Aufgaben.</p>
            <p className="text-sm mt-2">Stelle eine Frage oder lade ein Bild hoch.</p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} imageUrl={msg.image_url} />
        ))}

        {streamingContent && <ChatMessage role="assistant" content={streamingContent} />}

        {loading && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-white/5 rounded-lg px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} onUploadImage={handleUploadImage} disabled={loading || apiLimitReached} />
    </div>
  );
}
