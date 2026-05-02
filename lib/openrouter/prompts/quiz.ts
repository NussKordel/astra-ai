export function quizPrompt(subject: string, topic: string, count: number) {
  return `Erstelle ${count} Multiple-Choice-Fragen auf Deutsch zum Thema "${topic}" im Fach ${subject}.
Antworte NUR mit einem JSON-Array in diesem Format:
[
  {
    "question": "Frage hier",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Erklärung warum diese Antwort richtig ist"
  }
]`;
}
