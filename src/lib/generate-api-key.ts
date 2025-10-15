import { CHAIN_OPTIONS } from "@/types";

/**
 * Generates a random alphanumeric API key of specified length
 * @param length - Length of the API key (default: 44)
 * @returns Random alphanumeric string
 */
export function generateApiKey(length: number = 44): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let apiKey = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    apiKey += chars[randomIndex];
  }

  return apiKey;
}

/**
 * Masks an API key showing only first 3 and last 3 characters
 * @param apiKey - The full API key
 * @returns Masked API key (e.g., "abc****efg")
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 6) {
    return apiKey;
  }

  const firstThree = apiKey.slice(0, 3);
  const lastThree = apiKey.slice(-3);

  return `${firstThree}****${lastThree}`;
}

/**
 * Masks an address showing only first 5 and last 5 characters
 * @param address - The full address
 * @returns Masked address (e.g., "0x742...f0bEb")
 */
export function maskAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }

  const firstFive = address.slice(0, 5);
  const lastFive = address.slice(-5);

  return `${firstFive}...${lastFive}`;
}
export function maskTxHash(hash: string): string {
  if (hash.length <= 10) {
    return hash;
  }

  const first = hash.slice(0, 10);
  const last = hash.slice(-5);

  return `${first}...${last}`;
}

//function to get chain name from chain id
export function getChainNameFromId(id: number): string {
  const chain = CHAIN_OPTIONS.find((chain) => chain.id === id);
  return chain?.name || String(id);
}
