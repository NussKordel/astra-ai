"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { BookOpen, TrendingUp } from "lucide-react";

interface Task {
  id: string;
  question_number: number;
  sub_part: string | null;
  subject_area: string;
  requirement_level: string;
  question_text: string;
}

export default function AbiturPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterArea, setFilterArea] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [completedCount, setCompletedCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function loadTasks() {
      let query = supabase
        .from("abitur_tasks")
        .select("id, question_number, sub_part, subject_area, requirement_level, question_text")
        .eq("published", true);
      if (filterArea) query = query.eq("subject_area", filterArea);
      if (filterLevel) query = query.eq("requirement_level", filterLevel);
      const { data } = await query;
      if (data) setTasks(data);
    }
    loadTasks();
  }, [filterArea, filterLevel]);

  useEffect(() => {
    async function loadProgress() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: progress } = await supabase.from("progress").select("*").eq("user_id", user.id).eq("subject", "Mathematik");
      if (progress) setCompletedCount(progress.length);
    }
    loadProgress();
  }, []);

  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  const estimatedGrade = Math.max(1, Math.min(6, 6 - (completionRate / 100) * 5));

  return (
    <div className="h-full overflow-y-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Abitur AI</h1>
        <p className="text-muted-foreground mt-1">Übe mit echten Abitur-Aufgaben</p>
      </div>

      {/* Score Prediction */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-900/20 to-indigo-900/20 border border-violet-500/20 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Geschätzte Note</p>
            <p className="text-4xl font-bold gradient-text">{estimatedGrade.toFixed(1)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Fortschritt</p>
            <p className="text-xl font-semibold text-white">{completedCount} / {totalTasks}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500">
          <option value="" className="bg-[#1a1a1a]">Alle Bereiche</option>
          <option value="analysis" className="bg-[#1a1a1a]">Analysis</option>
          <option value="geometry" className="bg-[#1a1a1a]">Geometrie</option>
          <option value="stochastics" className="bg-[#1a1a1a]">Stochastik</option>
        </select>
        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-violet-500">
          <option value="" className="bg-[#1a1a1a]">Alle Niveaus</option>
          <option value="basic" className="bg-[#1a1a1a]">Grundkurs</option>
          <option value="advanced" className="bg-[#1a1a1a]">Leistungskurs</option>
        </select>
      </div>

      {/* Tasks */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <Link key={task.id} href={`/abitur/${task.id}`}>
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 transition-all cursor-pointer h-full">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  <span className="font-medium text-white">Aufgabe {task.question_number}{task.sub_part || ""}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-400">{task.subject_area}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${task.requirement_level === "advanced" ? "bg-indigo-500/10 text-indigo-400" : "bg-white/5 text-muted-foreground"}`}>
                {task.requirement_level === "basic" ? "Grundkurs" : "Leistungskurs"}
              </span>
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{task.question_text.substring(0, 120)}...</p>
            </div>
          </Link>
        ))}
      </div>

      {tasks.length === 0 && <div className="text-center py-12 text-muted-foreground"><p>Keine Aufgaben gefunden.</p></div>}
    </div>
  );
}
