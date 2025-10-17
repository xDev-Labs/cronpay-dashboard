"use client";

import React from "react";
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BridgeStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "error";
  icon?: React.ReactNode;
}

interface BridgeProgressProps {
  steps: BridgeStep[];
  currentStep?: string;
  className?: string;
}

export const BridgeProgress: React.FC<BridgeProgressProps> = ({
  steps,
  currentStep,
  className,
}) => {
  const getStepIcon = (step: BridgeStep) => {
    if (step.icon) return step.icon;

    switch (step.status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "in-progress":
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStepStatusColor = (step: BridgeStep) => {
    switch (step.status) {
      case "completed":
        return "border-green-200 bg-green-50";
      case "in-progress":
        return "border-blue-200 bg-blue-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getStepTextColor = (step: BridgeStep) => {
    switch (step.status) {
      case "completed":
        return "text-green-800";
      case "in-progress":
        return "text-blue-800";
      case "error":
        return "text-red-800";
      default:
        return "text-gray-600";
    }
  };

  // Find the current step or the last completed step
  const activeStep = currentStep
    ? steps.find((step) => step.id === currentStep)
    : steps.find((step) => step.status === "in-progress") || steps[0];

  const completedSteps = steps.filter(
    (step) => step.status === "completed"
  ).length;
  const totalSteps = steps.length;

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="text-center mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Transaction Progress
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          {activeStep?.status === "completed"
            ? "Transaction completed successfully!"
            : "Processing your transaction..."}
        </p>
      </div>

      {/* Show only the current/active step */}
      {activeStep && (
        <div
          className={cn(
            "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-300",
            getStepStatusColor(activeStep)
          )}
        >
          <div className="flex-shrink-0">{getStepIcon(activeStep)}</div>

          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "text-sm font-medium",
                getStepTextColor(activeStep)
              )}
            >
              {activeStep.title}
            </h4>
            <p className={cn("text-xs mt-1", getStepTextColor(activeStep))}>
              {activeStep.description}
            </p>
          </div>
        </div>
      )}

      {/* Simplified Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>
            {completedSteps} / {totalSteps} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(completedSteps / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
