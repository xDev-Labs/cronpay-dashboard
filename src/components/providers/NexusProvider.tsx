"use client";

import {
  EthereumProvider,
  NexusSDK,
  OnAllowanceHookData,
  OnIntentHookData,
  UserAsset,
} from "@avail-project/nexus-core";
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
  useCallback,
  SetStateAction,
  Dispatch,
} from "react";
import { useAccount } from "wagmi";

interface NexusContextType {
  nexusSdk: NexusSDK | undefined;
  isInitialized: boolean;
  allowanceModal: OnAllowanceHookData | null;
  setAllowanceModal: Dispatch<SetStateAction<OnAllowanceHookData | null>>;
  intentModal: OnIntentHookData | null;
  setIntentModal: Dispatch<SetStateAction<OnIntentHookData | null>>;
  cleanupSDK: () => void;
  // Balance-related state and methods
  balances: UserAsset[];
  isLoading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

interface NexusProviderProps {
  children: ReactNode;
  isConnected: boolean;
}

export const NexusProvider: React.FC<NexusProviderProps> = ({
  children,
  isConnected,
}) => {
  const [nexusSdk, setNexusSdk] = useState<NexusSDK | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [allowanceModal, setAllowanceModal] =
    useState<OnAllowanceHookData | null>(null);
  const [intentModal, setIntentModal] = useState<OnIntentHookData | null>(null);
  // Balance-related state
  const [balances, setBalances] = useState<UserAsset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { connector } = useAccount();

  const initializeSDK = useCallback(async () => {
    if (isConnected && !nexusSdk && connector) {
      try {
        // Get the EIP-1193 provider from the connector
        // For ConnectKit/wagmi, we need to get the provider from the connector
        const provider = (await connector.getProvider()) as EthereumProvider;

        if (!provider) {
          throw new Error("No EIP-1193 provider available");
        }

        const sdk = new NexusSDK({
          network: "testnet",
          debug: true,
        });

        await sdk.initialize(provider);
        setNexusSdk(sdk);

        console.log("Supported chains", sdk.utils.getSupportedChains());
        setIsInitialized(true);

        sdk.setOnAllowanceHook(async (data: OnAllowanceHookData) => {
          // This is a hook for the dev to show user the allowances that need to be setup for the current tx to happen
          // where,
          // sources: an array of objects with minAllowance, chainID, token symbol, etc.
          // allow(allowances): continues the transaction flow with the specified allowances; `allowances` is an array with the chosen allowance for each of the requirements (allowances.length === sources.length), either 'min', 'max', a bigint or a string
          // deny(): stops the flow
          setAllowanceModal(data);
        });

        sdk.setOnIntentHook((data: OnIntentHookData) => {
          // This is a hook for the dev to show user the intent, the sources and associated fees
          // where,
          // intent: Intent data containing sources and fees for display purpose
          // allow(): accept the current intent and continue the flow
          // deny(): deny the intent and stop the flow
          // refresh(): should be on a timer of 5s to refresh the intent (old intents might fail due to fee changes if not refreshed)
          setIntentModal(data);
        });
      } catch (error) {
        console.error("Failed to initialize NexusSDK:", error);
        setIsInitialized(false);
      }
    }
  }, [isConnected, nexusSdk, connector]);

  const refreshBalances = useCallback(async () => {
    if (!nexusSdk || !isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);
      const unifiedBalance = await nexusSdk.getUnifiedBalances();
      console.log("unifiedBalance", unifiedBalance);
      setBalances(unifiedBalance);
    } catch (error: unknown) {
      console.error("Unable to fetch balance", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch balance"
      );
    } finally {
      setIsLoading(false);
    }
  }, [nexusSdk, isInitialized]);

  const cleanupSDK = useCallback(() => {
    if (nexusSdk) {
      nexusSdk.deinit();
      setNexusSdk(undefined);
      setIsInitialized(false);
      setBalances([]);
      setError(null);
    }
  }, [nexusSdk]);

  useEffect(() => {
    if (!isConnected) {
      cleanupSDK();
    } else {
      initializeSDK();
    }

    return () => {
      cleanupSDK();
    };
  }, [isConnected, cleanupSDK, initializeSDK]);

  // Auto-fetch balances when SDK is initialized
  useEffect(() => {
    if (isInitialized && nexusSdk) {
      refreshBalances();
    }
  }, [isInitialized, nexusSdk, refreshBalances]);

  const contextValue: NexusContextType = useMemo(
    () => ({
      nexusSdk,
      isInitialized,
      allowanceModal,
      setAllowanceModal,
      intentModal,
      setIntentModal,
      cleanupSDK,
      balances,
      isLoading,
      error,
      refreshBalances,
    }),
    [
      nexusSdk,
      isInitialized,
      allowanceModal,
      intentModal,
      cleanupSDK,
      balances,
      isLoading,
      error,
      refreshBalances,
    ]
  );

  return (
    <NexusContext.Provider value={contextValue}>
      {children}
    </NexusContext.Provider>
  );
};

export const useNexus = () => {
  const context = useContext(NexusContext);
  if (context === undefined) {
    throw new Error("useNexus must be used within a NexusProvider");
  }
  return context;
};
