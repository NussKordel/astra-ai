export const pdfExtractionPrompt = `Du analysierst eine Seite eines Abitur-Mathematik-Klausur-PDFs.
Extrahiere ALLE Aufgaben auf dieser Seite.
Antworte NUR mit einem JSON-Array in diesem Format:
[
  {
    "question_number": 1,
    "sub_part": "a",
    "subject_area": "analysis",
    "requirement_level": "basic",
    "question_text": "vollständiger Aufgabentext",
    "solution_text": "vollständiger Lösungsweg falls vorhanden, sonst leer"
  }
]
subject_area muss einer dieser Werte sein: "analysis" | "geometry" | "stochastics"
requirement_level muss einer dieser Werte sein: "basic" | "advanced"
sub_part ist null wenn keine Teilaufgabe.`;
