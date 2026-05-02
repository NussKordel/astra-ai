import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const supabase = createClient();

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: activeSubscriptions } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: publishedTasks } = await supabase
    .from("abitur_tasks")
    .select("*", { count: "exact", head: true })
    .eq("published", true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Übersicht über die Plattform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gesamtnutzer</p>
            <p className="text-3xl font-bold">{totalUsers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Aktive Abonnements</p>
            <p className="text-3xl font-bold">{activeSubscriptions || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Veröffentlichte Abitur-Aufgaben</p>
            <p className="text-3xl font-bold">{publishedTasks || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
