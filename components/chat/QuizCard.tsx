"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface QuizCardProps {
  questions: QuizQuestion[];
  onComplete: (correct: number, total: number) => void;
}

export default function QuizCard({ questions, onComplete }: QuizCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    if (index === currentQuestion.correct_index) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      onComplete(correctCount + (selectedOption === currentQuestion.correct_index ? 1 : 0), questions.length);
    }
  };

  const isCorrect = selectedOption === currentQuestion.correct_index;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Quiz</CardTitle>
          <span className="text-sm text-muted-foreground">
            Frage {currentIndex + 1} von {questions.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{currentQuestion.question}</p>

        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              className={`w-full p-3 rounded-lg border text-left transition-colors ${
                showResult
                  ? index === currentQuestion.correct_index
                    ? "border-green-500 bg-green-50"
                    : index === selectedOption
                    ? "border-red-500 bg-red-50"
                    : "border-border"
                  : selectedOption === index
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-accent"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {showResult && (
          <div className={`p-4 rounded-lg ${isCorrect ? "bg-green-50" : "bg-red-50"}`}>
            <p className={`font-medium ${isCorrect ? "text-green-700" : "text-red-700"}`}>
              {isCorrect ? "Richtig!" : "Leider falsch."}
            </p>
            <p className="text-sm mt-1 text-muted-foreground">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {showResult && (
          <Button onClick={handleNext} className="w-full">
            {currentIndex < questions.length - 1 ? "Nächste Frage" : "Quiz beenden"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
