"use client";

import { useState } from "react";
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
import { mockConfigKeys, ConfigKey } from "@/lib/mock-data";
import { generateApiKey, maskApiKey, maskAddress } from "@/lib/generate-api-key";
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
  const [keys, setKeys] = useState<ConfigKey[]>(mockConfigKeys);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ConfigKey | undefined>();
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const handleCreateKey = (newKey: Omit<ConfigKey, "id" | "createdAt">) => {
    const key: ConfigKey = {
      ...newKey,
      apiKey: generateApiKey(), // Generate API key for new keys
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setKeys([...keys, key]);
  };

  const handleEditKey = (updatedKey: Omit<ConfigKey, "id" | "createdAt">) => {
    if (!editingKey) return;

    setKeys(
      keys.map((key) =>
        key.id === editingKey.id
          ? { ...key, ...updatedKey }
          : key
      )
    );
    setEditingKey(undefined);
  };

  const handleDeleteKey = (id: string) => {
    if (confirm("Are you sure you want to delete this config key?")) {
      setKeys(keys.filter((key) => key.id !== id));
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
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
