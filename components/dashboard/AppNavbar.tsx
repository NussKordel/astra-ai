"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Flame, User, Settings, BookOpen, GraduationCap, BrainCircuit, X, Menu } from "lucide-react";

export default function AppNavbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();
        setProfile(profileData);

        // Calculate streak
        const { data: conversations } = await supabase
          .from("conversations")
          .select("created_at")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });

        if (conversations && conversations.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dates = new Set<number>();
          conversations.forEach((c: any) => {
            const d = new Date(c.created_at);
            d.setHours(0, 0, 0, 0);
            dates.add(d.getTime());
          });
          const sortedDates = Array.from(dates).sort((a, b) => b - a);
          let s = 0;
          for (let i = 0; i < sortedDates.length; i++) {
            const expectedDate = today.getTime() - i * 86400000;
            if (sortedDates[i] === expectedDate) {
              s++;
            } else if (i === 0 && sortedDates[0] === today.getTime() - 86400000) {
              s++;
              continue;
            } else {
              break;
            }
          }
          setStreak(s);
        }
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isAdmin = profile?.is_admin || profile?.subscription_tier === "admin";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-muted-foreground hover:text-foreground transition-colors md:hidden"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div 
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              <span className="text-white text-sm font-bold">a</span>
            </div>
          </div>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-1 py-1">
            <NavLink href="/tutor" label="Fragen" icon={<BrainCircuit className="w-3.5 h-3.5" />} active={pathname.startsWith("/tutor")} />
            <NavLink href="/exam-prep" label="Prüfungstraining" icon={<GraduationCap className="w-3.5 h-3.5" />} active={pathname.startsWith("/exam-prep")} />
            <NavLink href="/abitur" label="Abitur" icon={<BookOpen className="w-3.5 h-3.5" />} active={pathname.startsWith("/abitur")} />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-500">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-medium">{streak}</span>
            </div>
            
            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <User className="w-4 h-4 text-white" />
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl overflow-hidden z-50">
                  <button
                    onClick={() => { router.push("/settings"); setShowProfileMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Einstellungen
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => { router.push("/admin"); setShowProfileMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-violet-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <BrainCircuit className="w-4 h-4" />
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Abmelden
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            <MobileNavLink href="/tutor" label="Fragen" icon={<BrainCircuit className="w-4 h-4" />} onClick={() => setShowMobileMenu(false)} />
            <MobileNavLink href="/exam-prep" label="Prüfungstraining" icon={<GraduationCap className="w-4 h-4" />} onClick={() => setShowMobileMenu(false)} />
            <MobileNavLink href="/abitur" label="Abitur" icon={<BookOpen className="w-4 h-4" />} onClick={() => setShowMobileMenu(false)} />
            <MobileNavLink href="/settings" label="Einstellungen" icon={<Settings className="w-4 h-4" />} onClick={() => setShowMobileMenu(false)} />
            {isAdmin && (
              <MobileNavLink href="/admin" label="Admin Panel" icon={<BrainCircuit className="w-4 h-4" />} onClick={() => setShowMobileMenu(false)} />
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active: boolean }) {
  return (
    <a
      href={href}
      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
        active
          ? "bg-white/10 text-white"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </a>
  );
}

function MobileNavLink({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white hover:bg-white/5 transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}
