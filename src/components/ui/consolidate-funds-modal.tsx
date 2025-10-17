"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BridgeForm } from "./bridge/bridge-form";
import { useBridgeTransaction } from "@/hooks/useBridgeTransaction";
import { useNexus } from "@/components/providers/NexusProvider";
import { UserAsset } from "@avail-project/nexus-core";
import { toast } from "sonner";
import IntentModal from "./nexus-modals/intent-modal";
import AllowanceModal from "./nexus-modals/allowance-modal";

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
  const { executeBridge } = useBridgeTransaction();
  const {
    refreshBalances,
    intentModal,
    allowanceModal,
    setIntentModal,
    setAllowanceModal,
  } = useNexus();

  const handleSubmit = async () => {
    try {
      console.log("Consolidate funds: Starting transaction...");
      setIsSubmitting(true);
      const result = await executeBridge();
      console.log("Consolidate funds: Transaction result:", result);

      if (result?.success) {
        toast.success("Funds consolidated successfully!", {
          description: "Your transaction has been completed",
          duration: 5000,
        });
        // Refresh balances to show updated amounts
        await refreshBalances();
        // Close the modal
        onClose();
      } else {
        toast.error("Failed to consolidate funds", {
          description: result?.error || "Please try again",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Consolidate funds: Unexpected error:", error);
      toast.error("An unexpected error occurred", {
        description: "Please try again later",
        duration: 5000,
      });
    } finally {
      console.log("Consolidate funds: Transaction completed, resetting state");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Consolidate Funds</DialogTitle>
          <DialogDescription>
            Bridge your assets to consolidate them on a single chain. Select the
            destination chain and token to bridge.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <BridgeForm
            isTestnet={true} // You can make this configurable if needed
            availableBalance={availableBalance}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>

      {/* SDK Modals */}
      {intentModal && (
        <IntentModal
          intentModal={intentModal}
          setIntentModal={setIntentModal}
        />
      )}

      {allowanceModal && (
        <AllowanceModal
          allowanceModal={allowanceModal}
          setAllowanceModal={setAllowanceModal}
        />
      )}
    </Dialog>
  );
};
