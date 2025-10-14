import { auth } from "@/auth";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/types";
import { DollarSign, TrendingUp, Key } from "lucide-react";
import { GET as getDashboard } from "@/app/api/dashboard/route";

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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Keys</CardTitle>
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
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Recent Transactions
          </h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Chain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiData?.transactions && apiData.transactions.length > 0 ? (
                    apiData.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {(transaction.created_at
                            ? new Date(transaction.created_at)
                            : new Date()
                          ).toLocaleDateString()}{" "}
                          {(transaction.created_at
                            ? new Date(transaction.created_at)
                            : new Date()
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.amount}
                        </TableCell>
                        <TableCell>{transaction.config_keys?.token}</TableCell>
                        <TableCell>{transaction.config_keys?.chain}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {transaction.transaction_hash}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No transactions yet. Your latest payments will appear
                        here once you start receiving them.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
