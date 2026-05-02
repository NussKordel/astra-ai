"use server";

import { createClient } from "@/lib/supabase/server";
import { openrouter, MODELS } from "@/lib/openrouter/client";
import { pdfExtractionPrompt } from "@/lib/openrouter/prompts/pdf-extraction";
import { fromBuffer } from "pdf2pic";

export async function uploadAbiturExam(formData: FormData) {
  const supabase = createClient();
  const year = parseInt(formData.get("year") as string);
  const state = formData.get("state") as string;
  const file = formData.get("file") as File;

  if (!file) throw new Error("No file provided");

  const fileExt = file.name.split(".").pop();
  const fileName = `abitur-${year}-${state}-${Date.now()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("abitur-pdfs")
    .upload(fileName, file, {
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("abitur-pdfs").getPublicUrl(uploadData.path);

  const { data: exam, error } = await supabase
    .from("abitur_exams")
    .insert({
      year,
      state,
      file_url: publicUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return exam;
}

export async function extractTasksFromExam(examId: string) {
  const supabase = createClient();

  const { data: exam } = await supabase
    .from("abitur_exams")
    .select("*")
    .eq("id", examId)
    .single();

  if (!exam) throw new Error("Exam not found");

  // Fetch PDF as buffer
  const response = await fetch(exam.file_url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Convert PDF to images
  const convert = fromBuffer(buffer, {
    density: 150,
    format: "png",
    width: 1200,
    height: 1600,
  });

  const images = await convert.bulk(-1);

  // Process each page with vision model
  for (let i = 0; i < images.length; i++) {
    const image = images[i] as any;
    if (!image.base64) continue;

    try {
      const visionResponse = await openrouter.chat.completions.create({
        model: MODELS.vision,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: pdfExtractionPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${image.base64}`,
                },
              },
            ],
          },
        ],
      });

      const content = visionResponse.choices[0].message.content || "[]";
      const jsonMatch = content.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
        const tasks = JSON.parse(jsonMatch[0]);
        for (const task of tasks) {
          await supabase.from("abitur_tasks").insert({
            exam_id: examId,
            question_number: task.question_number,
            sub_part: task.sub_part,
            subject_area: task.subject_area,
            requirement_level: task.requirement_level,
            question_text: task.question_text,
            solution_text: task.solution_text,
            published: false,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to process page ${i + 1}:`, error);
    }
  }

  // Update exam processed_at
  await supabase
    .from("abitur_exams")
    .update({ processed_at: new Date().toISOString() })
    .eq("id", examId);
}

export async function publishTask(taskId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("abitur_tasks")
    .update({ published: true })
    .eq("id", taskId);

  if (error) throw error;
}

export async function updateTask(
  taskId: string,
  data: { question_text: string; solution_text: string }
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("abitur_tasks")
    .update(data)
    .eq("id", taskId);

  if (error) throw error;
}
