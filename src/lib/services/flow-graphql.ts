import { getTestnetChainIds } from "@/lib/constants/chains";

const FLOW_GRAPHQL_ENDPOINT = "https://indexer.hyperindex.xyz/3b4ea6b/v1/graphql";

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

interface DepositAggregateResponse {
  Action_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export async function fetchFlowDeposits(): Promise<number> {
  const testnetChainIds = getTestnetChainIds();
  const query = `
    query GetFlowDeposits {
      Action_aggregate(where: {
        chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
        category: { _eq: "Deposit" }
      }) {
        aggregate {
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(FLOW_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<DepositAggregateResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.Action_aggregate.aggregate.count;
  } catch (error) {
    console.error("Error fetching Flow deposits:", error);
    throw error;
  }
}

interface StreamsWithDecimalsResponse {
  Stream: Array<{
    depositedAmount: string;
    asset: {
      decimals: number;
    };
  }>;
}

const FLOW_STABLECOINS = [
  "USDC",
  "USDC.e",
  "USDT",
  "DAI",
  "USDB",
  "PYUSD",
  "BUSD",
  "TUSD",
  "USDP",
  "GUSD",
  "FRAX",
  "LUSD",
  "USDD",
  "sUSD",
  "USDbC",
  "GHO",
  "crvUSD",
];

export async function fetchFlowStablecoinVolume(): Promise<number> {
  const testnetChainIds = getTestnetChainIds();
  let totalVolume = 0;
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetFlowStablecoinVolume {
          Stream(
            limit: ${limit}
            offset: ${offset}
            where: {
              chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
              asset: {
                symbol: { _in: ${JSON.stringify(FLOW_STABLECOINS)} }
              }
            }
          ) {
            depositedAmount
            asset {
              decimals
            }
          }
        }
      `;

      const response = await fetch(FLOW_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<StreamsWithDecimalsResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.Stream;

      // Accumulate normalized volumes for this batch
      const batchVolume = batch.reduce((sum, stream) => {
        const depositedAmount = BigInt(stream.depositedAmount);
        const decimals = Number(stream.asset.decimals);
        if (isNaN(decimals)) {
          throw new Error(`Invalid decimals value: ${stream.asset.decimals}`);
        }
        const normalized = Number(depositedAmount / BigInt(10) ** BigInt(decimals));
        return sum + normalized;
      }, 0);

      totalVolume += batchVolume;

      // Check if we need to fetch more
      hasMore = batch.length === limit;
      offset += limit;
    }

    return totalVolume;
  } catch (error) {
    console.error("Error fetching Flow stablecoin volume:", error);
    throw error;
  }
}

export async function fetchFlowStablecoinVolumeTimeRange(days: number): Promise<number> {
  const testnetChainIds = getTestnetChainIds();
  const timestamp = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000).toString();
  let totalVolume = 0;
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetFlowStablecoinVolumeTimeRange {
          Stream(
            limit: ${limit}
            offset: ${offset}
            where: {
              chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
              timestamp: { _gte: "${timestamp}" }
              asset: {
                symbol: { _in: ${JSON.stringify(FLOW_STABLECOINS)} }
              }
            }
          ) {
            depositedAmount
            asset {
              decimals
            }
          }
        }
      `;

      const response = await fetch(FLOW_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<StreamsWithDecimalsResponse> = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.Stream;

      // Accumulate normalized volumes for this batch
      const batchVolume = batch.reduce((sum, stream) => {
        const depositedAmount = BigInt(stream.depositedAmount);
        const decimals = Number(stream.asset.decimals);
        if (isNaN(decimals)) {
          throw new Error(`Invalid decimals value: ${stream.asset.decimals}`);
        }
        const normalized = Number(depositedAmount / BigInt(10) ** BigInt(decimals));
        return sum + normalized;
      }, 0);

      totalVolume += batchVolume;

      // Check if we need to fetch more
      hasMore = batch.length === limit;
      offset += limit;
    }

    return totalVolume;
  } catch (error) {
    console.error("Error fetching Flow stablecoin volume time range:", error);
    throw error;
  }
}
