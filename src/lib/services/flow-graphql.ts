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

interface StablecoinVolumeResponse {
  Stream_aggregate: {
    aggregate: {
      sum: {
        depositedAmount: string | null;
      };
    };
  };
}

export async function fetchFlowDeposits(): Promise<number> {
  const query = `
    query GetFlowDeposits {
      Action_aggregate(where: { category: { _eq: "Deposit" } }) {
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

export async function fetchFlowStablecoinVolume(): Promise<number> {
  const query = `
    query GetFlowStablecoinVolume {
      Stream_aggregate(
        where: {
          asset: {
            symbol: { _in: ["USDC", "USDC.e", "USDT", "DAI", "USDB", "PYUSD", "BUSD", "TUSD", "USDP", "GUSD", "FRAX", "LUSD", "USDD", "sUSD", "USDbC", "GHO", "crvUSD"] }
          }
        }
      ) {
        aggregate {
          sum {
            depositedAmount
          }
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

    const result: GraphQLResponse<StablecoinVolumeResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    // depositedAmount is in smallest unit (6 decimals for stablecoins)
    const sumString = result.data.Stream_aggregate.aggregate.sum.depositedAmount;

    if (!sumString) return 0;

    // Convert from smallest unit to USD (assuming 6 decimals)
    const volumeInSmallestUnit = BigInt(sumString);
    const volumeInUSD = Number(volumeInSmallestUnit) / 1000000;

    return volumeInUSD;
  } catch (error) {
    console.error("Error fetching Flow stablecoin volume:", error);
    throw error;
  }
}
