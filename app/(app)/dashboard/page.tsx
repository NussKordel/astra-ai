import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: progress } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", user.id)
    .order("last_practiced_at", { ascending: false });

  const { data: recentConversations } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Calculate streak
  const { data: allConversations } = await supabase
    .from("conversations")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  let streak = 0;
  if (allConversations && allConversations.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dates = new Set(
      allConversations.map((c) => {
        const d = new Date(c.created_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );

    const sortedDates = Array.from(dates).sort((a, b) => b - a);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = today.getTime() - i * 86400000;
      if (sortedDates[i] === expectedDate) {
        streak++;
      } else if (i === 0 && sortedDates[0] === today.getTime() - 86400000) {
        streak++;
        continue;
      } else {
        break;
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">
            Willkommen zurück{profile?.grade_level ? ", " + profile.grade_level : ""}
          </h1>
          <p className="text-muted-foreground mt-1">
            Hier ist dein Lernfortschritt
          </p>
        </div>
        <Badge variant={profile?.subscription_tier === "free" ? "secondary" : "default"}>
          {profile?.subscription_tier === "free"
            ? "Free"
            : profile?.subscription_tier === "plus"
            ? "Astra Plus"
            : "Abitur AI"}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Aktuelle Streak</p>
            <p className="text-3xl font-bold">{streak} Tage</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gelernte Themen</p>
            <p className="text-3xl font-bold">{progress?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Sitzungen</p>
            <p className="text-3xl font-bold">{allConversations?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Fortschritt pro Fach</h2>
        {progress && progress.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress.map((p) => (
              <Card key={p.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{p.subject}</p>
                      <p className="text-sm text-muted-foreground">{p.topic}</p>
                    </div>
                    <Badge variant={p.mastery_pct >= 70 ? "default" : "secondary"}>
                      {p.mastery_pct}%
                    </Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${p.mastery_pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Zuletzt geübt: {new Date(p.last_practiced_at).toLocaleDateString("de-DE")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Beginne mit dem Lernen, um deinen Fortschritt zu sehen.</p>
              <Link href="/tutor" className="text-primary hover:underline mt-2 inline-block">
                Zum KI-Tutor
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Zuletzt gelernt</h2>
        {recentConversations && recentConversations.length > 0 ? (
          <div className="space-y-2">
            {recentConversations.map((conv) => (
              <Link
                key={conv.id}
                href={
                  conv.module === "tutor"
                    ? `/tutor/${encodeURIComponent(conv.subject)}`
                    : conv.module === "exam_prep"
                    ? `/exam-prep/${conv.id}`
                    : `/abitur`
                }
              >
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{conv.subject}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {conv.module === "tutor"
                          ? "KI-Tutor"
                          : conv.module === "exam_prep"
                          ? "Prüfungstraining"
                          : "Abitur"}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(conv.created_at).toLocaleDateString("de-DE")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Noch keine Lernsitzungen.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
