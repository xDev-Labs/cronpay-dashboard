"use client";

import { useAccount } from "wagmi";
import { WalletConnection } from "@/components/ui/connect-wallet";
import { useNexus } from "@/components/providers/NexusProvider";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Coins } from "lucide-react";
import { UnifiedBalances } from "@/components/ui/unified-balances";

interface BalancePageClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function BalancePageClient({ user }: BalancePageClientProps) {
  const { isConnected } = useAccount();
  const { isInitialized, isLoading } = useNexus();

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Unified Balances
            </h1>
            <p className="text-muted-foreground">
              View your assets across all connected chains
            </p>
            <p>{isConnected ? "Connected" : "Not Connected"}</p>
          </div>
        </div>

        {/* Wallet Connection Status */}
        {!isConnected ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                Connect your wallet to view your unified balances across all
                supported chains
              </p>
              <WalletConnection />
            </CardContent>
          </Card>
        ) : !isInitialized ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">
                Initializing Nexus SDK
              </h3>
              <p className="text-muted-foreground text-center">
                Setting up your multi-chain experience...
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <UnifiedBalances />
            </CardContent>
          </Card>
        )}

        {/* Loading Overlay */}
        {isConnected && isLoading && !isInitialized && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-background rounded-xl p-6 shadow-xl border">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                <span className="text-foreground">
                  Initializing Nexus SDK...
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
