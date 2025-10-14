"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CHAIN_OPTIONS, TOKEN_OPTIONS, ConfigKey } from "@/types";
import { generateApiKey } from "@/lib/generate-api-key";

interface KeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (key: Omit<ConfigKey, "createdAt">) => void;
  editKey?: ConfigKey;
}

export function KeyDialog({
  open,
  onOpenChange,
  onSave,
  editKey,
}: KeyDialogProps) {
  const [chain, setChain] = useState("");
  const [token, setToken] = useState("");
  const [address, setAddress] = useState("");

  // Reset form when dialog opens/closes or when editKey changes
  useEffect(() => {
    if (open) {
      if (editKey) {
        setChain(editKey.chain);
        setToken(editKey.token);
        setAddress(editKey.address);
      } else {
        setChain("");
        setToken("");
        setAddress("");
      }
    }
  }, [open, editKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!chain || !token || !address) {
      return;
    }

    // Generate ID for new keys, use existing for edits
    const keyId = editKey?.id || generateApiKey();

    onSave({
      id: keyId,
      chain,
      token,
      address,
      apiKey: keyId,
    });

    // Reset form
    setChain("");
    setToken("");
    setAddress("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editKey ? "Edit Config Key" : "Create New Config Key"}
            </DialogTitle>
            <DialogDescription>
              {editKey
                ? "Update the configuration key details below."
                : "Add a new configuration key to receive payments."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="chain">Chain</Label>
              <Select value={chain} onValueChange={setChain}>
                <SelectTrigger id="chain">
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  {CHAIN_OPTIONS.map((option) => (
                    <SelectItem key={option.name} value={option.name}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="token">Token</Label>
              <Select value={token} onValueChange={setToken}>
                <SelectTrigger id="token">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {TOKEN_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Receiver Address</Label>
              <Input
                id="address"
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!chain || !token || !address}>
              {editKey ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
