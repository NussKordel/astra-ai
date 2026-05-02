import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let users: any[] = [];
  let count = 0;

  try {
    const supabase = createClient();
    let query = supabase
      .from("profiles")
      .select("*, subscriptions(tier, status)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (search) {
      query = query.ilike("grade_level", `%${search}%`);
    }

    const { data, count: totalCount } = await query;
    users = data || [];
    count = totalCount || 0;
  } catch (e) {
    // Silent fail
  }

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Nutzer-Verwaltung</h1>
        <p className="text-muted-foreground mt-2">{count} registrierte Nutzer</p>
      </div>

      <Card className="bg-white/[0.03] border-white/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Klassenstufe</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Fächer</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Registriert</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 font-mono text-xs text-muted-foreground">{user.id.slice(0, 8)}...</td>
                    <td className="p-4 text-white">{user.grade_level || "—"}</td>
                    <td className="p-4 text-muted-foreground">
                      <span className="truncate max-w-[200px] inline-block">{user.subjects?.join(", ") || "—"}</span>
                    </td>
                    <td className="p-4">
                      <Badge className={user.subscription_tier === "free" ? "bg-white/10 text-white border-0" : "bg-violet-600 text-white border-0"}>
                        {user.subscription_tier}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{new Date(user.created_at).toLocaleDateString("de-DE")}</td>
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
                p === page ? "bg-violet-600 text-white" : "bg-white/5 text-muted-foreground hover:bg-white/10"
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
