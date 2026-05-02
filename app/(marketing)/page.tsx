import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "KI-Tutor",
    description: "Persönlicher KI-Nachhilfelehrer für 13+ Fächer. Erklärt Schritt für Schritt auf Deutsch.",
    icon: "🎓",
  },
  {
    title: "Prüfungstraining",
    description: "Simuliere echte Klausuren mit zeitgesteuerten Übungen und sofortigem Feedback.",
    icon: "📝",
  },
  {
    title: "Abitur AI",
    description: "415+ echte Abitur-Aufgaben mit KI-gestützter Schritt-für-Schritt-Erklärung.",
    icon: "📊",
  },
  {
    title: "Fortschrittsverfolgung",
    description: "Behalte deinen Lernfortschritt im Blick mit Mastery-Metriken und Streak-Zählern.",
    icon: "📈",
  },
  {
    title: "Bild-Scan",
    description: "Fotografiere deine Hausaufgaben und lass sie von der KI sofort lösen.",
    icon: "📷",
  },
  {
    title: "Podcast-Modus",
    description: "Lass dir Erklärungen und Lösungen einfach vorlesen.",
    icon: "🎧",
  },
];

const testimonials = [
  {
    name: "Lisa M.",
    grade: "Klasse 11",
    text: "Dank Astra AI habe ich in Mathe von einer 4 auf eine 2 verbessert. Die Erklärungen sind super verständlich!",
  },
  {
    name: "Max K.",
    grade: "Klasse 13",
    text: "Das Abitur-Training hat mir so geholfen. Die echten Aufgaben aus vergangenen Jahren sind Gold wert.",
  },
  {
    name: "Sarah B.",
    grade: "Uni",
    text: "Endlich eine App, die auch komplexe Uni-Themen einfach erklärt. Absolut empfehlenswert!",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4" variant="secondary">
            Jetzt mit 7 Tagen kostenlos testen
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            Verbessere deine Noten{" "}
            <span className="text-primary">2x schneller</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Deine persönliche KI-Nachhilfe für alle Fächer — von der Grundschule bis zur Uni.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Kostenlos starten
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Preise ansehen
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">1.000.000+</span>
              <span>Schüler</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">4.87</span>
              <span>Sterne</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Alles, was du zum Lernen brauchst
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="text-4xl mb-2">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Das sagen unsere Nutzer
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.grade}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bereit, bessere Noten zu schreiben?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Starte jetzt deine kostenlose Testwoche und erlebe, wie Astra AI dir beim Lernen hilft.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Kostenlos starten
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xl font-bold text-primary">Astra AI</div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Startseite</Link>
              <Link href="/pricing" className="hover:text-foreground">Preise</Link>
              <Link href="/login" className="hover:text-foreground">Anmelden</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Astra AI. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
