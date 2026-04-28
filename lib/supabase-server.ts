import { createClient } from "@supabase/supabase-js";

declare global {
  var __yorimichiSupabase: any;
}

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!global.__yorimichiSupabase) {
    global.__yorimichiSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
  }
  return global.__yorimichiSupabase as any;
}

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://127.0.0.1:3002"
  );
}
