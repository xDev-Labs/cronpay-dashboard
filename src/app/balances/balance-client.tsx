"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { WalletConnection } from "@/components/ui/connect-wallet";
import { useNexus } from "@/components/providers/NexusProvider";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { UnifiedBalances } from "@/components/ui/unified-balances";

interface BalancePageClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function BalancePageClient({ user }: BalancePageClientProps) {
  const { isConnected, address, isReconnecting } = useAccount();
  const { isInitialized, isLoading, refreshBalances } = useNexus();

  // Consider wallet connected if we have an address, regardless of isConnected flag
  const hasWallet = Boolean(address) || isConnected;

  // Trigger refresh when everything is ready
//   useEffect(() => {
//     if (hasWallet && isInitialized && address) {
//       const timer = setTimeout(() => {
//         refreshBalances();
//       }, 500);
//       return () => clearTimeout(timer);
//     }
//   }, [hasWallet, isInitialized, address, refreshBalances]);

  // Determine UI states based on wallet presence
  const shouldShowConnectPrompt = !hasWallet && !isReconnecting;
  const shouldShowLoading = (hasWallet && !isInitialized) || isReconnecting;
  const shouldShowBalances = hasWallet && isInitialized;

  // Debug logging
  useEffect(() => {
    console.log("UI State:", {
      isConnected,
      hasWallet,
      address: address?.slice(0, 10),
      isReconnecting,
      isInitialized,
      isLoading,
      shouldShowConnectPrompt,
      shouldShowLoading,
      shouldShowBalances,
    });
  }, [
    isConnected,
    hasWallet,
    address,
    isReconnecting,
    isInitialized,
    isLoading,
  ]);

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
            {/* Debug info - remove in production */}
            {/* <p className="text-xs text-gray-400 mt-1">
              Status:{" "}
              {hasWallet
                ? `Connected (${address?.slice(0, 6)}...${address?.slice(-4)})`
                : "Not Connected"}{" "}
              | SDK: {isInitialized ? "Ready" : "Initializing"}
            </p> */}
          </div>
        </div>

        {shouldShowConnectPrompt && (
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
        )}

        {shouldShowLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">
                {isReconnecting
                  ? "Reconnecting Wallet..."
                  : "Initializing Nexus SDK"}
              </h3>
              <p className="text-muted-foreground text-center">
                {isReconnecting
                  ? "Restoring your wallet connection..."
                  : "Setting up your multi-chain experience..."}
              </p>
            </CardContent>
          </Card>
        )}

        {shouldShowBalances && (
          <Card>
            <CardContent className="p-6">
              <UnifiedBalances />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
