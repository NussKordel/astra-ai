"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        const { data: subData } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single();
        setProfile(profileData);
        setSubscription(subData);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const applyCoupon = async () => {
    if (couponInput.trim().toUpperCase() !== "ASTRAUNLIMITED") {
      setCouponMsg("Ungültiger Coupon-Code");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ coupon_code: "ASTRAUNLIMITED", subscription_tier: "plus" }).eq("id", user.id);
    setCouponMsg("Coupon aktiviert! Du hast jetzt unbegrenzten Zugang.");
    setProfile((prev: any) => ({ ...prev, coupon_code: "ASTRAUNLIMITED", subscription_tier: "plus" }));
  };

  const handleUpgrade = async (priceId: string) => {
    const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceId }) });
    const { url } = await response.json();
    if (url) window.location.href = url;
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" /></div>;

  const isTrialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  const isUnlimited = profile?.coupon_code === "ASTRAUNLIMITED" || profile?.subscription_tier === "plus" || profile?.subscription_tier === "abitur";

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Einstellungen</h1>
        <p className="text-muted-foreground mt-1">Verwalte dein Konto und Abonnement</p>
      </div>

      {/* Plan */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Aktueller Plan</p>
            <div className="flex items-center gap-2">
              <Badge className={isUnlimited ? "bg-violet-600 text-white border-0" : "bg-white/10 text-white border-0"}>
                <Zap className="w-3 h-3 mr-1" />
                {isUnlimited ? (profile?.coupon_code === "ASTRAUNLIMITED" ? "Unlimited (Coupon)" : profile?.subscription_tier === "plus" ? "Astra Plus" : "Abitur AI") : "Free"}
              </Badge>
            </div>
          </div>
          {isTrialActive && <p className="text-sm text-violet-400">Testphase bis {new Date(profile.trial_ends_at).toLocaleDateString("de-DE")}</p>}
        </div>

        {subscription?.current_period_end && (
          <p className="text-sm text-muted-foreground mb-4">Nächste Abrechnung: {new Date(subscription.current_period_end).toLocaleDateString("de-DE")}</p>
        )}

        {/* Coupon */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Hast du einen Coupon-Code?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => { setCouponInput(e.target.value); setCouponMsg(""); }}
              placeholder="Code eingeben"
              className="flex-1 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500"
            />
            <Button onClick={applyCoupon} variant="outline" className="border-white/10 hover:bg-white/5" disabled={!couponInput.trim()}>
              Einlösen
            </Button>
          </div>
          {couponMsg && (
            <p className={`text-sm mt-2 ${couponMsg.includes("aktiviert") ? "text-green-400" : "text-red-400"}`}>
              {couponMsg}
            </p>
          )}
        </div>

        {!isUnlimited && (
          <div className="space-y-3">
            <Button onClick={() => handleUpgrade("price_plus_monthly")} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500">
              <CreditCard className="w-4 h-4 mr-2" />
              Astra Plus abonnieren (9,99€/Monat)
            </Button>
            <Button onClick={() => handleUpgrade("price_abitur_onetime")} variant="outline" className="w-full border-white/10 hover:bg-white/5">
              Abitur AI kaufen (147€ einmalig)
            </Button>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
        <p className="text-sm text-muted-foreground mb-1">Profil</p>
        <p className="text-white"><span className="text-muted-foreground">Klassenstufe:</span> {profile?.grade_level || "Nicht angegeben"}</p>
        <p className="text-white mt-1"><span className="text-muted-foreground">Fächer:</span> {profile?.subjects?.join(", ") || "Nicht angegeben"}</p>
        <p className="text-white mt-1"><span className="text-muted-foreground">API-Aufrufe:</span> {profile?.api_calls_used || 0} / {isUnlimited ? "∞" : "3"}</p>
      </div>
    </div>
  );
}
