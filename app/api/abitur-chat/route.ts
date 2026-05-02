import { NextRequest, NextResponse } from "next/server";
import { openrouter, MODELS } from "@/lib/openrouter/client";
import { abiturTutorPrompt } from "@/lib/openrouter/prompts/abitur";

export async function POST(request: NextRequest) {
  try {
    const { question, solution, history, subjectArea, requirementLevel } = await request.json();

    const systemPrompt = abiturTutorPrompt(subjectArea, requirementLevel);

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Hier ist die Abitur-Aufgabe:\n\n${question}\n\n${solution ? `Lösung: ${solution}\n\n` : ""}Bitte erkläre mir die Lösung Schritt für Schritt.`,
      },
      ...history.map((h: any) => ({ role: h.role, content: h.content })),
    ];

    const response = await openrouter.chat.completions.create({
      model: MODELS.default,
      messages: messages as any,
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response as any) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Abitur chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
