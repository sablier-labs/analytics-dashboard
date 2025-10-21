import { SOLANA_STABLECOIN_MINTS } from "../constants/stablecoins";

const SOLANA_LOCKUP_GRAPHQL_ENDPOINT =
  "https://graph.sablier.io/lockup-mainnet/subgraphs/name/sablier-lockup-solana-mainnet";

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export interface StreamsResponse {
  streams: Array<{
    id: string;
    sender: string;
    recipient: string;
  }>;
}

export interface StreamAggregateResponse {
  streams: Array<{
    id: string;
  }>;
}

export interface ActionResponse {
  actions: Array<{
    id: string;
    addressA: string | null;
  }>;
}

export interface TopSPLToken {
  mint: string;
  address: string;
  streamCount: number;
  symbol?: string;
  name?: string;
  logoURI?: string;
}

export interface AssetResponse {
  assets: Array<{
    id: string;
    mint: string;
    address: string;
    streams: Array<{
      id: string;
    }>;
  }>;
}

export interface StreamTimestampResponse {
  streams: Array<{
    id: string;
    timestamp: string;
  }>;
}

export async function fetchSolanaUsers(): Promise<number> {
  const uniqueUsers = new Set<string>();
  let skip = 0;
  const first = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetSolanaUsers {
          streams(first: ${first}, skip: ${skip}, orderBy: id, orderDirection: asc) {
            id
            sender
            recipient
          }
        }
      `;

      const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<StreamsResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.streams;

      // Dedupe senders and recipients across all batches
      batch.forEach((stream) => {
        uniqueUsers.add(stream.sender);
        uniqueUsers.add(stream.recipient);
      });

      hasMore = batch.length === first;
      skip += first;
    }

    return uniqueUsers.size;
  } catch (error) {
    console.error("Error fetching Solana users:", error);
    throw error;
  }
}

export async function fetchSolanaMAU(): Promise<number> {
  const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
  const uniqueUsers = new Set<string>();
  let skip = 0;
  const first = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetSolanaMAU {
          actions(
            where: { timestamp_gte: "${thirtyDaysAgo}" }
            first: ${first}
            skip: ${skip}
            orderBy: id
            orderDirection: asc
          ) {
            id
            addressA
          }
        }
      `;

      const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<ActionResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.actions;

      // Dedupe addressA across all batches
      for (const action of batch) {
        if (action.addressA !== null) {
          uniqueUsers.add(action.addressA);
        }
      }

      hasMore = batch.length === first;
      skip += first;
    }

    return uniqueUsers.size;
  } catch (error) {
    console.error("Error fetching Solana MAU:", error);
    throw error;
  }
}

export async function fetchSolanaStreams(): Promise<number> {
  let total = 0;
  let skip = 0;
  const first = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetSolanaStreams {
          streams(first: ${first}, skip: ${skip}, orderBy: id, orderDirection: asc) {
            id
          }
        }
      `;

      const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<StreamAggregateResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.streams;

      // Count all batches
      total += batch.length;

      hasMore = batch.length === first;
      skip += first;
    }

    return total;
  } catch (error) {
    console.error("Error fetching Solana streams:", error);
    throw error;
  }
}

export async function fetchSolanaTransactions(): Promise<number> {
  let total = 0;
  let skip = 0;
  const first = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetSolanaTransactions {
          actions(first: ${first}, skip: ${skip}, orderBy: id, orderDirection: asc) {
            id
          }
        }
      `;

      const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<{ actions: Array<{ id: string }> }> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.actions;

      // Count all batches
      total += batch.length;

      hasMore = batch.length === first;
      skip += first;
    }

    return total;
  } catch (error) {
    console.error("Error fetching Solana transactions:", error);
    throw error;
  }
}

export async function fetchSolanaTopTokens(): Promise<TopSPLToken[]> {
  const { resolveTokenMetadata } = await import("./solana-token-metadata");
  const allAssets: Array<{
    mint: string;
    address: string;
    streamCount: number;
  }> = [];
  let skip = 0;
  const first = 1000;
  let hasMore = true;

  try {
    // Fetch all assets across all batches
    while (hasMore) {
      const query = `
        query GetTopTokens {
          assets(first: ${first}, skip: ${skip}, orderBy: id, orderDirection: asc) {
            id
            mint
            address
            streams {
              id
            }
          }
        }
      `;

      const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<AssetResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.assets;

      // Accumulate assets from all batches
      batch.forEach((asset) => {
        allAssets.push({
          address: asset.address,
          mint: asset.mint,
          streamCount: asset.streams.length,
        });
      });

      hasMore = batch.length === first;
      skip += first;
    }

    // Sort all assets and get top 10
    const topTokens = allAssets.sort((a, b) => b.streamCount - a.streamCount).slice(0, 10);

    console.log(`🎨 Enriching ${topTokens.length} tokens with metadata...`);

    try {
      const mints = topTokens.map((t) => t.mint);
      const metadataMap = await resolveTokenMetadata(mints);

      const enrichedTokens = topTokens.map((token) => {
        const metadata = metadataMap.get(token.mint);
        return {
          ...token,
          logoURI: metadata?.logoURI,
          name: metadata?.name,
          symbol: metadata?.symbol,
        };
      });

      const withMetadata = enrichedTokens.filter((t) => t.symbol).length;
      console.log(
        `✅ Token enrichment complete: ${withMetadata}/${topTokens.length} tokens have metadata`,
      );

      return enrichedTokens;
    } catch (error) {
      console.error("❌ Error enriching token metadata:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
      console.log("⚠️ Returning tokens without metadata due to error");
      return topTokens;
    }
  } catch (error) {
    console.error("Error fetching Solana top tokens:", error);
    throw error;
  }
}

export async function fetchSolanaStreams24h(): Promise<number> {
  const twentyFourHoursAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
  let total = 0;
  let skip = 0;
  const first = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetStreams24h {
          streams(
            where: { timestamp_gte: "${twentyFourHoursAgo}" }
            first: ${first}
            skip: ${skip}
            orderBy: id
            orderDirection: asc
          ) {
            id
            timestamp
          }
        }
      `;

      const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<StreamTimestampResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.streams;

      // Count all batches
      total += batch.length;

      hasMore = batch.length === first;
      skip += first;
    }

    return total;
  } catch (error) {
    console.error("Error fetching Solana streams 24h:", error);
    throw error;
  }
}

// Solana stablecoin mint addresses (mainnet)
// Solana stablecoin mints imported from centralized constants

export interface StreamVolumeResponse {
  streams: Array<{
    depositAmount: string;
    asset: {
      decimals: string; // GraphQL returns string, not number
      mint: string;
    };
  }>;
}

export async function fetchSolanaLockupStablecoinVolume(): Promise<number> {
  let totalVolume = 0;
  let skip = 0;
  const first = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetSolanaLockupVolume {
          streams(first: ${first}, skip: ${skip}, where: {depositAmount_gt: "0"}, orderBy: id, orderDirection: asc) {
            id
            depositAmount
            asset {
              decimals
              mint
            }
          }
        }
      `;

      const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<StreamVolumeResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.streams;

      // Accumulate normalized volumes for this batch (stablecoins only)
      const batchVolume = batch
        .filter((stream) => SOLANA_STABLECOIN_MINTS.includes(stream.asset.mint))
        .reduce((sum, stream) => {
          const decimals = Number(stream.asset.decimals);
          if (Number.isNaN(decimals)) {
            throw new Error(`Invalid decimals value: ${stream.asset.decimals}`);
          }
          const depositAmount = BigInt(stream.depositAmount);
          // Divide first (in BigInt) to preserve precision, then convert to Number
          const normalized = Number(depositAmount / BigInt(10) ** BigInt(decimals));
          return sum + normalized;
        }, 0);

      totalVolume += batchVolume;

      // Check if we need to fetch more
      hasMore = batch.length === first;
      skip += first;
    }

    return totalVolume;
  } catch (error) {
    console.error("Error fetching Solana Lockup stablecoin volume:", error);
    throw error;
  }
}

export async function fetchSolanaLockupStablecoinVolumeTimeRange(days: number): Promise<number> {
  const timestamp = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
  let totalVolume = 0;
  let skip = 0;
  const first = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetSolanaLockupVolumeTimeRange {
          streams(first: ${first}, skip: ${skip}, where: {depositAmount_gt: "0", timestamp_gte: "${timestamp}"}, orderBy: id, orderDirection: asc) {
            id
            depositAmount
            asset {
              decimals
              mint
            }
          }
        }
      `;

      const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<StreamVolumeResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.streams;

      // Accumulate normalized volumes for this batch (stablecoins only)
      const batchVolume = batch
        .filter((stream) => SOLANA_STABLECOIN_MINTS.includes(stream.asset.mint))
        .reduce((sum, stream) => {
          const decimals = Number(stream.asset.decimals);
          if (Number.isNaN(decimals)) {
            throw new Error(`Invalid decimals value: ${stream.asset.decimals}`);
          }
          const depositAmount = BigInt(stream.depositAmount);
          // Divide first (in BigInt) to preserve precision, then convert to Number
          const normalized = Number(depositAmount / BigInt(10) ** BigInt(decimals));
          return sum + normalized;
        }, 0);

      totalVolume += batchVolume;

      // Check if we need to fetch more
      hasMore = batch.length === first;
      skip += first;
    }

    return totalVolume;
  } catch (error) {
    console.error("Error fetching Solana Lockup stablecoin volume time range:", error);
    throw error;
  }
}
