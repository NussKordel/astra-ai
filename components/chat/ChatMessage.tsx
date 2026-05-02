import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string | null;
}

export default function ChatMessage({ role, content, imageUrl }: ChatMessageProps) {
  const isUser = role === "user";

  const speakText = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = "de-DE";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Uploaded homework"
            className="max-w-full rounded-md mb-2 max-h-64 object-contain"
          />
        )}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        {!isUser && (
          <button
            onClick={speakText}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            🔊 Vorlesen
          </button>
        )}
      </div>
    </div>
  );
}
