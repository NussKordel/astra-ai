import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function checkApiLimit(userId: string) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, trial_ends_at, coupon_code, api_calls_used")
    .eq("id", userId)
    .single();

  if (!profile) return { allowed: false, reason: "profile_not_found" };

  // Coupon users get unlimited access
  if (profile.coupon_code === "ASTRAUNLIMITED") {
    return { allowed: true, reason: "coupon" };
  }

  // Paid tiers get unlimited
  if (profile.subscription_tier === "plus" || profile.subscription_tier === "abitur") {
    return { allowed: true, reason: "paid" };
  }

  // Check trial
  const trialActive = profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  if (trialActive) {
    return { allowed: true, reason: "trial" };
  }

  // Free tier: 3 API calls limit
  if ((profile.api_calls_used || 0) >= 3) {
    return { allowed: false, reason: "limit_reached" };
  }

  return { allowed: true, reason: "free_within_limit" };
}

export async function incrementApiCalls(userId: string) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("api_calls_used, coupon_code, subscription_tier")
    .eq("id", userId)
    .single();

  // Don't count for unlimited users
  if (
    profile?.coupon_code === "ASTRAUNLIMITED" ||
    profile?.subscription_tier === "plus" ||
    profile?.subscription_tier === "abitur"
  ) {
    return;
  }

  await supabase
    .from("profiles")
    .update({ api_calls_used: (profile?.api_calls_used || 0) + 1 })
    .eq("id", userId);
}
