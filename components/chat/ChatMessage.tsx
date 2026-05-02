"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { preprocessMathText, postprocessMathText } from "@/lib/math-utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string | null;
}

export default function ChatMessage({ role, content, imageUrl }: ChatMessageProps) {
  const isUser = role === "user";
  
  // Process math text for proper rendering
  const processedContent = postprocessMathText(preprocessMathText(content));

  const speakText = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = "de-DE";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-5 py-3.5",
          isUser
            ? "bg-violet-600 text-white"
            : "bg-white/5 text-foreground border border-white/5"
        )}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Uploaded homework"
            className="max-w-full rounded-xl mb-2 max-h-64 object-contain"
          />
        )}
        <div className="prose prose-sm max-w-none prose-invert prose-pre:bg-black/30">
          <ReactMarkdown 
            remarkPlugins={[remarkMath]} 
            rehypePlugins={[rehypeKatex]}
            components={{
              // Custom paragraph to handle math spacing
              p: ({ children }) => (
                <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
              ),
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>
        {!isUser && (
          <button
            onClick={speakText}
            className="mt-2 text-xs text-muted-foreground hover:text-violet-400 transition-colors flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            Vorlesen
          </button>
        )}
      </div>
    </div>
  );
}
