import { auth } from "@/auth";
import { KeysPageClient } from "./keys-client";

export default async function KeysPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return <KeysPageClient user={session.user} />;
}
