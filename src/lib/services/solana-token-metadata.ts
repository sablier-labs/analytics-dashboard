export interface SolanaTokenMetadata {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export async function fetchJupiterTokenList(): Promise<SolanaTokenMetadata[]> {
  try {
    const response = await fetch("https://token.jup.ag/all");

    if (!response.ok) {
      throw new Error(`Failed to fetch Jupiter token list: ${response.status}`);
    }

    const tokens = await response.json();
    return tokens as SolanaTokenMetadata[];
  } catch (error) {
    console.error("Error fetching Jupiter token list:", error);
    throw error;
  }
}

export function createTokenMetadataMap(
  tokens: SolanaTokenMetadata[],
): Map<string, SolanaTokenMetadata> {
  const map = new Map<string, SolanaTokenMetadata>();
  for (const token of tokens) {
    map.set(token.address, token);
  }
  return map;
}

export async function resolveTokenMetadata(
  mints: string[],
): Promise<Map<string, SolanaTokenMetadata>> {
  try {
    const allTokens = await fetchJupiterTokenList();
    const metadataMap = createTokenMetadataMap(allTokens);

    const resolvedMap = new Map<string, SolanaTokenMetadata>();
    for (const mint of mints) {
      const metadata = metadataMap.get(mint);
      if (metadata) {
        resolvedMap.set(mint, metadata);
      }
    }
    return resolvedMap;
  } catch (error) {
    console.error("Error resolving token metadata:", error);
    return new Map();
  }
}
