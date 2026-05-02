import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireTier(userId: string, minTier: "plus" | "abitur") {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, trial_ends_at")
    .eq("id", userId)
    .single();

  if (!profile) {
    redirect("/pricing");
  }

  const tierHierarchy = { free: 0, plus: 1, abitur: 2 };
  const userTierValue = tierHierarchy[profile.subscription_tier as keyof typeof tierHierarchy] || 0;
  const minTierValue = tierHierarchy[minTier];

  // Check trial
  const trialActive = profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date();

  if (!trialActive && userTierValue < minTierValue) {
    redirect("/pricing");
  }
}
