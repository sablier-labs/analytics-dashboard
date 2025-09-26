// Comprehensive list of testnet chain IDs to exclude from analytics
export const TESTNET_CHAIN_IDS = [
  "5", // Goerli (deprecated)
  "11155111", // Sepolia
  "84532", // Base Sepolia
  "84531", // Base Goerli (deprecated)
  "421614", // Arbitrum Sepolia
  "421613", // Arbitrum Goerli (deprecated)
  "11155420", // Optimism Sepolia
  "420", // Optimism Goerli (deprecated)
  "59141", // Linea Sepolia
  "59140", // Linea Goerli (deprecated)
  "534351", // Scroll Sepolia
  "534353", // Scroll Alpha (testnet)
  "168587773", // Blast Sepolia
  "1442", // Polygon zkEVM testnet
  "80001", // Polygon Mumbai (deprecated)
  "80002", // Polygon Amoy
  "97", // BSC Testnet
  "43113", // Avalanche Fuji
  "2818", // Mode testnet (if different from mainnet)
  "919", // Mode testnet
] as const;

// Mainnet chain mappings (excluding testnets)
export const MAINNET_CHAIN_NAMES: Record<string, string> = {
  "1": "Ethereum",
  "8": "Ubiq",
  "10": "Optimism",
  "14": "Flare",
  "19": "Songbird",
  "20": "Elastos",
  "24": "Kardia",
  "25": "Cronos",
  "30": "RSK",
  "40": "Telos",
  "42": "Lukso",
  "44": "Crab",
  "46": "Darwinia",
  "50": "XDC",
  "52": "CSC",
  "55": "Zyx",
  "56": "BSC",
  "57": "Syscoin",
  "60": "GoChain",
  "61": "Ethereum Classic",
  "66": "OKExChain",
  "70": "Hoo",
  "82": "Meter",
  "87": "Nova Network",
  "88": "TomoChain",
  "96": "Bitkub",
  "100": "Gnosis",
  "106": "Velas",
  "108": "ThunderCore",
  "119": "ENULS",
  "122": "Fuse",
  "128": "Heco",
  "130": "Unichain",
  "137": "Polygon",
  "146": "Sonic",
  "8453": "Base",
  "34443": "Mode",
  "42161": "Arbitrum",
  "43114": "Avalanche",
  "59144": "Linea",
  "534352": "Scroll",
};

// Helper function to check if a chain ID is a testnet
export function isTestnetChain(chainId: string): boolean {
  return TESTNET_CHAIN_IDS.includes(chainId as any);
}

// Helper function to get mainnet chain name
export function getMainnetChainName(chainId: string): string {
  return MAINNET_CHAIN_NAMES[chainId] || `Chain ${chainId}`;
}

// Get all testnet chain IDs for GraphQL queries (as string array)
export function getTestnetChainIds(): string[] {
  return [...TESTNET_CHAIN_IDS];
}
