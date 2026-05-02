"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
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
        if (profile?.grade_level) setGradeLevel(profile.grade_level);
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
        messages: [{ role: "user", content: examPrepPrompt(subj, grade, timed) + `\n\nErstelle die Prüfung als JSON-Array:\n[{"question": "Aufgabentext"}]\nErstelle 3-5 Aufgaben.` }],
      });
      const content = response.choices[0].message.content || "[]";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      setQuestions(parsed.map((q: any) => ({ question: q.question, studentAnswer: "", feedback: "", score: 0 })));
    } catch (error) {
      setQuestions([{ question: "Fehler bei der Prüfungsgenerierung. Bitte versuche es erneut.", studentAnswer: "", feedback: "", score: 0 }]);
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
          { role: "system", content: `Du bist ein Prüfungscoach für ${subject} (${gradeLevel}). Bewerte fair und gib konstruktives Feedback auf Deutsch.` },
          { role: "user", content: `Aufgabe: ${currentQ.question}\n\nSchülerantwort: ${currentQ.studentAnswer}\n\nBewerte mit Punktzahl 0-100. JSON: {"score": 85, "feedback": "..."}` },
        ],
      });
      const content = response.choices[0].message.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 50, feedback: "Bewertet." };
      const updated = [...questions];
      updated[currentIndex] = { ...currentQ, feedback: result.feedback, score: result.score };
      setQuestions(updated);
      setShowResults(true);
    } catch (error) {
      const updated = [...questions];
      updated[currentIndex] = { ...currentQ, feedback: "Bewertung nicht verfügbar.", score: 0 };
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

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" /></div>;

  if (sessionComplete) {
    const totalScore = questions.reduce((sum, q) => sum + q.score, 0);
    const avgScore = Math.round(totalScore / questions.length);
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="text-center mb-6">
            <p className="text-5xl font-bold gradient-text">{avgScore}%</p>
            <p className="text-muted-foreground">Durchschnittliche Punktzahl</p>
          </div>
          {questions.map((q, i) => (
            <div key={i} className="border border-white/5 rounded-xl p-4 mb-3">
              <p className="font-medium text-white mb-2">Aufgabe {i + 1}</p>
              <p className="text-sm text-muted-foreground mb-2">{q.question}</p>
              <p className="text-sm text-violet-400">Punkte: {q.score}/100</p>
              <p className="text-sm mt-1">{q.feedback}</p>
            </div>
          ))}
          <Button onClick={() => window.location.reload()} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600">Neue Prüfung</Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-white">Prüfung: {subject}</h1>
        <span className="text-sm text-muted-foreground">Aufgabe {currentIndex + 1} von {questions.length}</span>
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
        <p className="text-base text-white mb-4">{currentQ?.question}</p>

        {!showResults ? (
          <>
            <textarea
              value={currentQ?.studentAnswer}
              onChange={(e) => { const updated = [...questions]; updated[currentIndex].studentAnswer = e.target.value; setQuestions(updated); }}
              placeholder="Deine Antwort..."
              rows={6}
              disabled={generating}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500 resize-none mb-4"
            />
            <Button onClick={handleSubmitAnswer} disabled={!currentQ?.studentAnswer.trim() || generating} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600">
              {generating ? "Wird bewertet..." : "Antwort einreichen"}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${currentQ.score >= 70 ? "bg-green-500/10 border border-green-500/20" : currentQ.score >= 40 ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              <p className="font-medium text-lg text-white">Punkte: {currentQ.score}/100</p>
              <p className="text-sm mt-2 text-muted-foreground">{currentQ.feedback}</p>
            </div>
            <Button onClick={handleNext} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600">
              {currentIndex < questions.length - 1 ? "Nächste Aufgabe" : "Ergebnisse"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
