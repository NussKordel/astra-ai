import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0€",
    period: "/Monat",
    description: "Perfekt zum Ausprobieren",
    features: [
      "KI-Tutor für alle Fächer",
      "Bis zu 10 Nachrichten pro Tag",
      "Grundlegendes Quiz-Feature",
      "7 Tage kostenlose Testphase",
    ],
    cta: "Kostenlos starten",
    href: "/signup",
    popular: false,
  },
  {
    name: "Astra Plus",
    price: "9,99€",
    period: "/Monat",
    description: "Für ernsthafte Lerner",
    features: [
      "Unbegrenzte Nachrichten",
      "Prüfungstraining",
      "Bild-Scan für Hausaufgaben",
      "Podcast-Modus",
      "Detaillierte Fortschrittsanalyse",
    ],
    cta: "Upgrade",
    href: "/settings",
    popular: true,
  },
  {
    name: "Abitur AI",
    price: "147€",
    period: "einmalig",
    description: "Lebenslanger Zugang",
    features: [
      "Alle Plus-Features",
      "415+ echte Abitur-Aufgaben",
      "KI-gestützte Schritt-für-Schritt-Lösungen",
      "Notenvorhersage",
      "Lebenslanger Zugang",
    ],
    cta: "Kaufen",
    href: "/settings",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Wähle deinen Plan</h1>
          <p className="text-xl text-muted-foreground">
            Starte kostenlos und upgrade, wenn du bereit bist
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Beliebt
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className="w-full mt-4"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
