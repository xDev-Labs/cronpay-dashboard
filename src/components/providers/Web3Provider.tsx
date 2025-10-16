"use client";
import { WagmiProvider, createConfig, http } from "wagmi";
import {
  mainnet,
  base,
  arbitrum,
  optimism,
  polygon,
  sepolia,
  baseSepolia,
  arbitrumSepolia,
  optimismSepolia,
  polygonAmoy,
} from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const config = createConfig(
  getDefaultConfig({
    chains: [
      mainnet,
      base,
      polygon,
      arbitrum,
      optimism,
      sepolia,
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
      [sepolia.id]: http(sepolia.rpcUrls.default.http[0]),
      [baseSepolia.id]: http(baseSepolia.rpcUrls.default.http[0]),
      [arbitrumSepolia.id]: http(arbitrumSepolia.rpcUrls.default.http[0]),
      [optimismSepolia.id]: http(optimismSepolia.rpcUrls.default.http[0]),
      [polygonAmoy.id]: http(polygonAmoy.rpcUrls.default.http[0]),
    },

    walletConnectProjectId: walletConnectProjectId!,

    // Required App Info
    appName: "CronPay Gateway",

    // Optional App Info
    appDescription: "Crypto Payment Gateway",
    appUrl: "https://cronpay.com",
    appIcon: "https://cronpay.com/icon.png",
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="soft" mode="light">
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Web3Provider;
