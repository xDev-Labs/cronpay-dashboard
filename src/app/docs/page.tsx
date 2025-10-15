import { auth } from "@/auth";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Send, CheckCircle } from "lucide-react";

export default async function DocsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={session.user} />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Learn how to integrate CronPay API to create transactions and check their status.
          </p>
        </div>

        {/* Create Transaction Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl">Create Transaction</CardTitle>
              </div>
              <p className="text-muted-foreground mt-2">
                Create a new transaction by sending a POST request with your API key, currency, and amount.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Endpoint */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">ENDPOINT</h3>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  <span className="text-green-600 dark:text-green-400 font-semibold">POST</span>{" "}
                  https://gateway.cronpay.xyz/api/create-transaction
                </div>
              </div>

              {/* Request */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">REQUEST</h3>
                <div className="bg-slate-950 dark:bg-slate-900 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm text-slate-50">
                    <code>{`curl --location 'https://gateway.cronpay.xyz/api/create-transaction' \\
--header 'Content-Type: application/json' \\
--data '{
    "apikey": "cronpay_api_key",
    "currency": "INR",
    "amount": 100
  }'`}</code>
                  </pre>
                </div>
              </div>

              {/* Request Parameters */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">PARAMETERS</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Parameter</th>
                        <th className="text-left p-3 font-semibold">Type</th>
                        <th className="text-left p-3 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3 font-mono text-xs">apikey</td>
                        <td className="p-3">string</td>
                        <td className="p-3">Your CronPay API key</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-mono text-xs">currency</td>
                        <td className="p-3">string</td>
                        <td className="p-3">Currency code (e.g., INR, USD)</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-mono text-xs">amount</td>
                        <td className="p-3">number</td>
                        <td className="p-3">Transaction amount</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Response */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">RESPONSE</h3>
                <div className="bg-slate-950 dark:bg-slate-900 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm text-slate-50">
                    <code>{`{
    "id": "16f0d91f-d790-4e5d-95b2-e46b118b29d1"
}`}</code>
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Returns a unique transaction ID that can be used to check the transaction status.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Get Transaction Status Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl">Get Transaction Status</CardTitle>
              </div>
              <p className="text-muted-foreground mt-2">
                Check the status of a transaction using the transaction ID returned from the create transaction endpoint.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Endpoint */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">ENDPOINT</h3>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  <span className="text-green-600 dark:text-green-400 font-semibold">POST</span>{" "}
                  https://gateway.cronpay.xyz/api/transaction-status
                </div>
              </div>

              {/* Request */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">REQUEST</h3>
                <div className="bg-slate-950 dark:bg-slate-900 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm text-slate-50">
                    <code>{`curl --location 'https://gateway.cronpay.xyz/api/transaction-status' \\
--header 'Content-Type: application/json' \\
--data '{
    "apikey": "cronpay_api_key",
    "transaction_id": "16f0d91f-d790-4e5d-95b2-e46b118b29d1"
  }'`}</code>
                  </pre>
                </div>
              </div>

              {/* Request Parameters */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">PARAMETERS</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Parameter</th>
                        <th className="text-left p-3 font-semibold">Type</th>
                        <th className="text-left p-3 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3 font-mono text-xs">apikey</td>
                        <td className="p-3">string</td>
                        <td className="p-3">Your CronPay API key</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-mono text-xs">transaction_id</td>
                        <td className="p-3">string</td>
                        <td className="p-3">The transaction ID from create transaction</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Response */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">RESPONSE</h3>
                <div className="bg-slate-950 dark:bg-slate-900 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm text-slate-50">
                    <code>{`{
    "id": "16f0d91f-d790-4e5d-95b2-e46b118b29d1",
    "status": "completed"
}`}</code>
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Status can be: <span className="font-semibold">completed</span>, <span className="font-semibold">pending</span>, or <span className="font-semibold">failed</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="text-primary mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Make sure to replace the API key in the examples with your actual API key from the{" "}
                  <a href="/keys" className="text-primary hover:underline">Keys</a> page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
