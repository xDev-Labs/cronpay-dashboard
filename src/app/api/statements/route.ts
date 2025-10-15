import { auth } from "@/auth";
import { supabaseServer } from "@/lib/supabase-server";

type TimePeriod = "today" | "7days" | "30days" | "6months" | "1year";

function getDateRange(period: TimePeriod) {
  const now = new Date();
  const start = new Date();

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "7days":
      start.setDate(now.getDate() - 7);
      break;
    case "30days":
      start.setDate(now.getDate() - 30);
      break;
    case "6months":
      start.setMonth(now.getMonth() - 6);
      break;
    case "1year":
      start.setFullYear(now.getFullYear() - 1);
      break;
  }

  return { start, end: now };
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") as TimePeriod) || "30days";

  const supabase = supabaseServer();

  // Fetch user id by email
  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();
  if (userErr || !userRow) return new Response("User not found", { status: 404 });

  const { start, end } = getDateRange(period);

  // Get user's config keys
  const { data: configKeys } = await supabase
    .from("config_keys")
    .select("id")
    .eq("user_id", userRow.id);

  if (!configKeys || configKeys.length === 0) {
    return Response.json({ transactions: [] });
  }

  // Fetch transactions for the specified period
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select(
      "id, amount, currency, token_received_amount, status, transaction_hash, created_at, config_keys(id, chain, token)"
    )
    .in("config_key_id", configKeys.map((k) => k.id))
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ transactions: transactions || [] });
}
