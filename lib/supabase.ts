import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase client. Server-side (API routes, server components)
// should create their own client with the service role or server cookies —
// see lib/supabase-server.ts.
export function createClient() {
  return createBrowserClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  );
}
