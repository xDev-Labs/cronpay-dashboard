import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import {
  SUPPORTED_TOKENS,
  TESTNET_TOKEN_METADATA,
  TOKEN_METADATA,
} from "@avail-project/nexus-core";

const TokenSelect = ({
  selectedToken,
  selectedChain,
  handleTokenSelect,
  isTestnet = false,
  disabled = false,
}: {
  selectedToken?: SUPPORTED_TOKENS;
  selectedChain: string;
  handleTokenSelect: (token: SUPPORTED_TOKENS) => void;
  isTestnet?: boolean;
  disabled?: boolean;
}) => {
  const tokenData = isTestnet ? TESTNET_TOKEN_METADATA : TOKEN_METADATA;
  const selectedTokenData = Object.entries(tokenData)?.find(([, token]) => {
    return token.symbol === selectedToken;
  });
  return (
    <Select
      value={selectedToken}
      onValueChange={(value: string) =>
        !disabled && handleTokenSelect(value as SUPPORTED_TOKENS)
      }
    >
      <SelectTrigger
        disabled={disabled}
        className="w-full !shadow-[var(--ck-connectbutton-box-shadow)] rounded-[var(--ck-connectbutton-border-radius)] border-none"
      >
        <SelectValue placeholder="Select a token">
          {selectedChain && selectedTokenData && (
            <div className="flex items-center gap-2">
              <Image
                src={selectedTokenData[1].icon}
                alt={selectedTokenData[1].symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
              {selectedToken}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white rounded-[var(--ck-connectbutton-border-radius)]">
        {Object.entries(tokenData)?.map(([, token]) => (
          <SelectItem
            key={token.symbol}
            value={token.symbol}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-[var(--ck-connectbutton-border-radius)]"
          >
            <div className="flex items-center gap-2 my-1">
              <Image
                src={token.icon}
                alt={token.symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <span>
                  {isTestnet ? `${token.symbol} (Testnet)` : token.symbol}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TokenSelect;
