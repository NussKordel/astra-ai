"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { preprocessMathText, postprocessMathText } from "@/lib/math-utils";
import { BookOpen, MessageCircle, ChevronRight } from "lucide-react";

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
      const { data } = await supabase.from("abitur_tasks").select("*").eq("id", taskId).single();
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
          taskId, question: task.question_text, solution: task.solution_text,
          history: [...chatMessages, userMsg], subjectArea: task.subject_area, requirementLevel: task.requirement_level,
        }),
      });
      if (!response.body) throw new Error("No response");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value);
        setStreamingContent(fullResponse);
      }
      setChatMessages((prev) => [...prev, { role: "assistant", content: fullResponse }]);
    } catch (error) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "KI momentan nicht verfügbar, bitte versuche es erneut." }]);
    }
    setLoading(false);
    setStreamingContent("");
  };

  if (!task) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" /></div>;

  return (
    <div className="h-full grid lg:grid-cols-2 gap-6 px-6 py-6">
      {/* Left: Question */}
      <div className="space-y-4 overflow-y-auto">
        <div className="flex gap-2 mb-2">
          <span className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-400">{task.subject_area}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-muted-foreground">{task.requirement_level === "basic" ? "Grundkurs" : "Leistungskurs"}</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Aufgabe {task.question_number}{task.sub_part || ""}</h1>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-white">Aufgabenstellung</span>
          </div>
          <div className="prose prose-sm max-w-none prose-invert">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {postprocessMathText(preprocessMathText(task.question_text))}
            </ReactMarkdown>
          </div>
        </div>

        {task.solution_text && (
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <ChevronRight className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-white">Lösung</span>
            </div>
            <div className="prose prose-sm max-w-none prose-invert">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {postprocessMathText(preprocessMathText(task.solution_text))}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Right: Chat */}
      <div className="flex flex-col rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-violet-400" />
            <h2 className="font-semibold text-white">KI-Tutor</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Schritt-für-Schritt Erklärung</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 && <div className="text-center text-muted-foreground py-8"><p>Stelle eine Frage oder versuche einen Lösungsschritt.</p></div>}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-violet-600 text-white" : "bg-white/5 text-foreground border border-white/5"}`}>
                <div className="prose prose-sm max-w-none prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {postprocessMathText(preprocessMathText(msg.content))}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white/5 border border-white/5">
                <div className="prose prose-sm max-w-none prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {postprocessMathText(preprocessMathText(streamingContent))}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
          {loading && !streamingContent && (
            <div className="flex justify-start">
              <div className="bg-white/5 rounded-xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              placeholder="Versuche einen Lösungsschritt..."
              disabled={loading}
              className="flex-1 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500"
            />
            <Button onClick={handleSend} disabled={loading || !studentInput.trim()} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
