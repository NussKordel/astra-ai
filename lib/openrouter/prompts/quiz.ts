export function quizPrompt(subject: string, topic: string, count: number) {
  return `Erstelle ${count} Multiple-Choice-Fragen auf Deutsch zum Thema "${topic}" im Fach ${subject}.

WICHTIGE REGELN FÜR FORMELN:
- Alle mathematischen Formeln MÜSSEN in LaTeX geschrieben werden.
- Inline-Formeln: $f(x) = x^2$
- Brüche: $\frac{a}{b}$
- Hochgestellt: $x^2$, $x^n$
- Multiplikation: $2 \cdot x$
- Ableitung: $\frac{d}{dx}(x^n) = n \cdot x^{n-1}$
- Nie doppelte Backslashes verwenden.
- NIE \\begin{aligned}, \\begin{align} oder ähnliche Umgebungen verwenden!

Antworte NUR mit einem JSON-Array in diesem Format:
[
  {
    "question": "Frage hier mit $LaTeX$-Formeln",
    "options": ["Option A mit $x^2$", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Erklärung mit $LaTeX$-Formeln warum diese Antwort richtig ist"
  }
]`;
}
