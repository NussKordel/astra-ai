"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen } from "lucide-react";
import { SUBJECTS } from "@/lib/constants";

export default function ExamPrepPage() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [timed, setTimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleStart = async () => {
    if (!selectedSubject) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: session } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, subject: selectedSubject, module: "exam_prep" })
      .select()
      .single();

    if (session) router.push(`/exam-prep/${session.id}?timed=${timed}`);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Prüfungstraining</h1>
        <p className="text-muted-foreground mt-1">Bereite dich mit KI-generierten Prüfungsaufgaben vor</p>
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
        <h3 className="font-medium text-white mb-4">Neue Prüfung starten</h3>
        
        <div className="space-y-2 mb-6">
          <p className="text-sm text-muted-foreground mb-2">Fach wählen</p>
          <div className="grid grid-cols-2 gap-2">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                  selectedSubject === subject
                    ? "border-violet-500 bg-violet-500/10 text-violet-400"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-white/5">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-white">Zeitgesteuert</p>
              <p className="text-xs text-muted-foreground">Begrenzte Zeit pro Aufgabe</p>
            </div>
          </div>
          <button
            onClick={() => setTimed(!timed)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              timed ? "bg-violet-600" : "bg-white/10"
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
              timed ? "left-6" : "left-0.5"
            }`} />
          </button>
        </div>

        <Button
          onClick={handleStart}
          disabled={!selectedSubject || loading}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
        >
          {loading ? "Wird erstellt..." : "Prüfung starten"}
        </Button>
      </div>
    </div>
  );
}
