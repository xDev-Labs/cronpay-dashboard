export interface ConfigKey {
  id: string;
  chain: string;
  token: string;
  address: string;
  apiKey: string;
  createdAt: Date;
}

// export interface Transaction {
//   id: string;
//   date: Date;
//   amount: string;
//   token: string;
//   chain: string;
//   status: "completed" | "pending" | "failed";
//   hash: string;
// }

// Transaction returned by API (/api/transactions)
export interface Transaction {
  id: string;
  amount: string;
  currency: string;
  token_received_amount: string | null;
  status: "completed" | "pending" | "failed";
  transaction_hash: string | null;
  intent_id: number | null;
  created_at: string;
  config_keys?: {
    id: string;
    chain: string | number;
    token: string;
  } | null;
}

export interface RevenueStats {
  today: string;
  monthly: string;
}

// Chain options
export const CHAIN_OPTIONS = [
  { id: 11155111, name: "Ethereum" },
  { id: 80002, name: "Polygon" },
  { id: 84532, name: "Base" },
  { id: 421614, name: "Arbitrum" },
  { id: 11155420, name: "Optimism" },
  { id: 10143, name: "Monad" },
] as const;

// Token options
export const TOKEN_OPTIONS = ["USDT", "USDC", "ETH"] as const;

// Balance types for Nexus SDK
export interface BalanceBreakdown {
  chain: {
    name: string;
  };
  balance: string;
}

export interface UnifiedBalance {
  symbol: string;
  balance: string;
  balanceInFiat: number;
  chainId?: string | number;
  icon?: string;
  breakdown?: BalanceBreakdown[];
}
