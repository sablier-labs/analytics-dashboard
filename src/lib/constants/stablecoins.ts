/**
 * Centralized stablecoin configuration
 * This is the single source of truth for stablecoin identification across all protocols
 */

/**
 * EVM-compatible stablecoins (used by Lockup, Flow, and Airdrops protocols)
 */
export const EVM_STABLECOINS = [
  "BUSD",
  "DAI",
  "FRAX",
  "GHO",
  "GUSD",
  "LUSD",
  "PYUSD",
  "TUSD",
  "USDB",
  "USDC",
  "USDC.e",
  "USDbC",
  "USDD",
  "USDP",
  "USDT",
  "crvUSD",
  "sUSD",
] as const;

/**
 * Solana stablecoins by mint address
 * Note: Solana uses token mint addresses for identification instead of symbols
 */
export const SOLANA_STABLECOIN_MINTS: readonly string[] = [
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
  "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo", // PYUSD
  // TODO: Add UXD, USDY, and other Solana stablecoins as they gain adoption
];

/**
 * Type-safe access to stablecoin lists
 */
export type EVMStablecoin = (typeof EVM_STABLECOINS)[number];
export type SolanaStablecoinMint = (typeof SOLANA_STABLECOIN_MINTS)[number];
