import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/dashboard/LogoutButton";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-primary">
                Astra AI
              </Link>
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/tutor"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  KI-Tutor
                </Link>
                <Link
                  href="/exam-prep"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Prüfungstraining
                </Link>
                <Link
                  href="/abitur"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Abitur AI
                </Link>
                <Link
                  href="/settings"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Einstellungen
                </Link>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
