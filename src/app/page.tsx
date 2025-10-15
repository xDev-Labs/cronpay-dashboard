import { auth } from "@/auth";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types";
import { DollarSign, TrendingUp, Key, Link } from "lucide-react";
import { GET as getDashboard } from "@/app/api/dashboard/route";
import { TransactionsTable } from "@/components/ui/transaction-table";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Load transactions and revenue from API
  let apiData: {
    transactions: Transaction[];
    revenue: { today: number; monthly: number; currency: string };
    stats: { totalKeys: number };
  } | null = null;
  try {
    console.log("Fetching dashboard data..");
    const res = await getDashboard();
    // console.log(res);
    if (res.ok) {
      // console.log(res.json());
      apiData = await res.json();
    }
  } catch (err) {
    console.log(err);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section - Revenue Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today&apos;s Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {apiData
                    ? new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: apiData.revenue.currency,
                      }).format(apiData.revenue.today)
                    : "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue generated today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {apiData
                    ? new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: apiData.revenue.currency,
                      }).format(apiData.revenue.monthly)
                    : "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total revenue this month
                </p>
              </CardContent>
            </Card>
            <a href="/keys">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    API Keys
                  </CardTitle>
                  <Key className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {apiData?.stats?.totalKeys || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total config keys created
                  </p>
                </CardContent>
              </Card>
            </a>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Recent Transactions
          </h2>
          <Card>
            <CardContent className="p-0">
              <TransactionsTable transactions={apiData?.transactions || []} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
