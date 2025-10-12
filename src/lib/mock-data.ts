export interface ConfigKey {
  id: string;
  chain: string;
  token: string;
  address: string;
  apiKey: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  date: Date;
  amount: string;
  token: string;
  chain: string;
  status: "completed" | "pending" | "failed";
  hash: string;
}

export interface RevenueStats {
  today: string;
  monthly: string;
}

// Chain options
export const CHAIN_OPTIONS = [
  "Ethereum",
  "Polygon",
  "BSC",
  "Solana",
  "Arbitrum",
  "Optimism",
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

// Mock config keys
export const mockConfigKeys: ConfigKey[] = [
  {
    id: "1",
    chain: "Ethereum",
    token: "USDT",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    apiKey: "sk1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u",
    createdAt: new Date("2024-10-01"),
  },
  {
    id: "2",
    chain: "Polygon",
    token: "USDC",
    address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    apiKey: "pk9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f",
    createdAt: new Date("2024-10-05"),
  },
  {
    id: "3",
    chain: "BSC",
    token: "BNB",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    apiKey: "ak5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g",
    createdAt: new Date("2024-10-10"),
  },
];

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: new Date("2024-10-12T10:30:00"),
    amount: "150.50",
    token: "USDT",
    chain: "Ethereum",
    status: "completed",
    hash: "0xabc123...def456",
  },
  {
    id: "2",
    date: new Date("2024-10-12T09:15:00"),
    amount: "500.00",
    token: "USDC",
    chain: "Polygon",
    status: "completed",
    hash: "0x789xyz...012abc",
  },
  {
    id: "3",
    date: new Date("2024-10-12T08:45:00"),
    amount: "0.05",
    token: "ETH",
    chain: "Ethereum",
    status: "pending",
    hash: "0xdef789...ghi012",
  },
  {
    id: "4",
    date: new Date("2024-10-11T18:20:00"),
    amount: "250.75",
    token: "USDT",
    chain: "BSC",
    status: "completed",
    hash: "0x456jkl...mno789",
  },
  {
    id: "5",
    date: new Date("2024-10-11T14:10:00"),
    amount: "1000.00",
    token: "USDC",
    chain: "Polygon",
    status: "completed",
    hash: "0xpqr123...stu456",
  },
  {
    id: "6",
    date: new Date("2024-10-11T10:05:00"),
    amount: "75.25",
    token: "BNB",
    chain: "BSC",
    status: "failed",
    hash: "0xvwx789...yza012",
  },
];

// Mock revenue stats
export const mockRevenueStats: RevenueStats = {
  today: "$650.50",
  monthly: "$15,234.75",
};
