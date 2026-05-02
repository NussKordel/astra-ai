export function examPrepPrompt(subject: string, gradeLevel: string, timed: boolean) {
  return `Du bist ein Prüfungscoach für ${subject} (${gradeLevel}).
Erstelle eine strukturierte Prüfungsaufgabe mit 3-5 Teilaufgaben.
Antworte auf Deutsch. Sei präzise und schulgerecht.
${timed ? 'Der Schüler hat begrenzte Zeit, halte die Aufgaben klar und kompakt.' : ''}`;
}
