"use client";

import React from "react";
import { CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType = "success" | "error" | "info" | "loading";

interface BridgeStatusProps {
  type: StatusType;
  title: string;
  message?: string;
  className?: string;
  showIcon?: boolean;
}

export const BridgeStatus: React.FC<BridgeStatusProps> = ({
  type,
  title,
  message,
  className,
  showIcon = true,
}) => {
  const getStatusConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
          iconColor: "text-green-600",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          iconColor: "text-red-600",
        };
      case "loading":
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
          iconColor: "text-blue-600",
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
          iconColor: "text-gray-600",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={cn(
        "flex items-start space-x-3 p-4 rounded-lg border",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {showIcon && (
        <div className={cn("flex-shrink-0 mt-0.5", config.iconColor)}>
          {config.icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h4 className={cn("text-sm font-medium", config.textColor)}>{title}</h4>
        {message && (
          <p className={cn("text-sm mt-1", config.textColor)}>{message}</p>
        )}
      </div>
    </div>
  );
};
