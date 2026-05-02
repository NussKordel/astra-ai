"use server";

import { openrouter, MODELS } from "@/lib/openrouter/client";
import { quizPrompt } from "@/lib/openrouter/prompts/quiz";

export async function generateQuiz(subject: string, topic: string, count: number = 5) {
  const response = await openrouter.chat.completions.create({
    model: MODELS.default,
    messages: [
      { role: "user", content: quizPrompt(subject, topic, count) },
    ],
  });

  const content = response.choices[0].message.content || "[]";
  
  // Extract JSON from the response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Invalid quiz format from AI");
  }

  return JSON.parse(jsonMatch[0]);
}
