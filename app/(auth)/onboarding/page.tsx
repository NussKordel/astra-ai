"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { GRADE_LEVELS, SUBJECTS } from "@/lib/constants";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [gradeLevel, setGradeLevel] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const applyCoupon = async () => {
    if (couponCode.trim().toUpperCase() === "ASTRAUNLIMITED") {
      setCouponApplied(true);
    } else {
      setError("Ungültiger Coupon-Code");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Nicht angemeldet. Bitte melde dich an.");
        setLoading(false);
        return;
      }

      // Update profile with grade, subjects, and coupon
      const updateData: any = {
        grade_level: gradeLevel,
        subjects: selectedSubjects,
      };

      if (couponApplied) {
        updateData.subscription_tier = "plus";
        updateData.coupon_code = "ASTRAUNLIMITED";
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        setError("Fehler beim Speichern: " + updateError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Submit error:", err);
      setError("Ein Fehler ist aufgetreten: " + (err.message || "Unbekannter Fehler"));
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <Card className="max-w-lg w-full bg-[#141414] border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">a</span>
            </div>
            <CardTitle className="text-white">Willkommen bei Astra AI</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Richte dein Profil ein, um loszulegen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Schritt 1: Wähle deine Klassenstufe</h3>
              <div className="grid grid-cols-2 gap-2">
                {GRADE_LEVELS.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setGradeLevel(grade)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      gradeLevel === grade
                        ? "border-violet-500 bg-violet-500/10 text-violet-400"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
                disabled={!gradeLevel}
                onClick={() => setStep(2)}
              >
                Weiter
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Schritt 2: Wähle deine Fächer</h3>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedSubjects.includes(subject)
                        ? "bg-violet-500 text-white"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="border-white/10">
                  Zurück
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
                  disabled={selectedSubjects.length === 0}
                  onClick={() => setStep(3)}
                >
                  Weiter
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Hast du einen Coupon-Code?</h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setError("");
                  }}
                  placeholder="Code eingeben"
                  className="flex-1 h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500"
                />
                <Button
                  onClick={applyCoupon}
                  variant="outline"
                  className="border-white/10"
                  disabled={!couponCode.trim()}
                >
                  Einlösen
                </Button>
              </div>

              {couponApplied && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Coupon aktiviert! Du hast jetzt unbegrenzten Zugang.
                </div>
              )}

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="border-white/10">
                  Zurück
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? "Wird gespeichert..." : "Loslegen"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
