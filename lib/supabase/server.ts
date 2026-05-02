import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    // Return a mock client that won't crash but will return null for auth
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error("Missing Supabase config") }),
        getSession: async () => ({ data: { session: null }, error: new Error("Missing Supabase config") }),
        exchangeCodeForSession: async () => ({ data: { session: null, user: null }, error: new Error("Missing Supabase config") }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ data: null, error: new Error("Missing Supabase config"), count: null }),
        insert: () => ({ data: null, error: new Error("Missing Supabase config") }),
        update: () => ({ data: null, error: new Error("Missing Supabase config") }),
        upsert: () => ({ data: null, error: new Error("Missing Supabase config") }),
        delete: () => ({ data: null, error: new Error("Missing Supabase config") }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: new Error("Missing Supabase config") }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      },
    } as any;
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // Silent fail in server components
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch (error) {
          // Silent fail in server components
        }
      },
    },
  });
}
