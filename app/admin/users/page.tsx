import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const supabase = createClient();
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("profiles")
    .select("*, subscriptions(tier, status)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (search) {
    // Note: This is a simplified search. In production, you'd want to search by email via auth.users
    query = query.ilike("grade_level", `%${search}%`);
  }

  const { data: users, count } = await query;

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nutzer-Verwaltung</h1>
        <p className="text-muted-foreground mt-2">
          {count || 0} registrierte Nutzer
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-left p-4 font-medium">Klassenstufe</th>
                  <th className="text-left p-4 font-medium">Fächer</th>
                  <th className="text-left p-4 font-medium">Plan</th>
                  <th className="text-left p-4 font-medium">Registriert</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono text-xs">{user.id.slice(0, 8)}...</td>
                    <td className="p-4">{user.grade_level || "—"}</td>
                    <td className="p-4">
                      <span className="truncate max-w-[200px] inline-block">
                        {user.subjects?.join(", ") || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          user.subscription_tier === "free"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {user.subscription_tier}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("de-DE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/users?page=${p}${search ? `&search=${search}` : ""}`}
              className={`px-3 py-1 rounded-md text-sm ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
