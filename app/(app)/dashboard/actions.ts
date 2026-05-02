"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateProgress(
  subject: string,
  topic: string,
  correct: number,
  total: number
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const mastery_pct = Math.round((correct / total) * 100);

  const { error } = await supabase.from("progress").upsert(
    {
      user_id: user.id,
      subject,
      topic,
      mastery_pct,
      last_practiced_at: new Date().toISOString(),
    },
    { onConflict: "user_id, subject, topic" }
  );

  if (error) throw error;
}
