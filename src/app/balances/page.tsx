import { auth } from "@/auth";
import BalancePageClient from "./balance-client";

export default async function BalancePage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return <BalancePageClient user={session.user} />;
}
