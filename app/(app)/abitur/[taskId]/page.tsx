"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

interface Task {
  id: string;
  question_text: string;
  solution_text: string;
  subject_area: string;
  requirement_level: string;
  question_number: number;
  sub_part: string | null;
}

export default function AbiturTaskPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const [task, setTask] = useState<Task | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [studentInput, setStudentInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function loadTask() {
      const { data } = await supabase
        .from("abitur_tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (data) setTask(data);
    }

    loadTask();
  }, [taskId]);

  const handleSend = async () => {
    if (!studentInput.trim() || !task) return;

    const userMsg = { role: "user", content: studentInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setStudentInput("");
    setLoading(true);
    setStreamingContent("");

    try {
      const response = await fetch("/api/abitur-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          question: task.question_text,
          solution: task.solution_text,
          history: [...chatMessages, userMsg],
          subjectArea: task.subject_area,
          requirementLevel: task.requirement_level,
        }),
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

      setChatMessages((prev) => [...prev, { role: "assistant", content: fullResponse }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "KI momentan nicht verfügbar, bitte versuche es erneut." },
      ]);
    }

    setLoading(false);
    setStreamingContent("");
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      {/* Left: Question */}
      <div className="space-y-4 overflow-y-auto">
        <div>
          <div className="flex gap-2 mb-2">
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
              {task.subject_area}
            </span>
            <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded">
              {task.requirement_level === "basic" ? "Grundkurs" : "Leistungskurs"}
            </span>
          </div>
          <h1 className="text-2xl font-bold">
            Aufgabe {task.question_number}
            {task.sub_part ? task.sub_part : ""}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aufgabenstellung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{task.question_text}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {task.solution_text && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lösung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{task.solution_text}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: Chat */}
      <div className="flex flex-col border rounded-lg bg-card">
        <div className="p-4 border-b">
          <h2 className="font-semibold">KI-Tutor</h2>
          <p className="text-sm text-muted-foreground">
            Lass dir die Lösung Schritt für Schritt erklären
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p>Stelle eine Frage zur Aufgabe oder versuche einen Lösungsschritt.</p>
            </div>
          )}

          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{streamingContent}</ReactMarkdown>
                </div>
              </div>
            </div>
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
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Versuche einen Lösungsschritt oder stelle eine Frage..."
              className="min-h-[44px] resize-none"
              rows={1}
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !studentInput.trim()}>
              Senden
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
