"use client";
import { WagmiProvider, createConfig, http, useAccount } from "wagmi";
import {
  arbitrum,
  base,
  linea,
  mainnet,
  optimism,
  polygon,
  scroll,
  avalanche,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { NexusProvider } from "./NexusProvider";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const config = createConfig(
  getDefaultConfig({
    chains: [
      mainnet,
      arbitrum,
      base,
      optimism,
      polygon,
      linea,
      avalanche,
      baseSepolia,
      arbitrumSepolia,
      optimismSepolia,
      polygonAmoy,
    ],
    transports: {
      [mainnet.id]: http(mainnet.rpcUrls.default.http[0]),
      [arbitrum.id]: http(arbitrum.rpcUrls.default.http[0]),
      [base.id]: http(base.rpcUrls.default.http[0]),
      [optimism.id]: http(optimism.rpcUrls.default.http[0]),
      [polygon.id]: http(polygon.rpcUrls.default.http[0]),
      [avalanche.id]: http(avalanche.rpcUrls.default.http[0]),
      [scroll.id]: http(scroll.rpcUrls.default.http[0]),
      [baseSepolia.id]: http(baseSepolia.rpcUrls.default.http[0]),
      [arbitrumSepolia.id]: http(arbitrumSepolia.rpcUrls.default.http[0]),
      [optimismSepolia.id]: http(optimismSepolia.rpcUrls.default.http[0]),
      [polygonAmoy.id]: http(polygonAmoy.rpcUrls.default.http[0]),
    },

    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

    // Required App Info
    appName: "Avail Nexus",

    // Optional App Info
    appDescription: "Avail Nexus",
    appUrl: "https://www.availproject.org/",
    appIcon:
      "https://www.availproject.org/_next/static/media/avail_logo.9c818c5a.png",
  })
);

const queryClient = new QueryClient();

const InternalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { isConnected: accountConnected } = useAccount();
  const pathname = usePathname();

  useEffect(() => {
    setIsConnected(accountConnected);
  }, [accountConnected]);

  const handleConnection = () => {
    setIsConnected(true);
  };

  const handleDisconnection = () => {
    setIsConnected(false);
  };

  // Only initialize NexusProvider on balances route
  const isBalancesRoute = pathname === "/balances";

  return (
    <ConnectKitProvider
      theme="auto"
      mode="light"
      onConnect={handleConnection}
      onDisconnect={handleDisconnection}
    >
      {isBalancesRoute ? (
        <NexusProvider isConnected={isConnected}>{children}</NexusProvider>
      ) : (
        children
      )}
    </ConnectKitProvider>
  );
};

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <InternalProvider>{children}</InternalProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
