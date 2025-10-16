"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/types";
import { Copy, Check } from "lucide-react";
import { maskTxHash } from "@/lib/generate-api-key";
import { toast } from "sonner";

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleCopyTxHash = async (txHash: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(txHash);
      setCopiedKeyId(keyId);
      toast.success("Transaction ID copied to clipboard!");

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedKeyId(null);
      }, 2000);
    } catch (_err) {
      toast.error("Failed to copy transaction ID");
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Token</TableHead>
          <TableHead>Chain</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Transaction ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions && transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {(transaction.created_at
                  ? new Date(transaction.created_at)
                  : new Date()
                ).toLocaleDateString("en-US")}{" "}
                {(transaction.created_at
                  ? new Date(transaction.created_at)
                  : new Date()
                ).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell className="font-medium">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: transaction.currency,
                }).format(Number(transaction.amount))}
              </TableCell>
              <TableCell>{transaction.config_keys?.token}</TableCell>
              <TableCell>{transaction.config_keys?.chain}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    transaction.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : transaction.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {transaction.status}
                </span>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {transaction.intent_id ? (
                  <a
                    href={`https://explorer.nexus-folly.availproject.org/intent/${transaction.intent_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    {maskTxHash(transaction.intent_id?.toString() || "-")}
                  </a>
                ) : (
                  maskTxHash(transaction.intent_id?.toString() || "-")
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-2"
                  onClick={() =>
                    handleCopyTxHash(
                      transaction.intent_id?.toString() || "",
                      transaction.id
                    )
                  }
                >
                  {copiedKeyId === transaction.id ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center text-muted-foreground py-8"
            >
              No transactions yet. Your latest payments will appear here once
              you start receiving them.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
