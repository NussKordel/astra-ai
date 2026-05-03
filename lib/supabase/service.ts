import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase service role environment variables");
    return {
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: new Error("Missing Supabase service config") }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
          list: async () => ({ data: null, error: new Error("Missing Supabase service config") }),
          remove: async () => ({ data: null, error: new Error("Missing Supabase service config") }),
        }),
      },
    } as any;
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
