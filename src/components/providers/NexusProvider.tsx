"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { useAccount } from "wagmi";
import { usePathname } from "next/navigation";

// Global window extension for wallet provider
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface NexusContextType {
  sdk: any;
  isInitialized: boolean;
  balances: any[];
  isLoading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

interface NexusProviderProps {
  children: ReactNode;
}

export function NexusProvider({ children }: NexusProviderProps) {
  const { isConnected, address } = useAccount();
  const pathname = usePathname();
  const [sdk, setSdk] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [balances, setBalances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track initialization to prevent double-initialization
  const initializingRef = useRef(false);
  const lastAddressRef = useRef<string | undefined>(undefined);

  // Check if we're on a route that needs Nexus SDK
  const shouldEnableNexus =
    pathname?.includes("/balance") || pathname?.includes("/unified-balances");

  // Initialize SDK when wallet connects or address changes, but ONLY on specific routes
  useEffect(() => {
    const shouldInitialize =
      shouldEnableNexus && // Only initialize on balances route
      address &&
      window.ethereum &&
      !isInitialized &&
      !initializingRef.current &&
      lastAddressRef.current !== address;

    if (shouldInitialize) {
      console.log("Starting SDK initialization for address:", address);
      lastAddressRef.current = address;
      initializeSDK();
    }
  }, [address, isInitialized, shouldEnableNexus]); // Remove isConnected dependency

  const initializeSDK = async () => {
    // Prevent concurrent initializations
    if (initializingRef.current) {
      console.log("SDK initialization already in progress");
      return;
    }

    initializingRef.current = true;

    try {
      setIsLoading(true);
      setError(null);

      console.log("Initializing Nexus SDK...");

      // Dynamic import to ensure client-side only loading
      const { NexusSDK } = await import("@avail-project/nexus");
      const nexusSDK = new NexusSDK({ network: "testnet" });

      // Initialize with the wallet provider
      await nexusSDK.initialize(window.ethereum);

      // Set up allowance hook for token approvals
      nexusSDK.setOnAllowanceHook(
        async ({
          allow,
          sources,
        }: {
          allow: (allowances: string[]) => void;
          sources: any[];
        }) => {
          console.log("Allowance required for sources:", sources);

          // For Part 1, we'll auto-approve with minimum allowances
          const allowances = sources.map(() => "min");
          allow(allowances);
        }
      );

      // Set up intent hook for transaction previews
      nexusSDK.setOnIntentHook(
        ({ intent, allow }: { intent: any; allow: () => void }) => {
          console.log("Transaction intent:", intent);

          // For Part 1, we'll auto-approve
          allow();
        }
      );

      setSdk(nexusSDK);
      setIsInitialized(true);

      console.log("Nexus SDK initialized successfully");

      // Fetch initial balances
      await fetchBalances(nexusSDK);
    } catch (error) {
      console.error("Failed to initialize Nexus SDK:", error);
      setError(
        error instanceof Error ? error.message : "Failed to initialize SDK"
      );
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
      initializingRef.current = false;
    }
  };

  const fetchBalances = async (sdkInstance = sdk) => {
    if (!sdkInstance) {
      console.log("Cannot fetch balances: SDK not available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching unified balances...");
      const unifiedBalances = await sdkInstance.getUnifiedBalances();
      setBalances(unifiedBalances);
      console.log("Unified balances fetched:", unifiedBalances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch balances"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalances = async () => {
    console.log("Refreshing balances...");
    await fetchBalances();
  };

  // Reset state when wallet disconnects (no address means disconnected)
  useEffect(() => {
    if (!address) {
      console.log("Wallet disconnected (no address), resetting state");
      setSdk(null);
      setIsInitialized(false);
      setBalances([]);
      setError(null);
      initializingRef.current = false;
      lastAddressRef.current = undefined;
    }
  }, [address]); // Use address instead of isConnected

  return (
    <NexusContext.Provider
      value={{
        sdk,
        isInitialized,
        balances,
        isLoading,
        error,
        refreshBalances,
      }}
    >
      {children}
    </NexusContext.Provider>
  );
}

export function useNexus() {
  const context = useContext(NexusContext);
  if (context === undefined) {
    throw new Error("useNexus must be used within a NexusProvider");
  }
  return context;
}
