"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { openrouter, MODELS } from "@/lib/openrouter/client";
import { examPrepPrompt } from "@/lib/openrouter/prompts/exam-prep";

interface ExamQuestion {
  question: string;
  studentAnswer: string;
  feedback: string;
  score: number;
}

export default function ExamSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const timed = searchParams.get("timed") === "true";

  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("Klasse 10");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: session } = await supabase
        .from("conversations")
        .select("subject, user_id")
        .eq("id", sessionId)
        .single();

      if (session) {
        setSubject(session.subject);

        const { data: profile } = await supabase
          .from("profiles")
          .select("grade_level")
          .eq("id", session.user_id)
          .single();

        if (profile?.grade_level) {
          setGradeLevel(profile.grade_level);
        }

        await generateExam(session.subject, profile?.grade_level || "Klasse 10");
      }

      setLoading(false);
    }

    init();
  }, [sessionId]);

  const generateExam = async (subj: string, grade: string) => {
    setGenerating(true);
    try {
      const response = await openrouter.chat.completions.create({
        model: MODELS.default,
        messages: [
          {
            role: "user",
            content: examPrepPrompt(subj, grade, timed) + `

Erstelle die Prüfung als JSON-Array mit diesem Format:
[
  {
    "question": "Aufgabentext hier"
  }
]
Erstelle 3-5 Aufgaben.`,
          },
        ],
      });

      const content = response.choices[0].message.content || "[]";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      setQuestions(
        parsed.map((q: any) => ({
          question: q.question,
          studentAnswer: "",
          feedback: "",
          score: 0,
        }))
      );
    } catch (error) {
      console.error("Exam generation failed:", error);
      setQuestions([
        {
          question: "Fehler bei der Prüfungsgenerierung. Bitte versuche es erneut.",
          studentAnswer: "",
          feedback: "",
          score: 0,
        },
      ]);
    }
    setGenerating(false);
  };

  const handleSubmitAnswer = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ.studentAnswer.trim()) return;

    setGenerating(true);
    try {
      const response = await openrouter.chat.completions.create({
        model: MODELS.default,
        messages: [
          {
            role: "system",
            content: `Du bist ein Prüfungscoach für ${subject} (${gradeLevel}). Bewerte die Antwort des Schülers fair und gib konstruktives Feedback auf Deutsch.`,
          },
          {
            role: "user",
            content: `Aufgabe: ${currentQ.question}\n\nSchülerantwort: ${currentQ.studentAnswer}\n\nBewerte die Antwort mit einer Punktzahl von 0-100 und gib detailliertes Feedback. Antworte im JSON-Format:\n{\n  "score": 85,\n  "feedback": "Feedback hier..."\n}`,
          },
        ],
      });

      const content = response.choices[0].message.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const result = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { score: 50, feedback: "Antwort wurde bewertet." };

      const updated = [...questions];
      updated[currentIndex] = {
        ...currentQ,
        feedback: result.feedback,
        score: result.score,
      };
      setQuestions(updated);
      setShowResults(true);
    } catch (error) {
      console.error("Grading failed:", error);
      const updated = [...questions];
      updated[currentIndex] = {
        ...currentQ,
        feedback: "Bewertung momentan nicht verfügbar.",
        score: 0,
      };
      setQuestions(updated);
      setShowResults(true);
    }
    setGenerating(false);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowResults(false);
    } else {
      setSessionComplete(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (sessionComplete) {
    const totalScore = questions.reduce((sum, q) => sum + q.score, 0);
    const avgScore = Math.round(totalScore / questions.length);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Prüfung abgeschlossen!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{avgScore}%</p>
              <p className="text-muted-foreground">Durchschnittliche Punktzahl</p>
            </div>
            {questions.map((q, i) => (
              <div key={i} className="border rounded-lg p-4">
                <p className="font-medium mb-2">Aufgabe {i + 1}</p>
                <p className="text-sm text-muted-foreground mb-2">{q.question}</p>
                <p className="text-sm mb-1">
                  <span className="font-medium">Deine Antwort:</span> {q.studentAnswer}
                </p>
                <p className="text-sm text-primary">
                  <span className="font-medium">Punkte:</span> {q.score}/100
                </p>
                <p className="text-sm mt-1">{q.feedback}</p>
              </div>
            ))}
            <Button onClick={() => window.location.reload()} className="w-full">
              Neue Prüfung starten
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Prüfung: {subject}
        </h1>
        <span className="text-sm text-muted-foreground">
          Aufgabe {currentIndex + 1} von {questions.length}
        </span>
      </div>

      {generating && !currentQ?.question ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aufgabe {currentIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base">{currentQ?.question}</p>

            {!showResults && (
              <>
                <Textarea
                  value={currentQ?.studentAnswer}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[currentIndex].studentAnswer = e.target.value;
                    setQuestions(updated);
                  }}
                  placeholder="Deine Antwort..."
                  rows={6}
                  disabled={generating}
                />
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!currentQ?.studentAnswer.trim() || generating}
                  className="w-full"
                >
                  {generating ? "Wird bewertet..." : "Antwort einreichen"}
                </Button>
              </>
            )}

            {showResults && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    currentQ.score >= 70
                      ? "bg-green-50"
                      : currentQ.score >= 40
                      ? "bg-yellow-50"
                      : "bg-red-50"
                  }`}
                >
                  <p className="font-medium text-lg">
                    Punkte: {currentQ.score}/100
                  </p>
                  <p className="text-sm mt-2">{currentQ.feedback}</p>
                </div>
                <Button onClick={handleNext} className="w-full">
                  {currentIndex < questions.length - 1
                    ? "Nächste Aufgabe"
                    : "Ergebnisse anzeigen"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
