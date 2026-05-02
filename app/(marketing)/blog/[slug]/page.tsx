import { notFound } from "next/navigation";

const posts: Record<string, { title: string; content: string }> = {
  "ki-nachhilfe-vs-traditionell": {
    title: "KI-Nachhilfe vs. traditionelle Nachhilfe",
    content: `
KI-Nachhilfe revolutioniert das Lernen. Im Gegensatz zu traditioneller Nachhilfe ist ein KI-Tutor jederzeit verfügbar, geduldig und passt sich individuell an dein Lerntempo an.

## Vorteile der KI-Nachhilfe

- **24/7 Verfügbarkeit**: Lernen wann und wo du willst
- **Personalisierung**: Der KI-Tutor passt sich deinem Wissensstand an
- **Geduld**: Erklärt so oft, wie du es brauchst
- **Kosteneffizienz**: Deutlich günstiger als traditionelle Nachhilfe

## Wann traditionelle Nachhilfe sinnvoll ist

Manchmal ist persönlicher Kontakt wichtig. Besonders bei Motivationsproblemen oder sehr komplexen Themen kann ein menschlicher Nachhilfelehrer unterstützen.

Die Zukunft liegt in der Kombination: KI für den Großteil des Lernens, ergänzt durch menschliche Betreuung bei Bedarf.
    `,
  },
  "abi-mathe-tipps": {
    title: "10 Tipps für das Mathe-Abitur",
    content: `
Das Mathe-Abitur ist eine Herausforderung, aber mit der richtigen Vorbereitung machbar.

## Unsere Top-Tipps

1. **Früh anfangen**: Mindestens 3 Monate vorher mit der Vorbereitung beginnen
2. **Alte Klausuren üben**: Die beste Vorbereitung sind echte Abituraufgaben
3. **Grundlagen festigen**: Ohne solide Grundlagen werden komplexe Aufgaben schwierig
4. **Schritt für Schritt**: Lösungswege systematisch aufschreiben
5. **Zeitmanagement**: In der Klausur Zeit für jede Aufgabe planen
6. **Taschenrechner beherrschen**: Kenne alle Funktionen deines GTR
7. **Formelsammlung**: Wissen, welche Formeln drin sind und welche auswendig
8. **Prüfungsangst**: Atemübungen und positive Visualisierung helfen
9. **Lerngruppen**: Gemeinsam lernen festigt das Wissen
10. **Astra AI nutzen**: Für individuelle Erklärungen und Übungsaufgaben
    `,
  },
  "lernmethoden-2024": {
    title: "Die besten Lernmethoden 2024",
    content: `
Wissenschaftliche Studien zeigen: Nicht alle Lernmethoden sind gleich effektiv.

## Spaced Repetition

Statt alles auf einmal zu pauken, ist es effektiver, Lerninhalte über einen längeren Zeitraum zu wiederholen. Apps wie Anki nutzen dieses Prinzip.

## Active Recall

Nicht einfach Texte lesen, sondern sich selbst abfragen. Was war der wichtigste Punkt? Erkläre es in eigenen Worten.

## Feynman-Technik

Erkläre das Thema so, als würdest du es einem 6-Jährigen erklären. Wenn du es nicht einfach genug erklären kannst, hast du es nicht wirklich verstanden.

## Pomodoro-Technik

25 Minuten fokussiert lernen, dann 5 Minuten Pause. Nach 4 Zyklen eine längere Pause.

Mit Astra AI kannst du all diese Methoden direkt in der App anwenden – der KI-Tutor fragt dich ab, erklärt komplexe Themen einfach und passt sich deinem Rhythmus an.
    `,
  },
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">{post.title}</h1>
        <div className="prose prose-lg max-w-none">
          {post.content.split("\n\n").map((paragraph, i) => {
            if (paragraph.startsWith("## ")) {
              return (
                <h2 key={i} className="text-2xl font-bold mt-8 mb-4">
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("- ")) {
              return (
                <ul key={i} className="list-disc pl-6 mb-4 space-y-2">
                  {paragraph.split("\n").map((item, j) => (
                    <li key={j}>{item.replace("- ", "")}</li>
                  ))}
                </ul>
              );
            }
            if (/^\d+\./.test(paragraph)) {
              return (
                <ol key={i} className="list-decimal pl-6 mb-4 space-y-2">
                  {paragraph.split("\n").map((item, j) => (
                    <li key={j}>{item.replace(/^\d+\.\s*/, "")}</li>
                  ))}
                </ol>
              );
            }
            if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
              return (
                <p key={i} className="font-bold mb-4">
                  {paragraph.replace(/\*\*/g, "")}
                </p>
              );
            }
            return (
              <p key={i} className="mb-4 text-muted-foreground">
                {paragraph}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
