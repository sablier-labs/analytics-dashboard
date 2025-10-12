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

export async function fetchSolanaTokenRegistry(): Promise<SolanaTokenMetadata[]> {
  try {
    console.log("🔍 Fetching Solana Token Registry...");
    const response = await fetch(
      "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json",
      {
        headers: {
          "User-Agent": "Sablier-Analytics/1.0",
        },
        signal: AbortSignal.timeout(15000), // 15 second timeout
      },
    );

    console.log(`📡 Solana Token Registry response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Solana Token Registry: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    // The registry format has a "tokens" array
    const tokens = data.tokens || [];
    console.log(`✅ Fetched ${tokens.length} tokens from Solana Token Registry`);

    // Map to our SolanaTokenMetadata interface
    return tokens.map((token: any) => ({
      address: token.address,
      decimals: token.decimals,
      logoURI: token.logoURI,
      name: token.name,
      symbol: token.symbol,
    }));
  } catch (error) {
    console.error("❌ Error fetching Solana Token Registry:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    // Return empty array on error instead of throwing
    return [];
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
    console.log(`🔎 Resolving metadata for ${mints.length} token mints`);

    // Try Jupiter first (fastest, most comprehensive)
    let jupiterTokens: SolanaTokenMetadata[] = [];
    try {
      jupiterTokens = await fetchJupiterTokenList();
    } catch (_error) {
      console.warn("⚠️ Jupiter token list failed, will try Solana registry");
    }

    const jupiterMap = createTokenMetadataMap(jupiterTokens);

    // Find tokens not in Jupiter
    const missingMints = mints.filter((mint) => !jupiterMap.has(mint));

    // Try Solana Token Registry for missing tokens
    let registryMap = new Map<string, SolanaTokenMetadata>();
    if (missingMints.length > 0) {
      console.log(
        `🔍 ${missingMints.length} tokens not found in Jupiter, trying Solana Token Registry...`,
      );
      const registryTokens = await fetchSolanaTokenRegistry();
      registryMap = createTokenMetadataMap(registryTokens);
    }

    // Merge results (Jupiter takes priority)
    const resolvedMap = new Map<string, SolanaTokenMetadata>();
    for (const mint of mints) {
      const metadata = jupiterMap.get(mint) || registryMap.get(mint);
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
