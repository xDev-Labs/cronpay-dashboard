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

  const { data, error } = await supabase
    .from("config_keys")
    .select("id, chain, token, receiver_address, created_at")
    .eq("user_id", userRow.id)
    .order("created_at", { ascending: false });

  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ keys: data });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email)
    return new Response("Unauthorized", { status: 401 });

  const body = await request.json();
  const { chain, token, receiver_address, id } = body ?? {};
  if (!chain || !token || !receiver_address || !id) {
    return new Response("Missing fields", { status: 400 });
  }

  const supabase = supabaseServer();

  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();
  if (userErr || !userRow)
    return new Response("User not found", { status: 404 });

  const { error } = await supabase.from("config_keys").insert({
    id,
    user_id: userRow.id,
    chain,
    token,
    receiver_address,
  });
  if (error) return new Response(error.message, { status: 500 });
  return new Response(null, { status: 201 });
}
