"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NexusSDK, SUPPORTED_CHAINS_IDS, UserAsset } from "@avail-project/nexus-core";
import { ExactOutSwapInput, SwapIntentHook } from "@avail-project/nexus-core";
import { useNexus } from "@/components/providers/NexusProvider";
import { toast } from "sonner";
import Image from "next/image";

interface SwapToken {
  contractAddress: string;
  decimals: number;
  logo: string;
  name: string;
  symbol: string;
}

interface SwapChain {
  id: number;
  logo: string;
  name: string;
  tokens: SwapToken[];
}

interface SwapFormProps {
  isTestnet: boolean;
  availableBalance: UserAsset[];
  onSubmit: () => void;
  isSubmitting: boolean;
}

const supportedChainsAndTokens: SwapChain[] = [
  {
    "id": 10,
    "logo": "https://assets.coingecko.com/coins/images/25244/large/Optimism.png?1696524385",
    "name": "OP Mainnet",
    "tokens": [
      {
        "contractAddress": "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
        "decimals": 6,
        "logo": "",
        "name": "USDC",
        "symbol": "USDC"
      },
      {
        "contractAddress": "0x01bff41798a0bcf287b996046ca68b395dbc1071",
        "decimals": 6,
        "logo": "",
        "name": "USDT",
        "symbol": "USDT"
      },
      {
        "contractAddress": "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
        "decimals": 18,
        "logo": "",
        "name": "DAI",
        "symbol": "DAI"
      }
    ]
  },
  {
    "id": 137,
    "logo": "https://assets.coingecko.com/asset_platforms/images/15/large/polygon_pos.png?1706606645",
    "name": "Polygon PoS",
    "tokens": [
      {
        "contractAddress": "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
        "decimals": 6,
        "logo": "",
        "name": "USDC",
        "symbol": "USDC"
      },
      {
        "contractAddress": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
        "decimals": 6,
        "logo": "",
        "name": "USDT",
        "symbol": "USDT"
      }
    ]
  },
  {
    "id": 42161,
    "logo": "https://assets.coingecko.com/coins/images/16547/large/arb.jpg?1721358242",
    "name": "Arbitrum One",
    "tokens": [
      {
        "contractAddress": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        "decimals": 18,
        "logo": "",
        "name": "WETH",
        "symbol": "WETH"
      },
      {
        "contractAddress": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
        "decimals": 6,
        "logo": "",
        "name": "USDC",
        "symbol": "USDC"
      },
      {
        "contractAddress": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
        "decimals": 6,
        "logo": "",
        "name": "USDT",
        "symbol": "USDT"
      },
      {
        "contractAddress": "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
        "decimals": 6,
        "logo": "",
        "name": "DAI",
        "symbol": "DAI"
      }
    ]
  },
  {
    "id": 534352,
    "logo": "https://assets.coingecko.com/asset_platforms/images/153/large/scroll.jpeg?1706606782",
    "name": "Scroll",
    "tokens": [
      {
        "contractAddress": "0x5300000000000000000000000000000000000004",
        "decimals": 18,
        "logo": "",
        "name": "WETH",
        "symbol": "WETH"
      },
      {
        "contractAddress": "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4",
        "decimals": 6,
        "logo": "",
        "name": "USDC",
        "symbol": "USDC"
      },
      {
        "contractAddress": "0xf55bec9cafdbe8730f096aa55dad6d22d44099df",
        "decimals": 6,
        "logo": "",
        "name": "USDT",
        "symbol": "USDT"
      },
      {
        "contractAddress": "0xca77eb3fefe3725dc33bccb54edefc3d9f764f97",
        "decimals": 6,
        "logo": "",
        "name": "DAI",
        "symbol": "DAI"
      }
    ]
  },
  {
    "id": 8453,
    "logo": "https://assets.coingecko.com/asset_platforms/images/131/large/base-network.png?1720533039",
    "name": "Base",
    "tokens": [
      {
        "contractAddress": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        "decimals": 6,
        "logo": "",
        "name": "USDC",
        "symbol": "USDC"
      },
      {
        "contractAddress": "0x820c137fa70c8691f0e44dc420a5e53c168921dc",
        "decimals": 18,
        "logo": "",
        "name": "USDS",
        "symbol": "USDS"
      }
    ]
  }
];

export const SwapForm: React.FC<SwapFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [selectedChainId, setSelectedChainId] = useState<number>(137);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string>("");
  const [selectedChain, setSelectedChain] = useState<SwapChain | null>(null);
  const [amount, setAmount] = useState("");
  const nexusSDK = new NexusSDK({
    network: "mainnet",
    debug: true,
  });

  // Initialize default selection
  useEffect(() => {
    // Set default chain (Polygon)
    const defaultChain = supportedChainsAndTokens.find(chain => chain.id === 137);
    if (defaultChain) {
      setSelectedChain(defaultChain);
      // Set default token (USDT on Polygon)
      const usdt = defaultChain.tokens.find(token => token.symbol === "USDT");
      if (usdt) {
        setSelectedTokenAddress(usdt.contractAddress);
      }
    }
  }, []);

  const handleChainSelect = (chainId: string) => {
    const chain = supportedChainsAndTokens.find(c => c.id === parseInt(chainId));
    if (chain) {
      setSelectedChainId(chain.id);
      setSelectedChain(chain);
      // Reset token selection when chain changes
      setSelectedTokenAddress("");
    }
  };

  const handleTokenSelect = (tokenAddress: string) => {
    setSelectedTokenAddress(tokenAddress);
  };

  const getSelectedToken = () => {
    if (!selectedChain || !selectedTokenAddress) return null;
    return selectedChain.tokens.find(token => token.contractAddress === selectedTokenAddress);
  };

  const handleSwap = async () => {
    if (!nexusSDK) {
      toast.error("Nexus SDK not initialized");
      return;
    }

    if (!selectedTokenAddress) {
      toast.error("Please select a token");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      onSubmit();

      const selectedToken = getSelectedToken();
      const decimals = selectedToken?.decimals || 18;
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));

      const swapWithExactOutInput: ExactOutSwapInput = {
        toChainId: selectedChainId as SUPPORTED_CHAINS_IDS,
        toTokenAddress: selectedTokenAddress as `0x${string}`,
        toAmount: amountInWei
      };

      console.log("Swap input:", swapWithExactOutInput);

      const swapWithExactOutResult = await nexusSDK.swapWithExactOut(swapWithExactOutInput, {
        swapIntentHook: async (data: Parameters<SwapIntentHook>[0]) => {
          console.log("swapIntentHook called: ", data);
          const { allow } = data;

          // Auto-approve the transaction
          allow();
        }
      });

      console.log("Swap result:", swapWithExactOutResult);
      toast.success("Swap completed successfully!");
    } catch (error) {
      console.error("Swap error:", error);
      toast.error("Swap failed. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-semibold mb-1">Select Chain</Label>
        <Select
          value={selectedChainId?.toString()}
          onValueChange={handleChainSelect}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a chain">
              {selectedChain && (
                <div className="flex items-center gap-2">
                  <Image
                    src={selectedChain.logo}
                    alt={selectedChain.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  {selectedChain.name}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {supportedChainsAndTokens.map((chain) => (
              <SelectItem key={chain.id} value={chain.id.toString()}>
                <div className="flex items-center gap-2">
                  <Image
                    src={chain.logo}
                    alt={chain.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  {chain.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-semibold mb-1">Select Token</Label>
        <Select
          value={selectedTokenAddress}
          onValueChange={handleTokenSelect}
          disabled={!selectedChain}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a token">
              {getSelectedToken() && (
                <div className="flex items-center gap-2">
                  {getSelectedToken()!.symbol}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {selectedChain?.tokens.map((token) => (
              <SelectItem key={token.contractAddress} value={token.contractAddress}>
                <div className="flex items-center gap-2">
                  <span>{token.symbol}</span>
                  <span className="text-xs text-gray-500">{token.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount" className="text-sm font-semibold mb-1">
          Amount
        </Label>
        <Input
          id="amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full"
          step="any"
        />
      </div>

      <Button
        onClick={handleSwap}
        disabled={isSubmitting || !selectedTokenAddress || !amount || parseFloat(amount) <= 0}
        className="w-full"
      >
        {isSubmitting ? "Swapping..." : "Swap"}
      </Button>
    </div>
  );
};