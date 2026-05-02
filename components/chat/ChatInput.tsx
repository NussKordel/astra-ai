"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, imageUrl?: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onUploadImage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() && !imagePreview) return;
    onSend(message, imagePreview || undefined);
    setMessage("");
    setImagePreview(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      setImagePreview(url);
    } catch (error) {
      console.error("Upload failed:", error);
    }
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-white/5 bg-[#0a0a0a] p-4">
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img src={imagePreview} alt="Preview" className="h-20 rounded-xl" />
          <button
            type="button"
            onClick={() => setImagePreview(null)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex gap-2 items-end">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || disabled}
          className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-muted-foreground"
        >
          <Image className="w-4 h-4" />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Stelle eine Frage..."
            disabled={disabled}
            className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || (!message.trim() && !imagePreview)}
          className="p-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
