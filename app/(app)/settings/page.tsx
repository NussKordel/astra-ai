"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const { data: subData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setProfile(profileData);
        setSubscription(subData);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  const handleUpgrade = async (priceId: string) => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const { url } = await response.json();
    if (url) window.location.href = url;
  };

  const handleManageBilling = async () => {
    const response = await fetch("/api/billing-portal", {
      method: "POST",
    });

    const { url } = await response.json();
    if (url) window.location.href = url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isTrialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground mt-2">
          Verwalte dein Konto und Abonnement
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dein Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Aktueller Plan</p>
              <Badge
                variant={
                  profile?.subscription_tier === "free" ? "secondary" : "default"
                }
              >
                {profile?.subscription_tier === "free"
                  ? "Free"
                  : profile?.subscription_tier === "plus"
                  ? "Astra Plus"
                  : "Abitur AI"}
              </Badge>
            </div>
            {isTrialActive && (
              <p className="text-sm text-primary">
                Testphase bis{" "}
                {new Date(profile.trial_ends_at).toLocaleDateString("de-DE")}
              </p>
            )}
          </div>

          {subscription?.current_period_end && (
            <p className="text-sm text-muted-foreground">
              Nächste Abrechnung:{" "}
              {new Date(subscription.current_period_end).toLocaleDateString("de-DE")}
            </p>
          )}

          <Separator />

          {profile?.subscription_tier === "free" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upgrade auf Astra Plus für unbegrenzten Zugang zu allen Features.
              </p>
              <Button
                onClick={() => handleUpgrade("price_plus_monthly")}
                className="w-full"
              >
                Astra Plus abonnieren (9,99€/Monat)
              </Button>
              <Button
                onClick={() => handleUpgrade("price_abitur_onetime")}
                variant="outline"
                className="w-full"
              >
                Abitur AI kaufen (147€ einmalig)
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button onClick={handleManageBilling} variant="outline" className="w-full">
                Abonnement verwalten
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Du kannst dein Abonnement jederzeit kündigen.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <span className="text-muted-foreground">Klassenstufe:</span>{" "}
            {profile?.grade_level || "Nicht angegeben"}
          </p>
          <p>
            <span className="text-muted-foreground">Fächer:</span>{" "}
            {profile?.subjects?.join(", ") || "Nicht angegeben"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
