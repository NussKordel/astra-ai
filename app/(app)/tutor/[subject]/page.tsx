"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import QuizCard from "@/components/chat/QuizCard";
import {
  createConversation,
  saveMessage,
  uploadHomeworkImage,
} from "./actions";
import { generateQuiz } from "./quiz-actions";

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
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizTopic, setQuizTopic] = useState("");
  const [quizLoading, setQuizLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  useEffect(() => {
    async function initConversation() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

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

      if (msgs) {
        setMessages(msgs);
      }
    }

    initConversation();
  }, [subject]);

  const handleSend = async (content: string, imageUrl?: string) => {
    if (!conversationId) return;

    await saveMessage(conversationId, "user", content, imageUrl);

    const tempId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: "user",
        content,
        image_url: imageUrl || null,
        created_at: new Date().toISOString(),
      },
    ]);

    setLoading(true);
    setStreamingContent("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content, imageUrl }),
      });

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
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: fullResponse,
          image_url: null,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg = "KI momentan nicht verfügbar, bitte versuche es erneut.";
      await saveMessage(conversationId, "assistant", errorMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: errorMsg,
          image_url: null,
          created_at: new Date().toISOString(),
        },
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

  const handleStartQuiz = async () => {
    if (!quizTopic.trim()) return;
    setQuizLoading(true);
    try {
      const questions = await generateQuiz(subject, quizTopic, 5);
      setQuizQuestions(questions);
      setShowQuiz(true);
    } catch (error) {
      console.error("Quiz generation failed:", error);
      alert("Quiz konnte nicht generiert werden. Bitte versuche es erneut.");
    }
    setQuizLoading(false);
  };

  const handleQuizComplete = (correct: number, total: number) => {
    alert(`Quiz abgeschlossen! ${correct} von ${total} richtig.`);
    setShowQuiz(false);
    setQuizQuestions([]);
    setQuizTopic("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{subject}</h1>
          <p className="text-sm text-muted-foreground">
            Stelle Fragen, lass dir Erklärungen geben oder lade ein Bild hoch.
          </p>
        </div>
        <div className="flex gap-2">
          {!showQuiz && (
            <div className="flex gap-2 items-end">
              <div>
                <Label htmlFor="quiz-topic" className="text-xs">Quiz-Thema</Label>
                <Input
                  id="quiz-topic"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="z.B. Quadratische Gleichungen"
                  className="w-48 h-9"
                />
              </div>
              <Button
                onClick={handleStartQuiz}
                disabled={quizLoading || !quizTopic.trim()}
                size="sm"
              >
                {quizLoading ? "..." : "Quiz starten"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {showQuiz && quizQuestions.length > 0 ? (
        <QuizCard questions={quizQuestions} onComplete={handleQuizComplete} />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2">
            {messages.length === 0 && !loading && (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-lg mb-2">Willkommen zum {subject}-Tutor!</p>
                <p>Stelle eine Frage oder lade ein Bild deiner Hausaufgaben hoch.</p>
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

            {streamingContent && (
              <ChatMessage role="assistant" content={streamingContent} />
            )}

            {loading && !streamingContent && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            onSend={handleSend}
            onUploadImage={handleUploadImage}
            disabled={loading}
          />
        </>
      )}
    </div>
  );
}
