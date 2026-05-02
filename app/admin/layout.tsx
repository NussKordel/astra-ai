import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isAdmin = false;

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.is_admin || false;
  } catch (e) {
    redirect("/dashboard");
  }

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">a</span>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Übersicht</Link>
                <Link href="/admin/users" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Nutzer</Link>
                <Link href="/admin/abitur" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Abitur</Link>
              </div>
            </div>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Zur App</Link>
          </div>
        </div>
      </nav>
      <main className="pt-14 h-screen px-6 py-8">
        {children}
      </main>
    </div>
  );
}
