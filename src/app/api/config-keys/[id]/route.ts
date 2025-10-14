import { auth } from "@/auth";
import { supabaseServer } from "@/lib/supabase-server";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email)
    return new Response("Unauthorized", { status: 401 });
  const { id } = await context.params;
  const body = await request.json();
  const { chain, token, receiver_address } = body ?? {};

  const supabase = supabaseServer();

  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();
  if (!userRow) return new Response("User not found", { status: 404 });

  const { error } = await supabase
    .from("config_keys")
    .update({ chain, token, receiver_address })
    .eq("id", id)
    .eq("user_id", userRow.id);
  if (error) return new Response(error.message, { status: 500 });
  return new Response(null, { status: 204 });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email)
    return new Response("Unauthorized", { status: 401 });
  const { id } = await context.params;

  const supabase = supabaseServer();

  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single();
  if (!userRow) return new Response("User not found", { status: 404 });

  const { error } = await supabase
    .from("config_keys")
    .delete()
    .eq("id", id)
    .eq("user_id", userRow.id);
  if (error) return new Response(error.message, { status: 500 });
  return new Response(null, { status: 204 });
}
