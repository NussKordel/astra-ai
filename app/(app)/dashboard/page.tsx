import { createClient } from "@/lib/supabase/server";
import MainChatInterface from "@/components/dashboard/MainChatInterface";

export default async function DashboardPage() {
  return (
    <div className="h-full">
      <MainChatInterface />
    </div>
  );
}
