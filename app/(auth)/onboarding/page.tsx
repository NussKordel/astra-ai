"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GRADE_LEVELS, SUBJECTS } from "@/lib/constants";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [gradeLevel, setGradeLevel] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({
          grade_level: gradeLevel,
          subjects: selectedSubjects,
        })
        .eq("id", user.id);
    }

    router.push("/dashboard");
    setLoading(false);
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Willkommen bei Astra AI</CardTitle>
        <CardDescription>
          Lass uns dein Profil einrichten, um dir die besten Lerninhalte zu liefern
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schritt 1: Wähle deine Klassenstufe</h3>
            <div className="grid grid-cols-2 gap-2">
              {GRADE_LEVELS.map((grade) => (
                <button
                  key={grade}
                  onClick={() => setGradeLevel(grade)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    gradeLevel === grade
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
            <Button
              className="w-full"
              disabled={!gradeLevel}
              onClick={() => setStep(2)}
            >
              Weiter
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Schritt 2: Wähle deine Fächer</h3>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedSubjects.includes(subject)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Zurück
              </Button>
              <Button
                className="flex-1"
                disabled={selectedSubjects.length === 0 || loading}
                onClick={handleSubmit}
              >
                {loading ? "Wird gespeichert..." : "Loslegen"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
