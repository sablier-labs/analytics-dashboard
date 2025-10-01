export interface SolanaTokenMetadata {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export async function fetchJupiterTokenList(): Promise<SolanaTokenMetadata[]> {
  try {
    console.log("🔍 Fetching Jupiter token list...");
    const response = await fetch("https://token.jup.ag/all", {
      headers: {
        "User-Agent": "Sablier-Analytics/1.0",
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    console.log(`📡 Jupiter API response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Jupiter token list: ${response.status} ${response.statusText}`,
      );
    }

    const tokens = await response.json();
    console.log(`✅ Fetched ${tokens.length} tokens from Jupiter`);
    return tokens as SolanaTokenMetadata[];
  } catch (error) {
    console.error("❌ Error fetching Jupiter token list:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
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
    console.log(`🔎 Resolving metadata for ${mints.length} token mints:`, mints);

    const allTokens = await fetchJupiterTokenList();
    const metadataMap = createTokenMetadataMap(allTokens);

    const resolvedMap = new Map<string, SolanaTokenMetadata>();
    for (const mint of mints) {
      const metadata = metadataMap.get(mint);
      if (metadata) {
        console.log(`  ✓ Found: ${mint.slice(0, 8)}... → ${metadata.symbol} (${metadata.name})`);
        resolvedMap.set(mint, metadata);
      } else {
        console.log(`  ✗ Not found: ${mint.slice(0, 8)}...`);
      }
    }

    console.log(`✅ Resolved ${resolvedMap.size}/${mints.length} token metadata entries`);
    return resolvedMap;
  } catch (error) {
    console.error("❌ Error resolving token metadata:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return new Map();
  }
}
