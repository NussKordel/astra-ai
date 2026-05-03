"use client";

import { useState, useRef } from "react";
import { Image, FileText, Send, X } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, imageUrl?: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  onUploadPDF?: (file: File) => Promise<string>;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onUploadImage, onUploadPDF, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() && !imagePreview) return;
    onSend(message, imagePreview || undefined);
    setMessage("");
    setImagePreview(null);
    setUploadType(null);
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
      let url: string;
      if (file.type === "application/pdf" && onUploadPDF) {
        url = await onUploadPDF(file);
        setUploadType("pdf");
      } else {
        url = await onUploadImage(file);
        setUploadType("image");
      }
      setImagePreview(url);
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert(error.message || "Upload fehlgeschlagen");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-white/5 bg-[#0a0a0a] p-4">
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          {uploadType === "pdf" ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <FileText className="w-5 h-5 text-red-400" />
              <span className="text-sm text-white">PDF hochgeladen</span>
            </div>
          ) : (
            <img src={imagePreview} alt="Preview" className="h-20 rounded-xl" />
          )}
          <button
            type="button"
            onClick={() => { setImagePreview(null); setUploadType(null); }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <div className="flex gap-2 items-end">
        <input
          type="file"
          accept="image/*,.pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || disabled}
          className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
          title="Bild oder PDF hochladen"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Image className="w-4 h-4" />
          )}
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={uploadType === "pdf" ? "Frag etwas zu dem PDF..." : "Stelle eine Frage..."}
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
