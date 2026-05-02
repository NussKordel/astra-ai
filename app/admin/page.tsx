"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, BookOpen, Zap, Crown, Check } from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ users: 0, activeSubs: 0, tasks: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const correctCode = process.env.ADMIN_SECRET_CODE || "astra-admin-2024";

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      loadUsers();
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    try {
      const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: subsCount } = await supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active");
      const { count: tasksCount } = await supabase.from("abitur_tasks").select("*", { count: "exact", head: true }).eq("published", true);
      
      setStats({
        users: usersCount || 0,
        activeSubs: subsCount || 0,
        tasks: tasksCount || 0,
      });
    } catch (e) {}
  };

  const loadUsers = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*, subscriptions(tier, status)")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (data) setUsers(data);
    } catch (e) {}
  };

  const handleLogin = () => {
    if (adminCode === correctCode) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Falscher Admin-Code");
    }
  };

  const unlockAllFeatures = async (userId: string) => {
    try {
      await supabase
        .from("profiles")
        .update({ 
          subscription_tier: "plus",
          coupon_code: "ADMIN_UNLOCKED",
          is_admin: true 
        })
        .eq("id", userId);
      
      alert("Features freigeschaltet!");
      loadUsers();
    } catch (e) {
      alert("Fehler beim Freischalten");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
        <Card className="max-w-md w-full bg-[#141414] border-white/10">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-8 h-8 text-violet-400" />
              <CardTitle className="text-white">Admin Panel</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Gib den Admin-Code ein, um auf das Panel zuzugreifen.
            </p>
            <input
              type="password"
              value={adminCode}
              onChange={(e) => { setAdminCode(e.target.value); setError(""); }}
              placeholder="Admin-Code"
              className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
            >
              <Shield className="w-4 h-4 mr-2" />
              Anmelden
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard")}
              className="w-full border-white/10"
            >
              Zurück zur App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-violet-400" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Verwalte Nutzer und Features</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard")}
            className="border-white/10"
          >
            Zurück zur App
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/[0.03] border-white/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-violet-400" />
                <p className="text-sm text-muted-foreground">Gesamtnutzer</p>
              </div>
              <p className="text-3xl font-bold">{stats.users}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/[0.03] border-white/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <p className="text-sm text-muted-foreground">Aktive Abos</p>
              </div>
              <p className="text-3xl font-bold">{stats.activeSubs}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/[0.03] border-white/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-green-400" />
                <p className="text-sm text-muted-foreground">Abitur-Aufgaben</p>
              </div>
              <p className="text-3xl font-bold">{stats.tasks}</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-white/[0.03] border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Nutzer-Verwaltung
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Klasse</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Tier</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">API Calls</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 text-white font-mono text-xs">{user.id.slice(0, 8)}...</td>
                      <td className="p-4 text-muted-foreground">{user.grade_level || "—"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.subscription_tier === "free" ? "bg-white/10 text-white" : 
                          user.subscription_tier === "plus" ? "bg-violet-600/20 text-violet-400" :
                          "bg-amber-600/20 text-amber-400"
                        }`}>
                          {user.subscription_tier}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{user.api_calls_used || 0}</td>
                      <td className="p-4">
                        <button
                          onClick={() => unlockAllFeatures(user.id)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs hover:from-violet-500 hover:to-indigo-500 transition-all flex items-center gap-1"
                        >
                          <Crown className="w-3 h-3" />
                          Alle Features
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
