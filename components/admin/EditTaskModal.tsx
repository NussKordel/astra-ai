"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateTask } from "@/app/admin/abitur/actions";

interface EditTask {
  id: string;
  question_text: string;
  solution_text: string;
}

interface EditTaskModalProps {
  task: EditTask;
  onClose: () => void;
  onSave: (task: EditTask) => void;
}

export default function EditTaskModal({ task, onClose, onSave }: EditTaskModalProps) {
  const [questionText, setQuestionText] = useState(task.question_text);
  const [solutionText, setSolutionText] = useState(task.solution_text);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTask(task.id, {
        question_text: questionText,
        solution_text: solutionText,
      });
      onSave({ ...task, question_text: questionText, solution_text: solutionText });
    } catch (error) {
      console.error("Save failed:", error);
      alert("Speichern fehlgeschlagen.");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Aufgabe bearbeiten</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Aufgabentext</label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Lösung</label>
            <Textarea
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              rows={6}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
