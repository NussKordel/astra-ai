"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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

      if (filterArea) {
        query = query.eq("subject_area", filterArea);
      }
      if (filterLevel) {
        query = query.eq("requirement_level", filterLevel);
      }

      const { data } = await query;
      if (data) setTasks(data);
    }

    loadTasks();
  }, [filterArea, filterLevel]);

  useEffect(() => {
    async function loadProgress() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progress } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("subject", "Mathematik");

      if (progress) {
        setCompletedCount(progress.length);
      }
    }

    loadProgress();
  }, []);

  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  const estimatedGrade = Math.max(1, Math.min(6, 6 - (completionRate / 100) * 5));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Abitur AI</h1>
        <p className="text-muted-foreground mt-2">
          Übe mit echten Abitur-Aufgaben und lass dich vom KI-Tutor begleiten
        </p>
      </div>

      {/* Score Prediction */}
      <Card className="bg-primary/5">
        <CardContent className="py-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Geschätzte Note</p>
              <p className="text-3xl font-bold text-primary">
                {estimatedGrade.toFixed(1)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Fortschritt</p>
              <p className="text-xl font-semibold">
                {completedCount} / {totalTasks} Aufgaben
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Alle Bereiche</option>
          <option value="analysis">Analysis</option>
          <option value="geometry">Geometrie</option>
          <option value="stochastics">Stochastik</option>
        </select>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Alle Niveaus</option>
          <option value="basic">Grundkurs</option>
          <option value="advanced">Leistungskurs</option>
        </select>
      </div>

      {/* Tasks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <Link key={task.id} href={`/abitur/${task.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">
                    Aufgabe {task.question_number}
                    {task.sub_part ? task.sub_part : ""}
                  </CardTitle>
                  <Badge variant="outline">{task.subject_area}</Badge>
                </div>
                <Badge
                  variant={
                    task.requirement_level === "advanced"
                      ? "default"
                      : "secondary"
                  }
                >
                  {task.requirement_level === "basic"
                    ? "Grundkurs"
                    : "Leistungskurs"}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {task.question_text.substring(0, 150)}...
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Keine Aufgaben gefunden. Passe die Filter an.</p>
        </div>
      )}
    </div>
  );
}
