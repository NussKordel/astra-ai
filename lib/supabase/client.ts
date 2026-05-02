import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables in browser");
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error("Missing Supabase config") }),
        getSession: async () => ({ data: { session: null }, error: new Error("Missing Supabase config") }),
        signInWithPassword: async () => ({ data: { session: null, user: null }, error: new Error("Missing Supabase config") }),
        signUp: async () => ({ data: { session: null, user: null }, error: new Error("Missing Supabase config") }),
        signInWithOAuth: async () => ({ data: { url: null, provider: null }, error: new Error("Missing Supabase config") }),
        signOut: async () => ({ error: null }),
        exchangeCodeForSession: async () => ({ data: { session: null, user: null }, error: new Error("Missing Supabase config") }),
      },
      from: () => ({
        select: () => ({ data: null, error: new Error("Missing Supabase config") }),
        insert: () => ({ data: null, error: new Error("Missing Supabase config") }),
        update: () => ({ data: null, error: new Error("Missing Supabase config") }),
        upsert: () => ({ data: null, error: new Error("Missing Supabase config") }),
        delete: () => ({ data: null, error: new Error("Missing Supabase config") }),
        eq: () => ({ single: async () => ({ data: null, error: new Error("Missing Supabase config") }) }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: new Error("Missing Supabase config") }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      },
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
