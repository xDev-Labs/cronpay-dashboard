"use client";

import { useState, useCallback, useRef } from "react";
import { BridgeStep } from "@/components/ui/bridge/bridge-progress";

export interface BridgeProgressState {
  steps: BridgeStep[];
  currentStep: string | null;
  status: "idle" | "in-progress" | "completed" | "error";
  statusMessage: {
    type: "success" | "error" | "info" | "loading";
    title: string;
    message?: string;
  } | null;
}

const INITIAL_STEPS: BridgeStep[] = [
  {
    id: "validate",
    title: "Validating Transaction",
    description: "Checking transaction parameters and balances...",
    status: "pending",
  },
  {
    id: "allowance",
    title: "Token Allowance",
    description: "Setting up token allowances for the bridge...",
    status: "pending",
  },
  {
    id: "intent",
    title: "Transaction Intent",
    description: "Confirming bridge transaction details...",
    status: "pending",
  },
  {
    id: "execute",
    title: "Executing Bridge",
    description: "Processing the bridge transaction...",
    status: "pending",
  },
  {
    id: "complete",
    title: "Transaction Complete",
    description: "Bridge transaction completed successfully!",
    status: "pending",
  },
];

export const useBridgeProgress = () => {
  const [state, setState] = useState<BridgeProgressState>({
    steps: INITIAL_STEPS,
    currentStep: null,
    status: "idle",
    statusMessage: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateStep = useCallback(
    (stepId: string, status: BridgeStep["status"]) => {
      setState((prev) => ({
        ...prev,
        steps: prev.steps.map((step) =>
          step.id === stepId ? { ...step, status } : step
        ),
        currentStep: status === "in-progress" ? stepId : prev.currentStep,
      }));
    },
    []
  );

  const setStatusMessage = useCallback(
    (
      type: "success" | "error" | "info" | "loading",
      title: string,
      message?: string
    ) => {
      setState((prev) => ({
        ...prev,
        statusMessage: { type, title, message },
      }));

      // Auto-clear status messages after 5 seconds (except for loading)
      if (type !== "loading") {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setState((prev) => ({
            ...prev,
            statusMessage: null,
          }));
        }, 5000);
      }
    },
    []
  );

  const startTransaction = useCallback(() => {
    setState({
      steps: INITIAL_STEPS,
      currentStep: "validate",
      status: "in-progress",
      statusMessage: {
        type: "loading",
        title: "Starting Bridge Transaction",
        message: "Preparing your transaction...",
      },
    });
    updateStep("validate", "in-progress");
  }, [updateStep]);

  const completeStep = useCallback((stepId: string) => {
    setState((prev) => {
      const updatedSteps = prev.steps.map((step) =>
        step.id === stepId ? { ...step, status: "completed" as const } : step
      );

      // Move to next step if not the last one
      const currentIndex = updatedSteps.findIndex((step) => step.id === stepId);
      let nextCurrentStep = prev.currentStep;

      if (currentIndex < updatedSteps.length - 1) {
        const nextStep = updatedSteps[currentIndex + 1];
        updatedSteps[currentIndex + 1] = {
          ...nextStep,
          status: "in-progress" as const,
        };
        nextCurrentStep = nextStep.id;
      }

      return {
        ...prev,
        steps: updatedSteps,
        currentStep: nextCurrentStep,
      };
    });
  }, []);

  const errorStep = useCallback(
    (stepId: string, errorMessage: string) => {
      updateStep(stepId, "error");
      setState((prev) => ({
        ...prev,
        status: "error",
        currentStep: stepId,
      }));
      setStatusMessage("error", "Transaction Failed", errorMessage);
    },
    [updateStep, setStatusMessage]
  );

  const completeTransaction = useCallback(() => {
    setState((prev) => {
      // Mark all remaining steps as completed and set the final step as current
      const updatedSteps = prev.steps.map((step) => ({
        ...step,
        status: "completed" as const,
      }));

      return {
        ...prev,
        steps: updatedSteps,
        status: "completed",
        currentStep: "complete",
      };
    });
    setStatusMessage(
      "success",
      "Bridge Completed",
      "Your funds have been successfully bridged!"
    );
  }, [setStatusMessage]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState({
      steps: INITIAL_STEPS,
      currentStep: null,
      status: "idle",
      statusMessage: null,
    });
  }, []);

  // Specific step handlers
  const handleValidationStart = useCallback(() => {
    setStatusMessage(
      "loading",
      "Validating Transaction",
      "Checking your transaction parameters..."
    );
  }, [setStatusMessage]);

  const handleValidationComplete = useCallback(() => {
    completeStep("validate");
    setStatusMessage(
      "info",
      "Validation Complete",
      "Transaction parameters are valid"
    );
  }, [completeStep, setStatusMessage]);

  const handleAllowanceStart = useCallback(() => {
    setStatusMessage(
      "loading",
      "Setting Token Allowance",
      "Please approve the token allowance in your wallet"
    );
  }, [setStatusMessage]);

  const handleAllowanceComplete = useCallback(() => {
    completeStep("allowance");
    setStatusMessage(
      "success",
      "Allowance Approved",
      "Token allowance has been set successfully"
    );
  }, [completeStep, setStatusMessage]);

  const handleIntentStart = useCallback(() => {
    setStatusMessage(
      "loading",
      "Confirming Transaction",
      "Please review and confirm the transaction details"
    );
  }, [setStatusMessage]);

  const handleIntentComplete = useCallback(() => {
    completeStep("intent");
    setStatusMessage(
      "info",
      "Intent Confirmed",
      "Transaction details confirmed"
    );
  }, [completeStep, setStatusMessage]);

  const handleExecutionStart = useCallback(() => {
    setStatusMessage(
      "loading",
      "Executing transaction",
      "Processing your transaction..."
    );
  }, [setStatusMessage]);

  const handleExecutionComplete = useCallback(() => {
    completeStep("execute");
    setStatusMessage(
      "success",
      "Bridge Executed",
      "Your transaction is being processed"
    );
  }, [completeStep, setStatusMessage]);

  return {
    ...state,
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
  };
};
