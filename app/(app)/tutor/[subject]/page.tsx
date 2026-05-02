"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  const searchParams = useSearchParams();
  const subject = decodeURIComponent(params.subject as string);
  const isNewChat = searchParams.get("new") === "true";
  const initialMessage = searchParams.get("initialMessage");
  const uploadType = searchParams.get("upload");
  
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [apiLimitReached, setApiLimitReached] = useState(false);
  const [apiCallsUsed, setApiCallsUsed] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(uploadType === "image");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
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

      // Check API limits
      const { data: profile } = await supabase
        .from("profiles")
        .select("api_calls_used, coupon_code, subscription_tier, trial_ends_at, is_admin")
        .eq("id", user.id)
        .single();

      if (profile) {
        setApiCallsUsed(profile.api_calls_used || 0);
        
        const isUnlimited = 
          profile.is_admin ||
          profile.coupon_code === "ASTRAUNLIMITED" ||
          profile.subscription_tier === "plus" ||
          profile.subscription_tier === "abitur" ||
          (profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date());
        
        if (!isUnlimited && (profile.api_calls_used || 0) >= 3) {
          setApiLimitReached(true);
        }
      }

      let convId: string;

      if (isNewChat) {
        // Always create new conversation
        const newConv = await createConversation(subject, user.id);
        convId = newConv.id;
      } else {
        // Try to find existing conversation
        const { data: existing } = await supabase
          .from("conversations")
          .select("id")
          .eq("user_id", user.id)
          .eq("subject", subject)
          .eq("module", "tutor")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (existing) {
          convId = existing.id;
        } else {
          const newConv = await createConversation(subject, user.id);
          convId = newConv.id;
        }
      }

      setConversationId(convId);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (msgs) {
        setMessages(msgs);
      }

      // Send initial message if provided
      if (initialMessage && msgs && msgs.length === 0) {
        handleSend(initialMessage);
      }
    }

    init();
  }, [subject, isNewChat]);

  const handleSend = async (content: string, imageUrl?: string) => {
    if (!conversationId) return;
    if (apiLimitReached) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("api_calls_used, coupon_code, subscription_tier, trial_ends_at, is_admin")
      .eq("id", user.id)
      .single();

    const isUnlimited = 
      profile?.is_admin ||
      profile?.coupon_code === "ASTRAUNLIMITED" ||
      profile?.subscription_tier === "plus" ||
      profile?.subscription_tier === "abitur" ||
      (profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date());

    if (!isUnlimited && (profile?.api_calls_used || 0) >= 3) {
      setApiLimitReached(true);
      setApiCallsUsed(profile?.api_calls_used || 0);
      return;
    }

    // Save user message
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

      // Increment API call counter for free users
      if (!isUnlimited) {
        await supabase
          .from("profiles")
          .update({ api_calls_used: (profile?.api_calls_used || 0) + 1 })
          .eq("id", user.id);
        
        setApiCallsUsed((prev) => prev + 1);
        
        if ((profile?.api_calls_used || 0) + 1 >= 3) {
          setApiLimitReached(true);
        }
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;
    
    try {
      const url = await handleUploadImage(file);
      handleSend("Hier ist ein Bild meiner Aufgabe. Kannst du mir helfen?", url);
    } catch (error) {
      console.error("Upload failed:", error);
    }
    setShowUploadModal(false);
  };

  const startNewChat = () => {
    router.push(`/tutor/${encodeURIComponent(subject)}?new=true`);
    router.refresh();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#0a0a0a]">
      {/* Header */}
      <div className="px-6 py-3 border-b border-white/5 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-white">{subject}</h1>
          <p className="text-xs text-muted-foreground">
            {apiLimitReached ? "Limit erreicht" : `${apiCallsUsed}/3 Nachrichten (Free)`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startNewChat}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-all"
          >
            Neuer Chat
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-all"
          >
            Bild hochladen
          </button>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Bild hochladen</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Lade ein Bild deiner Hausaufgaben hoch und der KI-Tutor hilft dir dabei.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full mb-4 text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-500"
            />
            <button
              onClick={() => setShowUploadModal(false)}
              className="w-full py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-all"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* API Limit Warning */}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
        {messages.length === 0 && !loading && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg mb-2">Willkommen zum {subject}-Tutor!</p>
            <p>Ich führe dich Schritt für Schritt durch die Aufgaben.</p>
            <p className="text-sm mt-2">Stelle eine Frage oder lade ein Bild hoch.</p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            imageUrl={msg.image_url}
          />
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

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onUploadImage={handleUploadImage}
        disabled={loading || apiLimitReached}
      />
    </div>
  );
}
