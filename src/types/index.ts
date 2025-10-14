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
  { id: 1, name: "Ethereum" },
  { id: 137, name: "Polygon" },
  { id: 56, name: "BSC" },
  { id: 42161, name: "Arbitrum" },
  { id: 10, name: "Optimism" },
  { id: 101, name: "Solana" }, 
] as const;

// Token options
export const TOKEN_OPTIONS = [
  "USDT",
  "USDC",
  "ETH",
  "BTC",
  "MATIC",
  "SOL",
  "BNB",
] as const;
