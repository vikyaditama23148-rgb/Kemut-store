import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client. NEVER import this in a client component.
// Used for: order creation after payment, Midtrans webhook handling,
// and admin mutations that must bypass RLS safely on the server.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
