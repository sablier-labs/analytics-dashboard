const GRAPHQL_ENDPOINT = "https://indexer.hyperindex.xyz/53b7e25/v1/graphql";

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export interface UserAggregateResponse {
  User_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface TransactionAggregateResponse {
  UserTransaction_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface TimeBasedUserResponse {
  past30Days: {
    aggregate: {
      count: number;
    };
  };
  past90Days: {
    aggregate: {
      count: number;
    };
  };
  past180Days: {
    aggregate: {
      count: number;
    };
  };
  pastYear: {
    aggregate: {
      count: number;
    };
  };
}

export interface TimeBasedUserCounts {
  past30Days: number;
  past90Days: number;
  past180Days: number;
  pastYear: number;
}

export interface TimeBasedTransactionResponse {
  past30Days: {
    aggregate: {
      count: number;
    };
  };
  past90Days: {
    aggregate: {
      count: number;
    };
  };
  past180Days: {
    aggregate: {
      count: number;
    };
  };
  pastYear: {
    aggregate: {
      count: number;
    };
  };
}

export interface TimeBasedTransactionCounts {
  past30Days: number;
  past90Days: number;
  past180Days: number;
  pastYear: number;
}

export interface ChainDistribution {
  chainId: string;
  userCount: number;
}

export interface ChainDistributionResponse {
  User_aggregate_by_pk: Array<{
    chainId: string;
    aggregate: {
      count: number;
    };
  }>;
}

export interface MonthlyUserGrowth {
  month: string;
  cumulativeUsers: number;
  newUsers: number;
}

export interface MonthlyTransactionGrowth {
  month: string;
  cumulativeTransactions: number;
  newTransactions: number;
}


export interface UserTransactionDistribution {
  label: string;
  userCount: number;
}

export interface GrowthRateMetrics {
  userGrowthRate: number;
  transactionGrowthRate: number;
  averageTransactionGrowthRate: number;
}

export interface TopAsset {
  assetId: string;
  address: string;
  symbol: string;
  name: string;
  chainId: string;
  streamCount: number;
  decimals: number;
}

export interface MonthlyUserGrowthResponse {
  User: Array<{
    address: string;
    transactions: Array<{
      timestamp: string;
    }>;
  }>;
}

export async function fetchTotalUsers(): Promise<number> {
  const query = `
    query GetTotalUsers {
      User_aggregate(
        where: {
          transactions: {}
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<UserAggregateResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.User_aggregate.aggregate.count;
  } catch (error) {
    console.error("Error fetching total users:", error);
    throw error;
  }
}

export async function fetchTotalTransactions(): Promise<number> {
  const query = `
    query GetTotalTransactions {
      UserTransaction_aggregate {
        aggregate {
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<TransactionAggregateResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.UserTransaction_aggregate.aggregate.count;
  } catch (error) {
    console.error("Error fetching total transactions:", error);
    throw error;
  }
}

export async function fetchTimeBasedUserCounts(): Promise<TimeBasedUserCounts> {
  // Calculate timestamps for different periods as ISO date strings
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneHundredEightyDaysAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const query = `
    query GetTimeBasedUserCounts {
      past30Days: User_aggregate(
        where: {
          transactions: {
            timestamp: { _gte: "${thirtyDaysAgo.toISOString()}" }
          }
        }
      ) {
        aggregate {
          count
        }
      }
      past90Days: User_aggregate(
        where: {
          transactions: {
            timestamp: { _gte: "${ninetyDaysAgo.toISOString()}" }
          }
        }
      ) {
        aggregate {
          count
        }
      }
      past180Days: User_aggregate(
        where: {
          transactions: {
            timestamp: { _gte: "${oneHundredEightyDaysAgo.toISOString()}" }
          }
        }
      ) {
        aggregate {
          count
        }
      }
      pastYear: User_aggregate(
        where: {
          transactions: {
            timestamp: { _gte: "${oneYearAgo.toISOString()}" }
          }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<TimeBasedUserResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return {
      past30Days: result.data.past30Days.aggregate.count,
      past90Days: result.data.past90Days.aggregate.count,
      past180Days: result.data.past180Days.aggregate.count,
      pastYear: result.data.pastYear.aggregate.count,
    };
  } catch (error) {
    console.error("Error fetching time-based user counts:", error);
    throw error;
  }
}

export async function fetchTimeBasedTransactionCounts(): Promise<TimeBasedTransactionCounts> {
  // Calculate timestamps for different periods as ISO date strings
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneHundredEightyDaysAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const query = `
    query GetTimeBasedTransactionCounts {
      past30Days: UserTransaction_aggregate(
        where: {
          timestamp: { _gte: "${thirtyDaysAgo.toISOString()}" }
        }
      ) {
        aggregate {
          count
        }
      }
      past90Days: UserTransaction_aggregate(
        where: {
          timestamp: { _gte: "${ninetyDaysAgo.toISOString()}" }
        }
      ) {
        aggregate {
          count
        }
      }
      past180Days: UserTransaction_aggregate(
        where: {
          timestamp: { _gte: "${oneHundredEightyDaysAgo.toISOString()}" }
        }
      ) {
        aggregate {
          count
        }
      }
      pastYear: UserTransaction_aggregate(
        where: {
          timestamp: { _gte: "${oneYearAgo.toISOString()}" }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<TimeBasedTransactionResponse> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return {
      past30Days: result.data.past30Days.aggregate.count,
      past90Days: result.data.past90Days.aggregate.count,
      past180Days: result.data.past180Days.aggregate.count,
      pastYear: result.data.pastYear.aggregate.count,
    };
  } catch (error) {
    console.error("Error fetching time-based transaction counts:", error);
    throw error;
  }
}

export async function fetchMonthlyUserGrowth(): Promise<MonthlyUserGrowth[]> {
  // Extended approach: get cumulative counts from Sablier's inception
  const now = new Date();
  const timeRanges: Array<{ label: string; timestamp: string }> = [];

  // Start from when Sablier began
  const startDate = new Date("2023-07-01");
  const current = new Date(startDate);

  // Generate monthly timestamps from start date to now
  while (current <= now) {
    // Use end of month instead of beginning to capture all users in that month
    const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999);
    const timestamp = endOfMonth.toISOString();
    const label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    timeRanges.push({ label, timestamp });

    // Move to first day of next month
    current.setMonth(current.getMonth() + 1);
  }

  const queries = timeRanges.map((range, index) => {
    return `
      month_${index}: User_aggregate(
        where: {
          transactions: {
            timestamp: { _lte: "${range.timestamp}" }
          }
        }
      ) {
        aggregate {
          count
        }
      }
    `;
  });

  const query = `
    query GetCumulativeUserGrowth {
      ${queries.join("\n")}
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<any> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    // Process results into monthly growth data
    const monthlyData: MonthlyUserGrowth[] = [];

    timeRanges.forEach((range, index) => {
      const key = `month_${index}`;
      const cumulativeUsers = result.data[key].aggregate.count;
      const previousCumulative = index > 0 ? monthlyData[index - 1].cumulativeUsers : 0;
      const newUsers = cumulativeUsers - previousCumulative;

      monthlyData.push({
        cumulativeUsers,
        month: range.label,
        newUsers: Math.max(0, newUsers), // Ensure non-negative
      });
    });

    return monthlyData.filter((data) => data.cumulativeUsers > 0);
  } catch (error) {
    console.error("Error fetching monthly user growth:", error);
    throw error;
  }
}

export async function fetchChainDistribution(): Promise<ChainDistribution[]> {
  // First, get all unique chain IDs
  const chainQuery = `
    query GetUniqueChains {
      User(
        where: {
          transactions: {}
        }
        distinct_on: [chainId]
      ) {
        chainId
      }
    }
  `;

  try {
    const chainResponse = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query: chainQuery }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!chainResponse.ok) {
      throw new Error(`HTTP error! status: ${chainResponse.status}`);
    }

    const chainResult: GraphQLResponse<{ User: Array<{ chainId: string }> }> =
      await chainResponse.json();

    if (chainResult.errors) {
      throw new Error(`GraphQL error: ${chainResult.errors[0]?.message}`);
    }

    const uniqueChains = chainResult.data.User.map((u) => u.chainId);

    // Now create aggregation queries for each chain
    const chainQueries = uniqueChains.map((chainId, index) => {
      return `
        chain_${index}: User_aggregate(
          where: {
            chainId: { _eq: "${chainId}" }
            transactions: {}
          }
        ) {
          aggregate {
            count
          }
        }
      `;
    });

    const aggregateQuery = `
      query GetChainDistribution {
        ${chainQueries.join("\n")}
      }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query: aggregateQuery }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<any> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    // Process results
    const chainDistribution: ChainDistribution[] = [];

    uniqueChains.forEach((chainId, index) => {
      const key = `chain_${index}`;
      const count = result.data[key].aggregate.count;

      if (count > 0) {
        chainDistribution.push({
          chainId: chainId.toString(),
          userCount: count,
        });
      }
    });

    return chainDistribution.sort((a, b) => b.userCount - a.userCount);
  } catch (error) {
    console.error("Error fetching chain distribution:", error);
    throw error;
  }
}

export async function fetchMonthlyTransactionGrowth(): Promise<MonthlyTransactionGrowth[]> {
  const now = new Date();
  const timeRanges: Array<{ label: string; timestamp: string }> = [];

  const startDate = new Date("2023-07-01");
  const current = new Date(startDate);

  while (current <= now) {
    const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999);
    const timestamp = endOfMonth.toISOString();
    const label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    timeRanges.push({ label, timestamp });

    current.setMonth(current.getMonth() + 1);
  }

  const queries = timeRanges.map((range, index) => {
    return `
      month_${index}: UserTransaction_aggregate(
        where: {
          timestamp: { _lte: "${range.timestamp}" }
        }
      ) {
        aggregate {
          count
        }
      }
    `;
  });

  const query = `
    query GetCumulativeTransactionGrowth {
      ${queries.join("\n")}
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<any> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const monthlyData: MonthlyTransactionGrowth[] = [];

    timeRanges.forEach((range, index) => {
      const key = `month_${index}`;
      const cumulativeTransactions = result.data[key].aggregate.count;
      const previousCumulative = index > 0 ? monthlyData[index - 1].cumulativeTransactions : 0;
      const newTransactions = cumulativeTransactions - previousCumulative;

      monthlyData.push({
        cumulativeTransactions,
        month: range.label,
        newTransactions: Math.max(0, newTransactions),
      });
    });

    return monthlyData.filter((data) => data.cumulativeTransactions > 0);
  } catch (error) {
    console.error("Error fetching monthly transaction growth:", error);
    throw error;
  }
}



export async function fetchGrowthRateMetrics(): Promise<GrowthRateMetrics> {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const query = `
    query GetGrowthRateMetrics {
      currentMonthUsers: User_aggregate(
        where: {
          transactions: {
            timestamp: { _gte: "${lastMonth.toISOString()}" }
          }
        }
      ) {
        aggregate {
          count
        }
      }
      previousMonthUsers: User_aggregate(
        where: {
          transactions: {
            timestamp: { _gte: "${twoMonthsAgo.toISOString()}", _lt: "${lastMonth.toISOString()}" }
          }
        }
      ) {
        aggregate {
          count
        }
      }
      currentMonthTransactions: UserTransaction_aggregate(
        where: {
          timestamp: { _gte: "${lastMonth.toISOString()}" }
        }
      ) {
        aggregate {
          count
        }
      }
      previousMonthTransactions: UserTransaction_aggregate(
        where: {
          timestamp: { _gte: "${twoMonthsAgo.toISOString()}", _lt: "${lastMonth.toISOString()}" }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<{
      currentMonthUsers: { aggregate: { count: number } };
      previousMonthUsers: { aggregate: { count: number } };
      currentMonthTransactions: { aggregate: { count: number } };
      previousMonthTransactions: { aggregate: { count: number } };
    }> = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const currentUsers = result.data.currentMonthUsers.aggregate.count;
    const previousUsers = result.data.previousMonthUsers.aggregate.count;
    const currentTransactions = result.data.currentMonthTransactions.aggregate.count;
    const previousTransactions = result.data.previousMonthTransactions.aggregate.count;

    const userGrowthRate =
      previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0;
    const transactionGrowthRate =
      previousTransactions > 0
        ? ((currentTransactions - previousTransactions) / previousTransactions) * 100
        : 0;

    const currentAvgTx = currentUsers > 0 ? currentTransactions / currentUsers : 0;
    const previousAvgTx = previousUsers > 0 ? previousTransactions / previousUsers : 0;
    const averageTransactionGrowthRate =
      previousAvgTx > 0 ? ((currentAvgTx - previousAvgTx) / previousAvgTx) * 100 : 0;

    return {
      averageTransactionGrowthRate,
      transactionGrowthRate,
      userGrowthRate,
    };
  } catch (error) {
    console.error("Error fetching growth rate metrics:", error);
    throw error;
  }
}

export async function fetchTopAssetsByStreamCount(): Promise<TopAsset[]> {
  // First, let's try a simpler approach - get all assets and then count their streams
  const query = `
    query GetTopAssets {
      Asset(limit: 50) {
        id
        address
        symbol
        name
        chainId
        decimals
        streams {
          id
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<{
      Asset: Array<{
        id: string;
        address: string;
        symbol: string;
        name: string;
        chainId: string;
        decimals: string;
        streams: Array<{ id: string }>;
      }>;
    }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    console.log(`Fetched ${result.data.Asset.length} assets from GraphQL`);

    // Convert to TopAsset format and sort by stream count
    const topAssets = result.data.Asset
      .map((asset) => ({
        assetId: asset.id,
        address: asset.address,
        symbol: asset.symbol,
        name: asset.name,
        chainId: asset.chainId,
        streamCount: asset.streams.length,
        decimals: parseInt(asset.decimals, 10),
      }))
      .sort((a, b) => b.streamCount - a.streamCount) // Sort by stream count desc
      .slice(0, 10); // Take top 10

    console.log(`Top assets:`, topAssets.slice(0, 3)); // Log first 3 for debugging

    return topAssets;
  } catch (error) {
    console.error("Error fetching top assets by stream count:", error);
    throw error;
  }
}
