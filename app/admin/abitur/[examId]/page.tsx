"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EditTaskModal from "@/components/admin/EditTaskModal";
import { publishTask } from "../actions";

interface Task {
  id: string;
  question_number: number;
  sub_part: string | null;
  subject_area: string;
  requirement_level: string;
  question_text: string;
  solution_text: string;
  published: boolean;
}

export default function AdminExamDetailPage() {
  const params = useParams();
  const examId = params.examId as string;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadTasks() {
      const { data } = await supabase
        .from("abitur_tasks")
        .select("*")
        .eq("exam_id", examId)
        .order("question_number", { ascending: true });

      if (data) setTasks(data);
      setLoading(false);
    }

    loadTasks();
  }, [examId]);

  const handlePublish = async (taskId: string) => {
    await publishTask(taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, published: true } : t))
    );
  };

  const handleUpdate = (updatedTask: { id: string; question_text: string; solution_text: string }) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
    );
    setEditingTask(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Aufgaben bearbeiten</h1>
        <p className="text-muted-foreground mt-2">
          {tasks.length} extrahierte Aufgaben
        </p>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">
                    Aufgabe {task.question_number}
                    {task.sub_part ? task.sub_part : ""}
                  </CardTitle>
                  <Badge variant="outline">{task.subject_area}</Badge>
                  <Badge
                    variant={task.requirement_level === "advanced" ? "default" : "secondary"}
                  >
                    {task.requirement_level}
                  </Badge>
                  <Badge variant={task.published ? "default" : "secondary"}>
                    {task.published ? "Veröffentlicht" : "Entwurf"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingTask(task)}>
                    Bearbeiten
                  </Button>
                  {!task.published && (
                    <Button size="sm" onClick={() => handlePublish(task.id)}>
                      Veröffentlichen
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {task.question_text}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}
