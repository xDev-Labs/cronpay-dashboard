import { useCallback, useEffect, useRef } from "react";
import { useBridgeStore, bridgeSelectors } from "@/store/bridgeStore";
import { useNexus } from "@/components/providers/NexusProvider";
import {
  parseBridgeError,
  formatErrorForUser,
  logBridgeError,
} from "@/lib/bridge/errorHandling";
import { toast } from "sonner";
import { SimulationResult } from "@avail-project/nexus-core";
import { useTransactionProgress } from "./useTransactionProgress";
import { useSDKTransactionHistory } from "./useSDKTransactionHistory";

interface ErrorWithCode extends Error {
  code?: number;
}

const isAllowanceRejectionError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes("User rejection during setting allowance") ||
      error.message.includes("User rejected the request")
    );
  }

  const errorWithCode = error as ErrorWithCode;
  return errorWithCode?.code === 4001;
};

export const useBridgeTransaction = () => {
  const { nexusSdk } = useNexus();
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store selectors
  const selectedChain = useBridgeStore(bridgeSelectors.selectedChain);
  const selectedToken = useBridgeStore(bridgeSelectors.selectedToken);
  const bridgeAmount = useBridgeStore(bridgeSelectors.bridgeAmount);
  const isBridging = useBridgeStore(bridgeSelectors.isBridging);
  const simulation = useBridgeStore(bridgeSelectors.simulation);
  const isSimulating = useBridgeStore(bridgeSelectors.isSimulating);

  // Store actions
  const setBridging = useBridgeStore((state) => state.setBridging);
  const setError = useBridgeStore((state) => state.setError);
  const setSimulation = useBridgeStore((state) => state.setSimulation);
  const setSimulating = useBridgeStore((state) => state.setSimulating);
  const setSimulationError = useBridgeStore(
    (state) => state.setSimulationError
  );
  const clearSimulation = useBridgeStore((state) => state.clearSimulation);

  // Hooks
  const { resetProgress } = useTransactionProgress();
  const { refetch } = useSDKTransactionHistory();

  /**
   * Execute bridge transaction with full flow
   */
  const executeBridge = useCallback(async () => {
    if (!selectedToken || !bridgeAmount || !nexusSdk) {
      const errorMsg = "Missing required parameters for bridge transaction";
      setError(errorMsg);
      toast.error(errorMsg);
      // Reset progress on parameter validation error
      resetProgress();
      return { success: false, error: errorMsg };
    }

    try {
      console.log("Executing bridge transaction");
      setBridging(true);
      setError(null);

      console.log("Starting bridge transaction:", {
        chainId: selectedChain,
        token: selectedToken,
        amount: bridgeAmount,
      });

      // The SDK will handle its own modals (allowance and intent)
      // We just need to wait for the result
      const result = await nexusSdk.bridge({
        chainId: selectedChain,
        token: selectedToken,
        amount: bridgeAmount,
      });

      console.log("Bridge transaction result:", result);

      if (result?.success) {
        toast.success("Bridge transaction completed successfully!", {
          description: `${bridgeAmount} ${selectedToken} bridged successfully`,
          duration: 5000,
        });
        return result;
      } else {
        const errorMsg = result?.error || "Transaction failed";
        setError(errorMsg);
        toast.error("Bridge transaction failed", {
          description: errorMsg,
          duration: 5000,
        });
        return { success: false, error: errorMsg };
      }
    } catch (error: unknown) {
      console.error("Bridge transaction failed:", error);

      // Parse and handle the error
      const bridgeError = parseBridgeError(error);
      const userFriendlyMessage = formatErrorForUser(error);

      // Log structured error information
      logBridgeError(error, "Bridge transaction execution");

      // Special handling for allowance rejection errors
      if (isAllowanceRejectionError(error)) {
        console.log("Allowance rejection detected in bridge transaction");

        // Set specific error message for allowance rejection
        setError("Token approval was cancelled");

        // Show specific toast for allowance rejection
        toast.error("Token approval was cancelled", {
          description:
            "Please approve the token allowance to continue with the bridge transaction",
          duration: 6000,
        });

        return { success: false, error: "Token approval was cancelled" };
      }

      // Set error state
      setError(userFriendlyMessage);

      // Show user-friendly error toast
      toast.error(userFriendlyMessage, {
        description: bridgeError.isRetryable
          ? "You can try again, or check your wallet and network connection"
          : "Please check your transaction parameters and try again",
        duration: 6000,
      });

      return { success: false, error: userFriendlyMessage };
    } finally {
      // Always reset the bridging state and refetch data
      setBridging(false);
      refetch();
    }
  }, [
    selectedToken,
    bridgeAmount,
    nexusSdk,
    selectedChain,
    setBridging,
    setError,
    resetProgress,
    refetch,
  ]);

  const simulateBridge = useCallback(async () => {
    if (!selectedToken || !bridgeAmount || !nexusSdk) {
      return null;
    }

    try {
      const simulation = await nexusSdk.simulateBridge({
        chainId: selectedChain,
        token: selectedToken,
        amount: bridgeAmount,
      });
      console.log("Simulation result:", simulation);
      return simulation;
    } catch (error) {
      console.error("Simulation failed:", error);
      return null;
    }
  }, [selectedToken, bridgeAmount, nexusSdk, selectedChain]);

  /**
   * Run simulation for current bridge parameters
   */
  const runSimulation = useCallback(async () => {
    if (
      !selectedToken ||
      !bridgeAmount ||
      !nexusSdk ||
      parseFloat(bridgeAmount) <= 0
    ) {
      clearSimulation();
      return;
    }

    try {
      setSimulating(true);
      setSimulationError(null);

      const result: SimulationResult = await nexusSdk.simulateBridge({
        chainId: selectedChain,
        token: selectedToken,
        amount: bridgeAmount,
      });

      console.log("Simulation result:", result);

      if (result?.intent) {
        const { intent } = result;

        const simulationData: SimulationResult = {
          intent,
          token: result.token,
        };

        setSimulation(simulationData);
      } else {
        clearSimulation();
      }
    } catch (error) {
      console.error(error);
      setSimulationError(
        error instanceof Error ? error.message : "Simulation failed"
      );
      clearSimulation();
    } finally {
      setSimulating(false);
    }
  }, [
    selectedToken,
    bridgeAmount,
    selectedChain,
    nexusSdk,
    setSimulating,
    setSimulationError,
    setSimulation,
    clearSimulation,
  ]);

  /**
   * Auto-run simulation when form inputs change (with debouncing)
   */
  useEffect(() => {
    // Clear existing timeout
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current);
    }

    // Set new timeout for debounced simulation
    simulationTimeoutRef.current = setTimeout(() => {
      runSimulation();
    }, 500); // 500ms debounce

    // Cleanup on unmount
    return () => {
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
      }
    };
  }, [selectedToken, bridgeAmount, selectedChain, runSimulation]);

  /**
   * Manual simulation trigger
   */
  const triggerSimulation = useCallback(() => {
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current);
    }
    runSimulation();
  }, [runSimulation]);

  return {
    isBridging,
    executeBridge,
    simulateBridge,
    simulation,
    isSimulating,
    runSimulation,
    triggerSimulation,
  };
};
