"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Flame, User } from "lucide-react";

export default function AppNavbar({
  userEmail,
  streak = 0,
}: {
  userEmail?: string;
  streak?: number;
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">a</span>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-1 py-1">
            <NavLink href="/dashboard" label="Fragen" />
            <NavLink href="/exam-prep" label="Prüfungstraining" />
            <NavLink href="/dashboard?tab=classroom" label="Mein Klassenraum" />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-500">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-medium">{streak}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
              <User className="w-4 h-4 text-white" />
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
    >
      {label}
    </a>
  );
}
