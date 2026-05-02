"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SUBJECTS } from "@/lib/constants";
import { Switch } from "@/components/ui/switch";

export default function ExamPrepPage() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [timed, setTimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleStart = async () => {
    if (!selectedSubject) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: session } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        subject: selectedSubject,
        module: "exam_prep",
      })
      .select()
      .single();

    if (session) {
      router.push(`/exam-prep/${session.id}?timed=${timed}`);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prüfungstraining</h1>
        <p className="text-muted-foreground mt-2">
          Bereite dich mit KI-generierten Prüfungsaufgaben vor
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Neue Prüfung starten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Fach wählen</Label>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    selectedSubject === subject
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Zeitgesteuert</Label>
              <p className="text-sm text-muted-foreground">
                Begrenzte Zeit pro Aufgabe
              </p>
            </div>
            <Switch checked={timed} onCheckedChange={setTimed} />
          </div>

          <Button
            onClick={handleStart}
            disabled={!selectedSubject || loading}
            className="w-full"
          >
            {loading ? "Wird erstellt..." : "Prüfung starten"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
