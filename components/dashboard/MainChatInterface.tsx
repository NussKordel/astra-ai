"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Sparkles, Image, PenLine, LayoutGrid, SlidersHorizontal, Mic, Send, Plus, Zap } from "lucide-react";

export default function MainChatInterface() {
  const [message, setMessage] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Mathematik");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [showUpgradeCard, setShowUpgradeCard] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const subjects = [
    "Mathematik", "Englisch", "Chemie", "Physik", "Biologie",
    "Geographie", "Geschichte", "Wirtschaft", "Informatik",
    "Philosophie", "Psychologie", "Spanisch", "Französisch",
  ];

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const emailName = user.email?.split("@")[0] || "Schüler";
        setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
      }
    }
    loadUser();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("guten Morgen");
    else if (hour < 18) setGreeting("guten Tag");
    else setGreeting("guten Abend");
  }, []);

  const handleStartNewChat = () => {
    // Always create new chat - append timestamp to force new
    router.push(`/tutor/${encodeURIComponent(selectedSubject)}?new=true`);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    router.push(`/tutor/${encodeURIComponent(selectedSubject)}?new=true&initialMessage=${encodeURIComponent(message)}`);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Greeting */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">
            {userName ? `${userName}, ${greeting}!` : `${greeting}!`}
          </h1>
          <span className="text-3xl">🌙</span>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartNewChat}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium mb-12"
        >
          <Plus className="w-4 h-4" />
          Neuen Chat starten
        </button>
      </div>

      {/* Bottom Chat Bar */}
      <div className="w-full max-w-3xl mx-auto px-4 pb-6">
        {/* Subject Selector */}
        <div className="flex justify-center mb-3">
          <div className="relative">
            <button
              onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              {selectedSubject}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            
            {showSubjectDropdown && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl overflow-hidden z-50">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setShowSubjectDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                      selectedSubject === subject ? "text-violet-400 bg-violet-500/10" : "text-muted-foreground"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="rounded-2xl bg-[#141414] border border-white/8 p-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Was möchtest du heute lernen?"
            className="w-full bg-transparent text-white placeholder:text-muted-foreground text-base outline-none mb-3"
          />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => router.push(`/tutor/${encodeURIComponent(selectedSubject)}?new=true&upload=image`)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-white"
                title="Bild hochladen"
              >
                <Image className="w-4 h-4" />
              </button>
              <button 
                onClick={handleStartNewChat}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-white"
                title="Neuer Chat"
              >
                <PenLine className="w-4 h-4" />
              </button>
              <button 
                onClick={() => router.push("/tutor")}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-white"
                title="Alle Fächer"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-white"
                title="Einstellungen"
                onClick={() => router.push("/settings")}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    const utterance = new SpeechSynthesisUtterance(message || "Was möchtest du heute lernen?");
                    utterance.lang = "de-DE";
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                <Mic className="w-3.5 h-3.5" />
                Sprechen
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="p-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white disabled:opacity-50 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Card - Bottom Right */}
      {showUpgradeCard && (
        <div className="absolute bottom-28 right-4 md:right-8">
          <div className="w-64 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 p-4 relative">
            <button 
              onClick={() => setShowUpgradeCard(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-white"
            >
              <span className="text-xs">×</span>
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">a</span>
              </div>
              <span className="font-semibold text-white text-sm">astra</span>
              <span className="text-xs bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded">AI+</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Lernen ohne Grenzen mit AI.
            </p>
            <button 
              onClick={() => router.push("/settings")}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-medium flex items-center justify-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" />
              Kaufen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
