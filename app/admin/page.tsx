import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminPage() {
  let totalUsers = 0;
  let activeSubscriptions = 0;
  let publishedTasks = 0;

  try {
    const supabase = createClient();
    
    try {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      totalUsers = count || 0;
    } catch (e) {}

    try {
      const { count } = await supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active");
      activeSubscriptions = count || 0;
    } catch (e) {}

    try {
      const { count } = await supabase.from("abitur_tasks").select("*", { count: "exact", head: true }).eq("published", true);
      publishedTasks = count || 0;
    } catch (e) {}
  } catch (e) {
    // Silent fail
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Übersicht über die Plattform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/[0.03] border-white/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gesamtnutzer</p>
            <p className="text-3xl font-bold text-white">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Aktive Abonnements</p>
            <p className="text-3xl font-bold text-white">{activeSubscriptions}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Veröffentlichte Abitur-Aufgaben</p>
            <p className="text-3xl font-bold text-white">{publishedTasks}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
