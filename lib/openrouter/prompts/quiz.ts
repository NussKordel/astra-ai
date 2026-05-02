export function quizPrompt(subject: string, topic: string, count: number) {
  return `Erstelle ${count} Multiple-Choice-Fragen auf Deutsch zum Thema "${topic}" im Fach ${subject}.

WICHTIG: Die Fragen sollen das Verständnis prüfen, nicht nur Auswendiglernen. 
Formeln müssen in LaTeX sein, z.B. $f(x) = x^2$.

Antworte NUR mit einem JSON-Array in diesem Format:
[
  {
    "question": "Frage hier (mit $LaTeX$ wenn nötig)",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Erklärung mit $LaTeX$-Formeln warum diese Antwort richtig ist"
  }
]`;
}
