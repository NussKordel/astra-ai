"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Image, PenSquare, Grid3X3, SlidersHorizontal } from "lucide-react";

export default function MainChatInterface() {
  const [message, setMessage] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Mathematik");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState("");
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
        const { data: profile } = await supabase
          .from("profiles")
          .select("grade_level")
          .eq("id", user.id)
          .single();
        
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

  const handleStart = () => {
    router.push(`/tutor/${encodeURIComponent(selectedSubject)}`);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    router.push(`/tutor/${encodeURIComponent(selectedSubject)}?initialMessage=${encodeURIComponent(message)}`);
  };

  return (
    <div className="flex flex-col h-full">
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
          onClick={handleStart}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium mb-12"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Start
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
              Fach wählen
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
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground">
                <Image className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground">
                <PenSquare className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground">
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={() => {
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  const utterance = new SpeechSynthesisUtterance("Was möchtest du heute lernen?");
                  utterance.lang = "de-DE";
                  window.speechSynthesis.speak(utterance);
                }
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sprechen
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
