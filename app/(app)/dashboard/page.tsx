import { createClient } from "@/lib/supabase/server";
import MainChatInterface from "@/components/dashboard/MainChatInterface";
import UpgradeCard from "@/components/dashboard/UpgradeCard";

export default async function DashboardPage() {
  let user = null;

  try {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
  } catch (e) {
    // Silent fail - client will handle auth state
  }

  return (
    <div className="h-full flex">
      <div className="flex-1">
        <MainChatInterface />
      </div>
      <div className="hidden xl:flex w-80 flex-col items-center justify-center p-6 border-l border-white/5">
        <UpgradeCard />
      </div>
    </div>
  );
}
