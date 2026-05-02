import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0€",
    period: "/Monat",
    description: "Perfekt zum Ausprobieren",
    features: ["KI-Tutor für alle Fächer", "Bis zu 3 Nachrichten pro Tag", "Grundlegendes Quiz-Feature", "7 Tage kostenlose Testphase"],
    cta: "Kostenlos starten",
    href: "/signup",
    popular: false,
  },
  {
    name: "Astra Plus",
    price: "9,99€",
    period: "/Monat",
    description: "Für ernsthafte Lerner",
    features: ["Unbegrenzte Nachrichten", "Prüfungstraining", "Bild-Scan für Hausaufgaben", "Podcast-Modus", "Detaillierte Fortschrittsanalyse"],
    cta: "Upgrade",
    href: "/settings",
    popular: true,
  },
  {
    name: "Abitur AI",
    price: "147€",
    period: "einmalig",
    description: "Lebenslanger Zugang",
    features: ["Alle Plus-Features", "415+ echte Abitur-Aufgaben", "KI-gestützte Lösungen", "Notenvorhersage", "Lebenslanger Zugang"],
    cta: "Kaufen",
    href: "/settings",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Wähle deinen Plan</h1>
          <p className="text-xl text-muted-foreground">Starte kostenlos und upgrade, wenn du bereit bist</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 ${
                plan.popular
                  ? "bg-gradient-to-b from-violet-900/20 to-transparent border-2 border-violet-500/30"
                  : "bg-white/[0.03] border border-white/5"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Beliebt
                </Badge>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-violet-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
                      : "bg-white/5 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
