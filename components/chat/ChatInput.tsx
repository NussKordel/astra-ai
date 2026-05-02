"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    <form onSubmit={handleSubmit} className="border-t bg-background p-4">
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-20 rounded-md"
          />
          <button
            type="button"
            onClick={() => setImagePreview(null)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || disabled}
        >
          {uploading ? "..." : "📎"}
        </Button>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Stelle eine Frage..."
          className="min-h-[44px] resize-none"
          rows={1}
          disabled={disabled}
        />
        <Button type="submit" disabled={disabled || (!message.trim() && !imagePreview)}>
          Senden
        </Button>
      </div>
    </form>
  );
}
