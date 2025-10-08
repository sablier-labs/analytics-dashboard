import { getTestnetChainIds } from "@/lib/constants/chains";

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

export interface MonthlyStreamCreation {
  month: string;
  count: number;
}

export interface StreamDurationStats {
  median: number;
  average: number;
  min: number;
  max: number;
}

export interface StreamProperties {
  cancelable: number;
  transferable: number;
  both: number;
  total: number;
}

export interface StreamCategoryDistribution {
  linear: number;
  dynamic: number;
  tranched: number;
  total: number;
}

export interface ActiveVsCompletedStreams {
  active: number;
  completed: number;
  total: number;
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
  const testnetChainIds = getTestnetChainIds();

  // Count distinct users using aggregate with distinct on from field
  const query = `
    query GetTotalUsers {
      Action_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
        }
      ) {
        aggregate {
          count(columns: from, distinct: true)
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

    const result: GraphQLResponse<{ Action_aggregate: { aggregate: { count: number } } }> =
      await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.Action_aggregate.aggregate.count;
  } catch (error) {
    console.error("Error fetching total users:", error);
    throw error;
  }
}

export async function fetchTotalTransactions(): Promise<number> {
  const testnetChainIds = getTestnetChainIds();
  const query = `
    query GetTotalTransactions {
      Action_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
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

    const result: GraphQLResponse<{ Action_aggregate: { aggregate: { count: number } } }> =
      await response.json();

    if (result.errors) {
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.Action_aggregate.aggregate.count;
  } catch (error) {
    console.error("Error fetching total transactions:", error);
    throw error;
  }
}

export async function fetchTimeBasedUserCounts(): Promise<TimeBasedUserCounts> {
  const testnetChainIds = getTestnetChainIds();
  // Calculate timestamps for different periods as Unix timestamp strings
  const now = Date.now();
  const thirtyDaysAgo = Math.floor((now - 30 * 24 * 60 * 60 * 1000) / 1000).toString();
  const ninetyDaysAgo = Math.floor((now - 90 * 24 * 60 * 60 * 1000) / 1000).toString();
  const oneHundredEightyDaysAgo = Math.floor((now - 180 * 24 * 60 * 60 * 1000) / 1000).toString();
  const oneYearAgo = Math.floor((now - 365 * 24 * 60 * 60 * 1000) / 1000).toString();

  const query = `
    query GetTimeBasedUserCounts {
      past30Days: Action_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          timestamp: { _gte: "${thirtyDaysAgo}" }
        }
      ) {
        aggregate {
          count(columns: from, distinct: true)
        }
      }
      past90Days: Action_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          timestamp: { _gte: "${ninetyDaysAgo}" }
        }
      ) {
        aggregate {
          count(columns: from, distinct: true)
        }
      }
      past180Days: Action_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          timestamp: { _gte: "${oneHundredEightyDaysAgo}" }
        }
      ) {
        aggregate {
          count(columns: from, distinct: true)
        }
      }
      pastYear: Action_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          timestamp: { _gte: "${oneYearAgo}" }
        }
      ) {
        aggregate {
          count(columns: from, distinct: true)
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
  const testnetChainIds = getTestnetChainIds();
  // Calculate timestamps for different periods as Unix timestamp strings
  const now = Date.now();
  const thirtyDaysAgo = Math.floor((now - 30 * 24 * 60 * 60 * 1000) / 1000).toString();
  const ninetyDaysAgo = Math.floor((now - 90 * 24 * 60 * 60 * 1000) / 1000).toString();
  const oneHundredEightyDaysAgo = Math.floor((now - 180 * 24 * 60 * 60 * 1000) / 1000).toString();
  const oneYearAgo = Math.floor((now - 365 * 24 * 60 * 60 * 1000) / 1000).toString();

  const query = `
    query GetTimeBasedTransactionCounts {
      past30Days: Action_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          timestamp: { _gte: "${thirtyDaysAgo}" }
        }
      ) {
        aggregate {
          count
        }
      }
      past90Days: Action_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          timestamp: { _gte: "${ninetyDaysAgo}" }
        }
      ) {
        aggregate {
          count
        }
      }
      past180Days: Action_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          timestamp: { _gte: "${oneHundredEightyDaysAgo}" }
        }
      ) {
        aggregate {
          count
        }
      }
      pastYear: Action_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          timestamp: { _gte: "${oneYearAgo}" }
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
  const now = Date.now();
  const timeRanges: Array<{ label: string; timestamp: string }> = [];

  // Start from when Sablier began (July 1, 2023)
  const startDate = new Date("2023-07-01");
  const current = new Date(startDate);

  // Generate monthly timestamps from start date to now
  while (current.getTime() <= now) {
    // Use end of month instead of beginning to capture all users in that month
    const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999);
    const timestamp = Math.floor(endOfMonth.getTime() / 1000).toString();
    const label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    timeRanges.push({ label, timestamp });

    // Move to first day of next month
    current.setMonth(current.getMonth() + 1);
  }

  const queries = timeRanges.map((range, index) => {
    return `
      month_${index}: Action_aggregate(
        where: {
          timestamp: { _lte: "${range.timestamp}" }
        }
      ) {
        aggregate {
          count(columns: from, distinct: true)
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
  const testnetChainIds = getTestnetChainIds();
  // First, get all unique chain IDs (excluding testnets)
  const chainQuery = `
    query GetUniqueChains {
      Action(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
        }
        distinct_on: chainId
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

    const chainResult: GraphQLResponse<{ Action: Array<{ chainId: string }> }> =
      await chainResponse.json();

    if (chainResult.errors) {
      throw new Error(`GraphQL error: ${chainResult.errors[0]?.message}`);
    }

    const uniqueChains = chainResult.data.Action.map((a) => a.chainId);

    // Now create aggregate queries to count distinct users for each chain
    const chainQueries = uniqueChains.map((chainId, index) => {
      return `
        chain_${index}: Action_aggregate(
          where: {
            chainId: { _eq: "${chainId}" }
          }
        ) {
          aggregate {
            count(columns: from, distinct: true)
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
  const now = Date.now();
  const timeRanges: Array<{ label: string; timestamp: string }> = [];

  const startDate = new Date("2023-07-01");
  const current = new Date(startDate);

  while (current.getTime() <= now) {
    const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999);
    const timestamp = Math.floor(endOfMonth.getTime() / 1000).toString();
    const label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    timeRanges.push({ label, timestamp });

    current.setMonth(current.getMonth() + 1);
  }

  const queries = timeRanges.map((range, index) => {
    return `
      month_${index}: Action_aggregate(
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
  const _now = Date.now();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  lastMonth.setDate(1);
  lastMonth.setHours(0, 0, 0, 0);

  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  twoMonthsAgo.setDate(1);
  twoMonthsAgo.setHours(0, 0, 0, 0);

  const lastMonthTimestamp = Math.floor(lastMonth.getTime() / 1000).toString();
  const twoMonthsAgoTimestamp = Math.floor(twoMonthsAgo.getTime() / 1000).toString();

  const query = `
    query GetGrowthRateMetrics {
      currentMonthUsers: Action_aggregate(
        where: {
          timestamp: { _gte: "${lastMonthTimestamp}" }
        }
      ) {
        aggregate {
          count(columns: from, distinct: true)
        }
      }
      previousMonthUsers: Action_aggregate(
        where: {
          timestamp: { _gte: "${twoMonthsAgoTimestamp}", _lt: "${lastMonthTimestamp}" }
        }
      ) {
        aggregate {
          count(columns: from, distinct: true)
        }
      }
      currentMonthTransactions: Action_aggregate(
        where: {
          timestamp: { _gte: "${lastMonthTimestamp}" }
        }
      ) {
        aggregate {
          count
        }
      }
      previousMonthTransactions: Action_aggregate(
        where: {
          timestamp: { _gte: "${twoMonthsAgoTimestamp}", _lt: "${lastMonthTimestamp}" }
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
  // Use aggregation to get accurate stream counts without array limits
  const query = `
    query GetTopAssets {
      Asset {
        id
        address
        symbol
        name
        chainId
        decimals
        streams_aggregate {
          aggregate {
            count
          }
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
        streams_aggregate: {
          aggregate: {
            count: number;
          };
        };
      }>;
    }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    // Convert to TopAsset format and sort by stream count
    const topAssets = result.data.Asset.map((asset) => ({
      address: asset.address,
      assetId: asset.id,
      chainId: asset.chainId,
      decimals: parseInt(asset.decimals, 10),
      name: asset.name,
      streamCount: asset.streams_aggregate.aggregate.count,
      symbol: asset.symbol,
    }))
      .sort((a, b) => b.streamCount - a.streamCount) // Sort by stream count desc
      .slice(0, 10); // Take top 10

    return topAssets;
  } catch (error) {
    console.error("Error fetching top assets by stream count:", error);
    throw error;
  }
}

export async function fetchMonthlyStreamCreation(): Promise<MonthlyStreamCreation[]> {
  // Generate last 12 months of time ranges
  const timeRanges: Array<{ label: string; startTimestamp: string; endTimestamp: string }> = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const current = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
    const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59);

    const label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    const startTimestamp = Math.floor(startOfMonth.getTime() / 1000).toString();
    const endTimestamp = Math.floor(endOfMonth.getTime() / 1000).toString();

    timeRanges.push({ endTimestamp, label, startTimestamp });
  }

  // Create aggregation queries for each month
  const queries = timeRanges.map((range, index) => {
    return `
      month_${index}: Stream_aggregate(
        where: {
          timestamp: { _gte: "${range.startTimestamp}", _lte: "${range.endTimestamp}" }
        }
      ) {
        aggregate {
          count
        }
      }
    `;
  });

  const query = `
    query GetMonthlyStreamCreation {
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
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const monthlyData: MonthlyStreamCreation[] = [];

    timeRanges.forEach((range, index) => {
      const key = `month_${index}`;
      const count = result.data[key]?.aggregate?.count || 0;
      monthlyData.push({
        count,
        month: range.label,
      });
    });

    return monthlyData;
  } catch (error) {
    console.error("Error fetching monthly stream creation:", error);
    throw error;
  }
}

export async function fetchStreamDurationStats(): Promise<StreamDurationStats> {
  // Filter out streams shorter than 24 hours (86400 seconds)
  const minDuration = "86400"; // 24 hours in seconds

  const query = `
    query GetStreamDurationStats {
      Stream_aggregate(where: { duration: { _gte: "${minDuration}" } }) {
        aggregate {
          avg {
            duration
          }
          min {
            duration
          }
          max {
            duration
          }
          count
        }
      }
      # Get total count for median calculation
      totalCount: Stream_aggregate(where: { duration: { _gte: "${minDuration}" } }) {
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
      Stream_aggregate: {
        aggregate: {
          avg: { duration: string };
          min: { duration: string };
          max: { duration: string };
          count: number;
        };
      };
      totalCount: {
        aggregate: {
          count: number;
        };
      };
    }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const { aggregate } = result.data.Stream_aggregate;
    const totalCount = result.data.totalCount.aggregate.count;

    // Calculate median position
    const medianPosition = Math.floor(totalCount / 2);

    // Make another query to get the median value
    const medianQuery = `
      query GetMedianValue {
        Stream(
          where: { duration: { _gte: "${minDuration}" } }
          order_by: { duration: asc }
          limit: 1
          offset: ${medianPosition}
        ) {
          duration
        }
      }
    `;

    const medianResponse = await fetch(GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query: medianQuery }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!medianResponse.ok) {
      throw new Error(`HTTP error! status: ${medianResponse.status}`);
    }

    const medianResult: GraphQLResponse<{
      Stream: Array<{ duration: string }>;
    }> = await medianResponse.json();

    if (medianResult.errors) {
      console.error("GraphQL errors:", medianResult.errors);
      throw new Error(`GraphQL error: ${medianResult.errors[0]?.message}`);
    }

    const median = medianResult.data.Stream[0]
      ? parseInt(medianResult.data.Stream[0].duration, 10)
      : 0;

    const stats: StreamDurationStats = {
      average: parseFloat(aggregate.avg.duration || "0"),
      max: parseInt(aggregate.max.duration || "0", 10),
      median,
      min: parseInt(aggregate.min.duration || "0", 10),
    };

    return stats;
  } catch (error) {
    console.error("Error fetching stream duration stats:", error);
    throw error;
  }
}

export async function fetchStreamProperties(): Promise<StreamProperties> {
  const query = `
    query GetStreamProperties {
      totalStreams: Stream_aggregate {
        aggregate {
          count
        }
      }
      cancelableStreams: Stream_aggregate(where: { cancelable: { _eq: true } }) {
        aggregate {
          count
        }
      }
      transferableStreams: Stream_aggregate(where: { transferable: { _eq: true } }) {
        aggregate {
          count
        }
      }
      bothProperties: Stream_aggregate(where: { 
        cancelable: { _eq: true }, 
        transferable: { _eq: true } 
      }) {
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
      totalStreams: { aggregate: { count: number } };
      cancelableStreams: { aggregate: { count: number } };
      transferableStreams: { aggregate: { count: number } };
      bothProperties: { aggregate: { count: number } };
    }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const { totalStreams, cancelableStreams, transferableStreams, bothProperties } = result.data;

    const properties: StreamProperties = {
      both: bothProperties.aggregate.count,
      cancelable: cancelableStreams.aggregate.count,
      total: totalStreams.aggregate.count,
      transferable: transferableStreams.aggregate.count,
    };

    return properties;
  } catch (error) {
    console.error("Error fetching stream properties:", error);
    throw error;
  }
}

export async function fetchStreamCategoryDistribution(): Promise<StreamCategoryDistribution> {
  const query = `
    query GetStreamCategoryDistribution {
      totalStreams: Stream_aggregate {
        aggregate {
          count
        }
      }
      linearStreams: Stream_aggregate(where: { category: { _eq: "LockupLinear" } }) {
        aggregate {
          count
        }
      }
      dynamicStreams: Stream_aggregate(where: { category: { _eq: "LockupDynamic" } }) {
        aggregate {
          count
        }
      }
      tranchedStreams: Stream_aggregate(where: { category: { _eq: "LockupTranched" } }) {
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
      totalStreams: { aggregate: { count: number } };
      linearStreams: { aggregate: { count: number } };
      dynamicStreams: { aggregate: { count: number } };
      tranchedStreams: { aggregate: { count: number } };
    }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const { totalStreams, linearStreams, dynamicStreams, tranchedStreams } = result.data;

    const distribution: StreamCategoryDistribution = {
      dynamic: dynamicStreams.aggregate.count,
      linear: linearStreams.aggregate.count,
      total: totalStreams.aggregate.count,
      tranched: tranchedStreams.aggregate.count,
    };

    return distribution;
  } catch (error) {
    console.error("Error fetching stream category distribution:", error);
    throw error;
  }
}

export async function fetchTotalVestingStreams(): Promise<number> {
  const query = `
    query GetTotalVestingStreams {
      totalStreams: Stream_aggregate {
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
      totalStreams: { aggregate: { count: number } };
    }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const totalStreams = result.data.totalStreams.aggregate.count;

    return totalStreams;
  } catch (error) {
    console.error("Error fetching total vesting streams:", error);
    throw error;
  }
}

export async function fetchActiveVsCompletedStreams(): Promise<ActiveVsCompletedStreams> {
  // Get current timestamp for determining active vs completed
  const currentTimestamp = Math.floor(Date.now() / 1000).toString();

  const query = `
    query GetActiveVsCompletedStreams {
      totalStreams: Stream_aggregate {
        aggregate {
          count
        }
      }
      activeStreams: Stream_aggregate(where: { endTime: { _gt: "${currentTimestamp}" } }) {
        aggregate {
          count
        }
      }
      completedStreams: Stream_aggregate(where: { endTime: { _lte: "${currentTimestamp}" } }) {
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
      totalStreams: { aggregate: { count: number } };
      activeStreams: { aggregate: { count: number } };
      completedStreams: { aggregate: { count: number } };
    }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const { totalStreams, activeStreams, completedStreams } = result.data;

    const streams: ActiveVsCompletedStreams = {
      active: activeStreams.aggregate.count,
      completed: completedStreams.aggregate.count,
      total: totalStreams.aggregate.count,
    };

    return streams;
  } catch (error) {
    console.error("Error fetching active vs completed streams:", error);
    throw error;
  }
}

// New interfaces for additional metrics
export interface StablecoinStream {
  id: string;
  tokenId: string;
  depositAmount: string;
  sender: string;
  recipient: string;
  chainId: string;
  timestamp: string;
  contract: string;
  startTime: string;
  endTime: string;
  duration: string;
  asset: {
    symbol: string;
    name: string;
    decimals: string;
  };
}

export interface Activity24Hours {
  streamsCreated: number;
  totalTransactions: number;
}

export async function fetchLargestStablecoinStreams(): Promise<StablecoinStream[]> {
  const testnetChainIds = getTestnetChainIds();
  const query = `
    query GetLargestStablecoinStreams {
      Stream(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          asset: {
            symbol: {
              _in: ["USDC", "USDC.e", "USDT", "DAI", "BUSD", "TUSD", "USDP", "GUSD", "FRAX", "LUSD", "USDD"]
            }
          }
        }
        order_by: { depositAmount: desc }
        limit: 500
      ) {
        id
        tokenId
        depositAmount
        sender
        recipient
        chainId
        timestamp
        contract
        startTime
        endTime
        duration
        asset {
          symbol
          name
          decimals
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

    const result: GraphQLResponse<{ Stream: StablecoinStream[] }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.Stream;
  } catch (error) {
    console.error("Error fetching largest stablecoin streams:", error);
    throw error;
  }
}

export async function fetch24HourMetrics(): Promise<Activity24Hours> {
  const testnetChainIds = getTestnetChainIds();
  // Calculate timestamp for 24 hours ago
  const twentyFourHoursAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000).toString();

  const query = `
    query Get24HourMetrics {
      streams24h: Stream_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          timestamp: { _gte: "${twentyFourHoursAgo}" }
        }
      ) {
        aggregate {
          count
        }
      }
      transactions24h: Action_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          timestamp: { _gte: "${twentyFourHoursAgo}" }
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
      streams24h: { aggregate: { count: number } };
      transactions24h: { aggregate: { count: number } };
    }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const metrics: Activity24Hours = {
      streamsCreated: result.data.streams24h.aggregate.count,
      totalTransactions: result.data.transactions24h.aggregate.count,
    };

    return metrics;
  } catch (error) {
    console.error("Error fetching 24-hour metrics:", error);
    throw error;
  }
}
