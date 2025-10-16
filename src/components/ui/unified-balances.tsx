"use client";

import {
  RefreshCw,
  Coins,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useNexus } from "../providers/NexusProvider";
import { ConnectKitButton } from "connectkit";
import { CHAIN_METADATA, UserAsset } from "@avail-project/nexus-core";
import { usePathname } from "next/navigation";

export function UnifiedBalances() {
  const pathname = usePathname();

  // Only render on balances route
  if (pathname !== "/balances") {
    return null;
  }

  const {
    balances,
    isLoading,
    nexusSdk,
    isInitialized,
    error,
    refreshBalances,
  } = useNexus();

  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance);
    return num.toFixed(Math.min(6, decimals));
  };

  if (!isInitialized) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center space-x-2 text-slate-500">
          <Coins className="w-5 h-5" />
          <span>Connect your wallet to view unified balances</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center space-x-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>Error: {error}</span>
        </div>
        <button
          onClick={refreshBalances}
          className="mt-4 text-blue-600 hover:text-blue-700 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          {/* <h2 className="text-2xl font-bold text-slate-900">
            Unified Balances
          </h2> */}
          {/* <p className="text-slate-600">
            Your assets across all connected chains
          </p> */}
          <ConnectKitButton />
        </div>
        <button
          onClick={refreshBalances}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Loading..." : "Refresh"}</span>
        </button>
      </div>
      {balances && balances.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-slate-900 mb-3">Account Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-500">Total Assets</p>
              <p className="text-lg font-semibold text-slate-900">
                {
                  balances.filter((token) => parseFloat(token.balance) > 0)
                    .length
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Chains</p>
              <p className="text-lg font-semibold text-slate-900">
                {
                  new Set(
                    balances.flatMap(
                      (b) => b.breakdown?.map((chain) => chain.chain.id) || []
                    )
                  ).size
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Value</p>
              <p className="text-lg font-semibold text-slate-900">
                $
                {balances
                  .reduce((acc, token) => acc + token.balanceInFiat, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="text-sm text-green-600 font-medium">Active</p>
            </div>
          </div>
        </div>
      )}
      {/* Balance Cards */}
      {!balances ||
      balances.length === 0 ||
      balances.filter((token) => parseFloat(token.balance) > 0).length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2 text-slate-500">
            <TrendingUp className="w-5 h-5" />
            <span>No balances found across connected chains</span>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Make sure you have assets on supported networks
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {balances
            ?.filter((token) => parseFloat(token.balance) > 0)
            .map((balance, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {balance.icon && (
                      <img
                        src={balance.icon}
                        alt={balance.symbol}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <h3 className="font-semibold text-lg text-slate-900">
                      {balance.symbol}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-mono font-bold text-slate-900">
                      {formatBalance(balance.balance, balance.decimals)}
                    </p>
                    {balance.balanceInFiat > 0 && (
                      <p className="text-sm text-slate-500">
                        ${balance.balanceInFiat.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                {/* Per-chain breakdown */}
                {balance.breakdown && balance.breakdown.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {balance.breakdown
                      .filter((chain) => parseFloat(chain.balance) > 0)
                      .map((item, idx: number) => (
                        <div
                          key={idx}
                          className={`text-sm flex justify-between ${
                            item.balance === "0"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            {item.chain.name}
                          </span>
                          <span className="font-mono">
                            {formatBalance(item.balance, item.decimals)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
