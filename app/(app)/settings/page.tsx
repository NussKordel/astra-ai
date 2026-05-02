"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Zap, CreditCard, Sparkles, Check, X, Infinity, Image, BookOpen, Brain, MessageSquare, Lock } from "lucide-react";

const features = [
  { name: "KI-Tutor Chat", icon: <MessageSquare className="w-4 h-4" />, free: true, plus: true, abitur: true },
  { name: "Bild-Scan (Hausaufgaben)", icon: <Image className="w-4 h-4" />, free: true, plus: true, abitur: true },
  { name: "PDF-Upload", icon: <BookOpen className="w-4 h-4" />, free: false, plus: true, abitur: true },
  { name: "Unbegrenzte Nachrichten", icon: <Infinity className="w-4 h-4" />, free: false, plus: true, abitur: true },
  { name: "Prüfungstraining", icon: <Brain className="w-4 h-4" />, free: false, plus: true, abitur: true },
  { name: "Abitur AI (415+ Aufgaben)", icon: <BookOpen className="w-4 h-4" />, free: false, plus: false, abitur: true },
  { name: "Podcast-Modus", icon: <MessageSquare className="w-4 h-4" />, free: false, plus: true, abitur: true },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [showAdminInput, setShowAdminInput] = useState(false);
  const supabase = createClient();
  const router = useRouter();

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
    if (couponInput.trim().toUpperCase() === "ASTRAUNLIMITED") {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("profiles").update({ coupon_code: "ASTRAUNLIMITED", subscription_tier: "plus" }).eq("id", user.id);
      setCouponMsg("Coupon aktiviert! Du hast jetzt unbegrenzten Zugang.");
      setProfile((prev: any) => ({ ...prev, coupon_code: "ASTRAUNLIMITED", subscription_tier: "plus" }));
    } else {
      setCouponMsg("Ungültiger Coupon-Code");
    }
  };

  const applyAdminCode = async () => {
    const correctCode = process.env.ADMIN_SECRET_CODE || "astra-admin-2024";
    if (adminCode === correctCode) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("profiles").update({ 
        subscription_tier: "plus", 
        coupon_code: "ADMIN_UNLOCKED",
        is_admin: true 
      }).eq("id", user.id);
      setCouponMsg("Admin-Code aktiviert! Alle Features freigeschaltet.");
      setProfile((prev: any) => ({ ...prev, subscription_tier: "plus", is_admin: true }));
      setShowAdminInput(false);
    } else {
      setCouponMsg("Falscher Admin-Code");
    }
  };

  const handleUpgrade = async (priceId: string) => {
    const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceId }) });
    const { url } = await response.json();
    if (url) window.location.href = url;
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" /></div>;

  const isTrialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  const isUnlimited = profile?.is_admin || profile?.coupon_code === "ASTRAUNLIMITED" || profile?.coupon_code === "ADMIN_UNLOCKED" || profile?.subscription_tier === "plus" || profile?.subscription_tier === "abitur";
  const currentTier = profile?.is_admin ? "admin" : profile?.subscription_tier || "free";

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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentTier === "free" ? "bg-white/10 text-white" : 
                currentTier === "plus" ? "bg-violet-600 text-white" :
                "bg-amber-600 text-white"
              }`}>
                {currentTier === "admin" ? "Admin" : currentTier === "free" ? "Free" : currentTier === "plus" ? "Astra Plus" : "Abitur AI"}
              </span>
            </div>
          </div>
          {isTrialActive && <p className="text-sm text-violet-400">Testphase bis {new Date(profile.trial_ends_at).toLocaleDateString("de-DE")}</p>}
        </div>

        {/* Features List */}
        <div className="space-y-2 mb-6">
          <p className="text-sm font-medium text-white mb-3">Deine Features</p>
          {features.map((feature) => {
            const hasAccess = currentTier === "admin" || 
              (currentTier === "abitur" && feature.abitur) ||
              (currentTier === "plus" && feature.plus) ||
              (currentTier === "free" && feature.free);
            
            return (
              <div key={feature.name} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{feature.icon}</span>
                  <span className={hasAccess ? "text-white" : "text-muted-foreground"}>{feature.name}</span>
                </div>
                {hasAccess ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>

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
            <button
              onClick={applyCoupon}
              className="px-4 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all disabled:opacity-50"
              disabled={!couponInput.trim()}
            >
              Einlösen
            </button>
          </div>
        </div>

        {/* Admin Code */}
        <div className="mb-4">
          <button
            onClick={() => setShowAdminInput(!showAdminInput)}
            className="text-sm text-muted-foreground hover:text-white transition-colors"
          >
            Admin-Code?
          </button>
          {showAdminInput && (
            <div className="flex gap-2 mt-2">
              <input
                type="password"
                value={adminCode}
                onChange={(e) => { setAdminCode(e.target.value); setCouponMsg(""); }}
                placeholder="Admin-Code"
                className="flex-1 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={applyAdminCode}
                className="px-4 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all"
              >
                Freischalten
              </button>
            </div>
          )}
        </div>

        {couponMsg && (
          <p className={`text-sm mb-4 ${couponMsg.includes("aktiviert") ? "text-green-400" : "text-red-400"}`}>
            {couponMsg}
          </p>
        )}

        {!isUnlimited && (
          <div className="space-y-3">
            <button onClick={() => handleUpgrade("price_plus_monthly")} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Astra Plus abonnieren (9,99€/Monat)
            </button>
            <button onClick={() => handleUpgrade("price_abitur_onetime")} className="w-full py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Abitur AI kaufen (147€ einmalig)
            </button>
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
