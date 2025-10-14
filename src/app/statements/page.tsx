import { auth } from "@/auth";
import { StatementsPageClient } from "./statements-client";


export default async function StatementsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return <StatementsPageClient user={session.user} />;
}
