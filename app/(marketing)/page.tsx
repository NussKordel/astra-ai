import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Brain, BarChart3, Camera, Headphones, Star, Users } from "lucide-react";

const features = [
  { title: "KI-Tutor", description: "Persönlicher KI-Nachhilfelehrer für 13+ Fächer.", icon: Brain },
  { title: "Prüfungstraining", description: "Simuliere echte Klausuren mit sofortigem Feedback.", icon: BookOpen },
  { title: "Abitur AI", description: "415+ echte Abitur-Aufgaben mit KI-Erklärungen.", icon: BarChart3 },
  { title: "Fortschrittsverfolgung", description: "Behalte deinen Lernfortschritt im Blick.", icon: BarChart3 },
  { title: "Bild-Scan", description: "Fotografiere Hausaufgaben und lass sie sofort lösen.", icon: Camera },
  { title: "Podcast-Modus", description: "Lass dir Erklärungen einfach vorlesen.", icon: Headphones },
];

const testimonials = [
  { name: "Lisa M.", grade: "Klasse 11", text: "Dank Astra AI habe ich in Mathe von einer 4 auf eine 2 verbessert." },
  { name: "Max K.", grade: "Klasse 13", text: "Das Abitur-Training hat mir so geholfen. Echte Aufgaben sind Gold wert." },
  { name: "Sarah B.", grade: "Uni", text: "Endlich eine App, die auch komplexe Uni-Themen einfach erklärt." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-40">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Badge className="mb-6 bg-violet-500/10 text-violet-400 border-violet-500/20" variant="outline">
            <Sparkles className="w-3 h-3 mr-1" />
            Jetzt mit 7 Tagen kostenlos testen
          </Badge>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-6">
            Verbessere deine Noten{" "}
            <span className="gradient-text">2x schneller</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Deine persönliche KI-Nachhilfe für alle Fächer — von der Grundschule bis zur Uni.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500">
                Kostenlos starten
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 border-white/10 hover:bg-white/5">
                Preise ansehen
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-2xl font-bold text-white">1.000.000+</span>
              <span>Schüler</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-bold text-white">4.87</span>
              <span>Sterne</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Alles, was du zum Lernen brauchst</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 transition-all">
                <feature.icon className="w-8 h-8 text-violet-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Das sagen unsere Nutzer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                <p className="text-muted-foreground mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.grade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl bg-gradient-to-br from-violet-900/30 to-indigo-900/30 border border-violet-500/20 p-12">
            <h2 className="text-3xl font-bold mb-4">Bereit, bessere Noten zu schreiben?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Starte jetzt deine kostenlose Testwoche und erlebe, wie Astra AI dir beim Lernen hilft.
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 bg-white text-violet-600 hover:bg-gray-100">
                Kostenlos starten
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">a</span>
              </div>
              <span className="text-xl font-bold">Astra AI</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-white transition-colors">Startseite</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Preise</Link>
              <Link href="/login" className="hover:text-white transition-colors">Anmelden</Link>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 Astra AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
