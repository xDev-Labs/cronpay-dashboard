"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BridgeForm } from "./bridge/bridge-form";
import { BridgeProgress } from "./bridge/bridge-progress";
import { useBridgeTransaction } from "@/hooks/useBridgeTransaction";
import { useBridgeProgress } from "@/hooks/useBridgeProgress";
import { useNexus } from "@/components/providers/NexusProvider";
import { UserAsset } from "@avail-project/nexus-core";
import { toast } from "sonner";
import IntentModal from "./nexus-modals/intent-modal";
import AllowanceModal from "./nexus-modals/allowance-modal";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SwapForm } from "./bridge/swap-form";

interface ConsolidateFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: UserAsset[];
}

export const ConsolidateFundsModal: React.FC<ConsolidateFundsModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { executeBridge } = useBridgeTransaction();
  const {
    refreshBalances,
    intentModal,
    allowanceModal,
    setIntentModal,
    setAllowanceModal,
  } = useNexus();

  const {
    steps,
    currentStep,
    status,
    statusMessage,
    startTransaction,
    completeTransaction,
    reset,
    handleValidationStart,
    handleValidationComplete,
    handleAllowanceStart,
    handleAllowanceComplete,
    handleIntentStart,
    handleIntentComplete,
    handleExecutionStart,
    handleExecutionComplete,
    errorStep,
  } = useBridgeProgress();

  // Listen for SDK modal events to update progress
  useEffect(() => {
    if (allowanceModal && status === "in-progress") {
      handleAllowanceStart();
    }
  }, [allowanceModal, status, handleAllowanceStart]);

  useEffect(() => {
    if (intentModal && status === "in-progress") {
      handleIntentStart();
    }
  }, [intentModal, status, handleIntentStart]);

  const handleSubmit = async () => {
    try {
      console.log("Consolidate funds: Starting transaction...");
      setIsSubmitting(true);
      startTransaction();
      handleValidationStart();

      // Simulate validation step
      await new Promise((resolve) => setTimeout(resolve, 1000));
      handleValidationComplete();

      const result = await executeBridge();
      console.log("Consolidate funds: Transaction result:", result);

      if (result?.success) {
        completeTransaction();
        // Refresh balances to show updated amounts
        await refreshBalances();
        // Start countdown for auto-close
        setCountdown(3);
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              handleClose();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        errorStep("execute", result?.error || "Transaction failed");
      }
    } catch (error) {
      console.error("Consolidate funds: Unexpected error:", error);
      errorStep("execute", "An unexpected error occurred");
    } finally {
      console.log("Consolidate funds: Transaction completed, resetting state");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setCountdown(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Consolidate Funds</DialogTitle>
          <DialogDescription>
            Move your assets to consolidate them on a single chain. Select the
            destination chain and token to consolidate.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Show tabs when not in progress */}
          {status === "idle" && (
            <Tabs defaultValue="bridge" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bridge">Bridge</TabsTrigger>
                <TabsTrigger value="swap">Cross Chain Swap</TabsTrigger>
              </TabsList>
              <TabsContent value="bridge">
                <BridgeForm
                  isTestnet={true} // You can make this configurable if needed
                  availableBalance={availableBalance}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>
              <TabsContent value="swap">
                <SwapForm
                  isTestnet={true} // You can make this configurable if needed
                  availableBalance={availableBalance}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>
            </Tabs>
          )}

          {/* Show progress when transaction is in progress */}
          {status === "in-progress" && (
            <BridgeProgress
              steps={steps}
              currentStep={currentStep || undefined}
              className="mb-6"
            />
          )}

          {/* Show completion status */}
          {status === "completed" && (
            <div className="space-y-4">
              <BridgeProgress
                steps={steps}
                currentStep={currentStep || undefined}
                className="mb-6"
              />

              {countdown > 0 && (
                <div className="text-center text-sm text-gray-600">
                  Modal will close automatically in {countdown} second
                  {countdown !== 1 ? "s" : ""}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                {/* <button
                  onClick={reset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Start New Transaction
                </button> */}
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Show error status */}
          {status === "error" && (
            <div className="space-y-4">
              <BridgeProgress
                steps={steps}
                currentStep={currentStep || undefined}
                className="mb-6"
              />

              <div className="flex justify-end space-x-2">
                <button
                  onClick={reset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* SDK Modals */}
      {intentModal && (
        <IntentModal
          intentModal={intentModal}
          setIntentModal={setIntentModal}
          onComplete={handleIntentComplete}
        />
      )}

      {allowanceModal && (
        <AllowanceModal
          allowanceModal={allowanceModal}
          setAllowanceModal={setAllowanceModal}
          onComplete={handleAllowanceComplete}
        />
      )}
    </Dialog>
  );
};
