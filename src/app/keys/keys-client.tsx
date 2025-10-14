"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { KeyDialog } from "@/components/key-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CHAIN_OPTIONS, ConfigKey } from "@/types";
import {
  generateApiKey,
  maskApiKey,
  maskAddress,
} from "@/lib/generate-api-key";
import { Edit, Trash2, Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface KeysPageClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function KeysPageClient({ user }: KeysPageClientProps) {
  const [keys, setKeys] = useState<ConfigKey[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ConfigKey | undefined>();
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const chainNameToId = useMemo(() => {
    const map = new Map<string, number>();
    CHAIN_OPTIONS.forEach((option) => map.set(option.name, option.id));
    return map;
  }, []);

  const chainIdToName = (id: number) => {
    const option = CHAIN_OPTIONS.find((opt) => opt.id === id);
    return option?.name ?? String(id);
  };

  useEffect(() => {
    const loadKeys = async () => {
      try {
        const res = await fetch("/api/config-keys", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        const loaded: ConfigKey[] = (json.keys || []).map((k: any) => ({
          id: k.id,
          chain: chainIdToName(k.chain),
          token: k.token,
          address: k.receiver_address,
          apiKey: k.id,
          createdAt: new Date(k.created_at),
        }));
        setKeys(loaded);
      } catch (e) {
        // fallback to empty on error; toast can be added if needed
        setKeys([]);
      }
    };
    loadKeys();
  }, []); // load once on mount

  const handleCreateKey = async (newKey: Omit<ConfigKey, "createdAt">) => {
    const payload = {
      id: newKey.id,
      chain: chainNameToId.get(newKey.chain) ?? 0,
      token: newKey.token,
      receiver_address: newKey.address,
    };
    try {
      const res = await fetch("/api/config-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const key: ConfigKey = {
        id: newKey.id,
        chain: newKey.chain,
        token: newKey.token,
        address: newKey.address,
        apiKey: newKey.id,
        createdAt: new Date(),
      };
      setKeys((prev) => [key, ...prev]);
      toast.success("Config key created");
    } catch (err: any) {
      toast.error("Failed to create key");
    }
  };

  const handleEditKey = async (updatedKey: Omit<ConfigKey, "createdAt">) => {
    if (!editingKey) return;
    const payload = {
      chain: chainNameToId.get(updatedKey.chain) ?? 0,
      token: updatedKey.token,
      receiver_address: updatedKey.address,
    };
    try {
      const res = await fetch(`/api/config-keys/${editingKey.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setKeys((prev) =>
        prev.map((key) =>
          key.id === editingKey.id ? { ...key, ...updatedKey } : key
        )
      );
      toast.success("Config key updated");
    } catch (err: any) {
      toast.error("Failed to update key");
    } finally {
      setEditingKey(undefined);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this config key?")) return;
    try {
      const res = await fetch(`/api/config-keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setKeys((prev) => prev.filter((key) => key.id !== id));
      toast.success("Config key deleted");
    } catch (err: any) {
      toast.error("Failed to delete key");
    }
  };

  const openCreateDialog = () => {
    setEditingKey(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (key: ConfigKey) => {
    setEditingKey(key);
    setDialogOpen(true);
  };

  const handleCopyApiKey = async (apiKey: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKeyId(keyId);
      toast.success("API key copied to clipboard!");

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedKeyId(null);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy API key");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Config Keys</h1>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Key
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chain</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Receiver Address</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No config keys yet. Create one to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.chain}</TableCell>
                      <TableCell>{key.token}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {maskAddress(key.address)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono">
                            {maskApiKey(key.apiKey)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopyApiKey(key.apiKey, key.id)}
                          >
                            {copiedKeyId === key.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {key.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(key)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteKey(key.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <KeyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={editingKey ? handleEditKey : handleCreateKey}
        editKey={editingKey}
      />
    </div>
  );
}
