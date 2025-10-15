import { auth } from "@/auth";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email)
    return new Response("Unauthorized", { status: 401 });

  const supabase = supabaseServer();

  // Fetch user id by email
  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();
  if (userErr || !userRow)
    return new Response("User not found", { status: 404 });
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select(
      "id, amount, currency, token_received_amount, status, transaction_hash, created_at, config_keys(id, chain, token)"
    )
    .in(
      "config_key_id",
      (
        await supabase
          .from("config_keys")
          .select("id")
          .eq("user_id", userRow.id)
      ).data?.map((k) => k.id) || []
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return new Response(error.message, { status: 500 });

  // Compute simple revenue stats in USD-equivalent by currency column
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTotal =
    transactions
      ?.filter(
        (t) => new Date(t.created_at) >= today && t.status === "completed"
      )
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthTotal =
    transactions
      ?.filter(
        (t) => new Date(t.created_at) >= monthStart && t.status === "completed"
      )
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  // Get count of user's config keys
  const { count: keysCount } = await supabase
    .from("config_keys")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userRow.id);

  return Response.json({
    transactions,
    revenue: {
      today: todayTotal,
      monthly: monthTotal,
      currency: transactions[0].currency,
    },
    stats: {
      totalKeys: keysCount || 0,
    },
  });
}
