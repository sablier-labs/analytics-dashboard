const SOLANA_AIRDROPS_GRAPHQL_ENDPOINT =
  "https://graph.sablier.io/airdrops-mainnet/subgraphs/name/sablier-airdrops-solana-mainnet";

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export interface CampaignAggregateResponse {
  campaigns: Array<{
    id: string;
  }>;
}

export interface ActivityResponse {
  activities: Array<{
    id: string;
    timestamp: string;
    claims: string;
  }>;
}

export async function fetchSolanaCampaigns(): Promise<number> {
  let total = 0;
  let skip = 0;
  const first = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetSolanaCampaigns {
          campaigns(first: ${first}, skip: ${skip}) {
            id
          }
        }
      `;

      const response = await fetch(SOLANA_AIRDROPS_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<CampaignAggregateResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.campaigns;

      // Count all batches
      total += batch.length;

      hasMore = batch.length === first;
      skip += first;
    }

    return total;
  } catch (error) {
    console.error("Error fetching Solana campaigns:", error);
    throw error;
  }
}

export async function fetchSolanaClaims24h(): Promise<number> {
  const twentyFourHoursAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
  let totalClaims = 0;
  let skip = 0;
  const first = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetClaims24h {
          activities(
            where: { timestamp_gte: "${twentyFourHoursAgo}" }
            first: ${first}
            skip: ${skip}
          ) {
            id
            timestamp
            claims
          }
        }
      `;

      const response = await fetch(SOLANA_AIRDROPS_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<ActivityResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.activities;

      // Sum claims across all batches
      const batchClaims = batch.reduce((sum, activity) => {
        const claims = parseInt(activity.claims, 10);
        if (isNaN(claims)) {
          throw new Error(`Invalid claims value: ${activity.claims}`);
        }
        return sum + claims;
      }, 0);

      totalClaims += batchClaims;

      hasMore = batch.length === first;
      skip += first;
    }

    return totalClaims;
  } catch (error) {
    console.error("Error fetching Solana claims 24h:", error);
    throw error;
  }
}

export async function fetchSolanaTotalClaims(): Promise<number> {
  let totalClaims = 0;
  let skip = 0;
  const first = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetTotalClaims {
          activities(
            first: ${first}
            skip: ${skip}
          ) {
            id
            claims
          }
        }
      `;

      const response = await fetch(SOLANA_AIRDROPS_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<ActivityResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.activities;

      // Sum claims across all batches
      const batchClaims = batch.reduce((sum, activity) => {
        const claims = parseInt(activity.claims, 10);
        if (isNaN(claims)) {
          throw new Error(`Invalid claims value: ${activity.claims}`);
        }
        return sum + claims;
      }, 0);

      totalClaims += batchClaims;

      hasMore = batch.length === first;
      skip += first;
    }

    return totalClaims;
  } catch (error) {
    console.error("Error fetching Solana total claims:", error);
    throw error;
  }
}

// Solana stablecoin mint addresses (mainnet)
const SOLANA_STABLECOIN_MINTS = [
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
  "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo", // PYUSD
];

export interface CampaignVolumeResponse {
  campaigns: Array<{
    aggregateAmount: string;
    asset: {
      decimals: number;
      mint: string;
    };
  }>;
}

export async function fetchSolanaAirdropsStablecoinVolume(): Promise<number> {
  let totalVolume = 0;
  let skip = 0;
  const first = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetSolanaAirdropsVolume {
          campaigns(first: ${first}, skip: ${skip}, where: {aggregateAmount_gt: "0"}) {
            aggregateAmount
            asset {
              decimals
              mint
            }
          }
        }
      `;

      const response = await fetch(SOLANA_AIRDROPS_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<CampaignVolumeResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.campaigns;

      // Accumulate normalized volumes for this batch (stablecoins only)
      const batchVolume = batch
        .filter((campaign) => SOLANA_STABLECOIN_MINTS.includes(campaign.asset.mint))
        .reduce((sum, campaign) => {
          const decimals = Number(campaign.asset.decimals);
          if (isNaN(decimals)) {
            throw new Error(`Invalid decimals value: ${campaign.asset.decimals}`);
          }
          const aggregateAmount = BigInt(campaign.aggregateAmount);
          const normalized = Number(aggregateAmount / BigInt(10) ** BigInt(decimals));
          return sum + normalized;
        }, 0);

      totalVolume += batchVolume;

      // Check if we need to fetch more
      hasMore = batch.length === first;
      skip += first;
    }

    return totalVolume;
  } catch (error) {
    console.error("Error fetching Solana Airdrops stablecoin volume:", error);
    throw error;
  }
}

export async function fetchSolanaAirdropsStablecoinVolumeTimeRange(days: number): Promise<number> {
  const timestamp = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
  let totalVolume = 0;
  let skip = 0;
  const first = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetSolanaAirdropsVolumeTimeRange {
          campaigns(first: ${first}, skip: ${skip}, where: {aggregateAmount_gt: "0", timestamp_gte: "${timestamp}"}) {
            aggregateAmount
            asset {
              decimals
              mint
            }
          }
        }
      `;

      const response = await fetch(SOLANA_AIRDROPS_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<CampaignVolumeResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.campaigns;

      // Accumulate normalized volumes for this batch (stablecoins only)
      const batchVolume = batch
        .filter((campaign) => SOLANA_STABLECOIN_MINTS.includes(campaign.asset.mint))
        .reduce((sum, campaign) => {
          const decimals = Number(campaign.asset.decimals);
          if (isNaN(decimals)) {
            throw new Error(`Invalid decimals value: ${campaign.asset.decimals}`);
          }
          const aggregateAmount = BigInt(campaign.aggregateAmount);
          const normalized = Number(aggregateAmount / BigInt(10) ** BigInt(decimals));
          return sum + normalized;
        }, 0);

      totalVolume += batchVolume;

      // Check if we need to fetch more
      hasMore = batch.length === first;
      skip += first;
    }

    return totalVolume;
  } catch (error) {
    console.error("Error fetching Solana Airdrops stablecoin volume time range:", error);
    throw error;
  }
}
