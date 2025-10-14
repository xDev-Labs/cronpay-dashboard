import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as
    | string
    | undefined;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase URL or service role key is missing from environment variables"
    );
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
