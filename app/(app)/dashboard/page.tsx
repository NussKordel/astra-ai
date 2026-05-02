import { createClient } from "@/lib/supabase/server";
import MainChatInterface from "@/components/dashboard/MainChatInterface";
import UpgradeCard from "@/components/dashboard/UpgradeCard";

export default async function DashboardPage() {
  const supabase = createClient();
  
  let profile = null;
  let user = null;
  
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
    
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      profile = data;
    }
  } catch (e) {
    // Silent fail
  }

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1">
        <MainChatInterface />
      </div>

      {/* Right Panel - Only show on larger screens */}
      <div className="hidden xl:flex w-80 flex-col items-center justify-center p-6 border-l border-white/5">
        <UpgradeCard />
      </div>
    </div>
  );
}
