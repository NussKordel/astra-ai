import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppNavbar from "@/components/dashboard/AppNavbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  
  let user = null;
  let streak = 0;
  
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
  } catch (e) {
    // Silent fail - middleware will handle redirect
  }

  if (!user) {
    redirect("/login");
  }

  // Calculate streak
  try {
    const { data: conversations } = await supabase
      .from("conversations")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (conversations && conversations.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dates = new Set(
        conversations.map((c) => {
          const d = new Date(c.created_at);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );

      const sortedDates = Array.from(dates).sort((a, b) => b - a);
      
      for (let i = 0; i < sortedDates.length; i++) {
        const expectedDate = today.getTime() - i * 86400000;
        if (sortedDates[i] === expectedDate || (i === 0 && sortedDates[0] === today.getTime() - 86400000 && streak === 0)) {
          if (sortedDates[i] === expectedDate) streak++;
          else if (i === 0 && sortedDates[0] === today.getTime() - 86400000) { streak++; continue; }
          else break;
        } else {
          break;
        }
      }
    }
  } catch (e) {
    // Silent fail
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AppNavbar userEmail={user.email} streak={streak} />
      <main className="pt-14 h-screen">
        {children}
      </main>
    </div>
  );
}
