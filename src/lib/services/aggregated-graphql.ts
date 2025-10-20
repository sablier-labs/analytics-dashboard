/**
 * Aggregated GraphQL queries across all Sablier data sources:
 * - Lockup EVM (Hyperindex)
 * - Airdrops EVM (Hyperindex)
 * - Solana Lockup (TheGraph)
 * - Solana Airdrops (TheGraph)
 */

import { getTestnetChainIds } from "@/lib/constants/chains";
import { fetchSolanaClaims24h, fetchSolanaTotalClaims } from "./solana-airdrops-graphql";
import { fetchSolanaStreams24h, fetchSolanaTransactions } from "./solana-lockup-graphql";

// Import EVM endpoints
const LOCKUP_GRAPHQL_ENDPOINT = "https://indexer.hyperindex.xyz/53b7e25/v1/graphql";
const AIRDROPS_GRAPHQL_ENDPOINT = "https://indexer.hyperindex.xyz/508d217/v1/graphql";
const BEARER_TOKEN = process.env.HYPERSYNC_BEARER_TOKEN;

// Helper to create headers with bearer token
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (BEARER_TOKEN) {
    headers.Authorization = `Bearer ${BEARER_TOKEN}`;
  }
  return headers;
}

// Import Solana endpoints
const SOLANA_LOCKUP_GRAPHQL_ENDPOINT =
  "https://graph.sablier.io/lockup-mainnet/subgraphs/name/sablier-lockup-solana-mainnet";
const _SOLANA_AIRDROPS_GRAPHQL_ENDPOINT =
  "https://graph.sablier.io/airdrops-mainnet/subgraphs/name/sablier-airdrops-solana-mainnet";

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

/**
 * Fetch total unique users across all 4 data sources
 * Combines distinct addresses from:
 * - Lockup EVM Action.from
 * - Airdrops EVM Action.from
 * - Solana Lockup streams (sender + recipient)
 * - Solana Airdrops campaigns (admin + claimers would need schema check)
 */
export async function fetchAggregatedTotalUsers(): Promise<number> {
  const testnetChainIds = getTestnetChainIds();

  try {
    // Fetch from all 4 sources in parallel
    const [lockupEVMCount, airdropsEVMCount, solanaLockupCount] = await Promise.all([
      // Lockup EVM - distinct users from Action.from
      (async () => {
        const query = `
          query GetLockupEVMUsers {
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

        const response = await fetch(LOCKUP_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`Lockup EVM HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<{
          Action_aggregate: { aggregate: { count: number } };
        }> = await response.json();

        if (result.errors)
          throw new Error(`Lockup EVM GraphQL error: ${result.errors[0]?.message}`);

        return result.data.Action_aggregate.aggregate.count;
      })(),

      // Airdrops EVM - distinct users from Action.from
      (async () => {
        const query = `
          query GetAirdropsEVMUsers {
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

        const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`Airdrops EVM HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<{
          Action_aggregate: { aggregate: { count: number } };
        }> = await response.json();

        if (result.errors)
          throw new Error(`Airdrops EVM GraphQL error: ${result.errors[0]?.message}`);

        return result.data.Action_aggregate.aggregate.count;
      })(),

      // Solana Lockup - collect sender + recipient from streams (with pagination)
      (async () => {
        const uniqueAddresses = new Set<string>();
        let solanaSkip = 0;
        const solanaFirst = 1000;
        let solanaHasMore = true;

        while (solanaHasMore) {
          const query = `
            query GetSolanaLockupUsers {
              streams(first: ${solanaFirst}, skip: ${solanaSkip}) {
                sender
                recipient
              }
            }
          `;

          const response = await fetch(SOLANA_LOCKUP_GRAPHQL_ENDPOINT, {
            body: JSON.stringify({ query }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });

          if (!response.ok) throw new Error(`Solana Lockup HTTP error! status: ${response.status}`);

          const result: GraphQLResponse<{
            streams: Array<{ sender: string; recipient: string }>;
          }> = await response.json();

          if (result.errors)
            throw new Error(`Solana Lockup GraphQL error: ${result.errors[0]?.message}`);

          const solanaBatch = result.data.streams;

          for (const stream of solanaBatch) {
            uniqueAddresses.add(stream.sender);
            uniqueAddresses.add(stream.recipient);
          }

          solanaHasMore = solanaBatch.length === solanaFirst;
          solanaSkip += solanaFirst;
        }

        return uniqueAddresses.size;
      })(),
    ]);

    // Note: Solana Airdrops doesn't have a clear "user" concept in the current schema
    // It has campaigns and claims. We would need to query campaign.admin or claim recipients
    // Skipping for now unless schema provides addressA field like Lockup

    // Sum all counts
    // Important: These are already distinct within each source, but there might be
    // overlap between sources (same address used on EVM and Solana).
    // For true deduplication, we'd need to fetch all addresses and dedupe,
    // but that's not practical with large datasets.
    const total = lockupEVMCount + airdropsEVMCount + solanaLockupCount;

    console.log(`📊 Aggregated user counts:
      - Lockup EVM: ${lockupEVMCount}
      - Airdrops EVM: ${airdropsEVMCount}
      - Solana Lockup: ${solanaLockupCount}
      - Total (may include duplicates across sources): ${total}`);

    return total;
  } catch (error) {
    console.error("Error fetching aggregated total users:", error);
    throw error;
  }
}

/**
 * Fetch monthly user growth aggregated across all sources
 */
export async function fetchAggregatedMonthlyUserGrowth(): Promise<
  Array<{ month: string; cumulativeUsers: number; newUsers: number }>
> {
  const testnetChainIds = getTestnetChainIds();
  const now = new Date();
  const timeRanges: Array<{ label: string; timestamp: string }> = [];

  // Generate last 12 months
  for (let i = 11; i >= 0; i--) {
    const current = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999);
    const timestamp = Math.ceil(endOfMonth.getTime() / 1000).toString(); // Use ceil to include all milliseconds
    const label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    timeRanges.push({ label, timestamp });
  }

  try {
    // Fetch from both EVM sources in parallel
    const [lockupEVMData, airdropsEVMData] = await Promise.all([
      // Lockup EVM monthly cumulative counts
      (async () => {
        const queries = timeRanges.map((range, index) => {
          return `
            month_${index}: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _lte: "${range.timestamp}" }
              }
            ) {
              aggregate {
                count(columns: from, distinct: true)
              }
            }
          `;
        });

        const query = `query GetLockupEVMMonthlyGrowth { ${queries.join("\n")} }`;

        const response = await fetch(LOCKUP_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`Lockup EVM HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<Record<string, { aggregate: { count: number } }>> =
          await response.json();
        if (result.errors)
          throw new Error(`Lockup EVM GraphQL error: ${result.errors[0]?.message}`);

        return timeRanges.map((_, index) => result.data[`month_${index}`]?.aggregate?.count ?? 0);
      })(),

      // Airdrops EVM monthly cumulative counts
      (async () => {
        const queries = timeRanges.map((range, index) => {
          return `
            month_${index}: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _lte: "${range.timestamp}" }
              }
            ) {
              aggregate {
                count(columns: from, distinct: true)
              }
            }
          `;
        });

        const query = `query GetAirdropsEVMMonthlyGrowth { ${queries.join("\n")} }`;

        const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`Airdrops EVM HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<Record<string, { aggregate: { count: number } }>> =
          await response.json();
        if (result.errors)
          throw new Error(`Airdrops EVM GraphQL error: ${result.errors[0]?.message}`);

        return timeRanges.map((_, index) => result.data[`month_${index}`]?.aggregate?.count ?? 0);
      })(),
    ]);

    // Aggregate monthly data
    const monthlyData = timeRanges.map((range, index) => {
      const cumulativeUsers = lockupEVMData[index] + airdropsEVMData[index];
      const previousCumulative =
        index > 0 ? lockupEVMData[index - 1] + airdropsEVMData[index - 1] : 0;
      const newUsers = cumulativeUsers - previousCumulative;

      return {
        cumulativeUsers,
        month: range.label,
        newUsers: Math.max(0, newUsers),
      };
    });

    return monthlyData.filter((data) => data.cumulativeUsers > 0);
  } catch (error) {
    console.error("Error fetching aggregated monthly user growth:", error);
    throw error;
  }
}

/**
 * Fetch time-based user counts aggregated across all sources
 */
export async function fetchAggregatedTimeBasedUserCounts(): Promise<{
  past30Days: number;
  past90Days: number;
  past180Days: number;
  pastYear: number;
}> {
  const testnetChainIds = getTestnetChainIds();
  const now = Date.now();
  const thirtyDaysAgo = Math.floor((now - 30 * 24 * 60 * 60 * 1000) / 1000).toString();
  const ninetyDaysAgo = Math.floor((now - 90 * 24 * 60 * 60 * 1000) / 1000).toString();
  const oneHundredEightyDaysAgo = Math.floor((now - 180 * 24 * 60 * 60 * 1000) / 1000).toString();
  const oneYearAgo = Math.floor((now - 365 * 24 * 60 * 60 * 1000) / 1000).toString();

  try {
    const [lockupEVMCounts, airdropsEVMCounts] = await Promise.all([
      // Lockup EVM time-based counts
      (async () => {
        const query = `
          query GetLockupEVMTimeBasedUsers {
            past30Days: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${thirtyDaysAgo}" }
              }
            ) {
              aggregate { count(columns: from, distinct: true) }
            }
            past90Days: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${ninetyDaysAgo}" }
              }
            ) {
              aggregate { count(columns: from, distinct: true) }
            }
            past180Days: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${oneHundredEightyDaysAgo}" }
              }
            ) {
              aggregate { count(columns: from, distinct: true) }
            }
            pastYear: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${oneYearAgo}" }
              }
            ) {
              aggregate { count(columns: from, distinct: true) }
            }
          }
        `;

        const response = await fetch(LOCKUP_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<{
          past30Days: { aggregate: { count: number } };
          past90Days: { aggregate: { count: number } };
          past180Days: { aggregate: { count: number } };
          pastYear: { aggregate: { count: number } };
        }> = await response.json();

        if (result.errors) throw new Error(`GraphQL error: ${result.errors[0]?.message}`);

        return {
          past30Days: result.data.past30Days.aggregate.count,
          past90Days: result.data.past90Days.aggregate.count,
          past180Days: result.data.past180Days.aggregate.count,
          pastYear: result.data.pastYear.aggregate.count,
        };
      })(),

      // Airdrops EVM time-based counts
      (async () => {
        const query = `
          query GetAirdropsEVMTimeBasedUsers {
            past30Days: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${thirtyDaysAgo}" }
              }
            ) {
              aggregate { count(columns: from, distinct: true) }
            }
            past90Days: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${ninetyDaysAgo}" }
              }
            ) {
              aggregate { count(columns: from, distinct: true) }
            }
            past180Days: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${oneHundredEightyDaysAgo}" }
              }
            ) {
              aggregate { count(columns: from, distinct: true) }
            }
            pastYear: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${oneYearAgo}" }
              }
            ) {
              aggregate { count(columns: from, distinct: true) }
            }
          }
        `;

        const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<{
          past30Days: { aggregate: { count: number } };
          past90Days: { aggregate: { count: number } };
          past180Days: { aggregate: { count: number } };
          pastYear: { aggregate: { count: number } };
        }> = await response.json();

        if (result.errors) throw new Error(`GraphQL error: ${result.errors[0]?.message}`);

        return {
          past30Days: result.data.past30Days.aggregate.count,
          past90Days: result.data.past90Days.aggregate.count,
          past180Days: result.data.past180Days.aggregate.count,
          pastYear: result.data.pastYear.aggregate.count,
        };
      })(),
    ]);

    // Aggregate counts from all sources
    return {
      past30Days: lockupEVMCounts.past30Days + airdropsEVMCounts.past30Days,
      past90Days: lockupEVMCounts.past90Days + airdropsEVMCounts.past90Days,
      past180Days: lockupEVMCounts.past180Days + airdropsEVMCounts.past180Days,
      pastYear: lockupEVMCounts.pastYear + airdropsEVMCounts.pastYear,
    };
  } catch (error) {
    console.error("Error fetching aggregated time-based user counts:", error);
    throw error;
  }
}

/**
 * Fetch total transactions across all data sources
 */
export async function fetchAggregatedTotalTransactions(): Promise<number> {
  const testnetChainIds = getTestnetChainIds();

  try {
    const [lockupEVMCount, airdropsEVMCount, solanaCount] = await Promise.all([
      // Lockup EVM - total transaction count from Action
      (async () => {
        const query = `
          query GetLockupEVMTransactions {
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

        const response = await fetch(LOCKUP_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`Lockup EVM HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<{
          Action_aggregate: { aggregate: { count: number } };
        }> = await response.json();

        if (result.errors)
          throw new Error(`Lockup EVM GraphQL error: ${result.errors[0]?.message}`);

        return result.data.Action_aggregate.aggregate.count;
      })(),

      // Airdrops EVM - total transaction count from Action
      (async () => {
        const query = `
          query GetAirdropsEVMTransactions {
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

        const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`Airdrops EVM HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<{
          Action_aggregate: { aggregate: { count: number } };
        }> = await response.json();

        if (result.errors)
          throw new Error(`Airdrops EVM GraphQL error: ${result.errors[0]?.message}`);

        return result.data.Action_aggregate.aggregate.count;
      })(),

      fetchSolanaTransactions(),
    ]);

    const total = lockupEVMCount + airdropsEVMCount + solanaCount;

    console.log(`📊 Aggregated transaction counts:
      - Lockup EVM: ${lockupEVMCount}
      - Airdrops EVM: ${airdropsEVMCount}
      - Solana: ${solanaCount}
      - Total: ${total}`);

    return total;
  } catch (error) {
    console.error("Error fetching aggregated total transactions:", error);
    throw error;
  }
}

/**
 * Fetch total claims aggregated across all sources
 * Combines claim counts from:
 * - Airdrops EVM Action (category: "Claim")
 * - Solana Airdrops (if schema supports claims)
 */
export async function fetchAggregatedTotalClaims(): Promise<number> {
  const testnetChainIds = getTestnetChainIds();

  try {
    const [airdropsEVMCount, solanaCount] = await Promise.all([
      // Airdrops EVM - count of Claim actions
      (async () => {
        const query = `
          query GetAirdropsEVMClaims {
            Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                category: { _eq: "Claim" }
              }
            ) {
              aggregate {
                count
              }
            }
          }
        `;

        const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`Airdrops EVM HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<{
          Action_aggregate: { aggregate: { count: number } };
        }> = await response.json();

        if (result.errors)
          throw new Error(`Airdrops EVM GraphQL error: ${result.errors[0]?.message}`);

        return result.data.Action_aggregate.aggregate.count;
      })(),

      fetchSolanaTotalClaims(),
    ]);

    const total = airdropsEVMCount + solanaCount;

    console.log(`📊 Aggregated claim counts:
      - Airdrops EVM: ${airdropsEVMCount}
      - Solana: ${solanaCount}
      - Total: ${total}`);

    return total;
  } catch (error) {
    console.error("Error fetching aggregated total claims:", error);
    throw error;
  }
}

/**
 * Fetch time-based transaction counts aggregated across all sources
 */
export async function fetchAggregatedTimeBasedTransactionCounts(): Promise<{
  past30Days: number;
  past90Days: number;
  past180Days: number;
  pastYear: number;
}> {
  const testnetChainIds = getTestnetChainIds();
  const now = Date.now();
  const thirtyDaysAgo = Math.floor((now - 30 * 24 * 60 * 60 * 1000) / 1000).toString();
  const ninetyDaysAgo = Math.floor((now - 90 * 24 * 60 * 60 * 1000) / 1000).toString();
  const oneHundredEightyDaysAgo = Math.floor((now - 180 * 24 * 60 * 60 * 1000) / 1000).toString();
  const oneYearAgo = Math.floor((now - 365 * 24 * 60 * 60 * 1000) / 1000).toString();

  try {
    const [lockupEVMCounts, airdropsEVMCounts] = await Promise.all([
      // Lockup EVM time-based transaction counts
      (async () => {
        const query = `
          query GetLockupEVMTimeBasedTransactions {
            past30Days: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${thirtyDaysAgo}" }
              }
            ) {
              aggregate { count }
            }
            past90Days: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${ninetyDaysAgo}" }
              }
            ) {
              aggregate { count }
            }
            past180Days: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${oneHundredEightyDaysAgo}" }
              }
            ) {
              aggregate { count }
            }
            pastYear: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${oneYearAgo}" }
              }
            ) {
              aggregate { count }
            }
          }
        `;

        const response = await fetch(LOCKUP_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<{
          past30Days: { aggregate: { count: number } };
          past90Days: { aggregate: { count: number } };
          past180Days: { aggregate: { count: number } };
          pastYear: { aggregate: { count: number } };
        }> = await response.json();

        if (result.errors) throw new Error(`GraphQL error: ${result.errors[0]?.message}`);

        return {
          past30Days: result.data.past30Days.aggregate.count,
          past90Days: result.data.past90Days.aggregate.count,
          past180Days: result.data.past180Days.aggregate.count,
          pastYear: result.data.pastYear.aggregate.count,
        };
      })(),

      // Airdrops EVM time-based transaction counts
      (async () => {
        const query = `
          query GetAirdropsEVMTimeBasedTransactions {
            past30Days: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${thirtyDaysAgo}" }
              }
            ) {
              aggregate { count }
            }
            past90Days: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${ninetyDaysAgo}" }
              }
            ) {
              aggregate { count }
            }
            past180Days: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${oneHundredEightyDaysAgo}" }
              }
            ) {
              aggregate { count }
            }
            pastYear: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${oneYearAgo}" }
              }
            ) {
              aggregate { count }
            }
          }
        `;

        const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<{
          past30Days: { aggregate: { count: number } };
          past90Days: { aggregate: { count: number } };
          past180Days: { aggregate: { count: number } };
          pastYear: { aggregate: { count: number } };
        }> = await response.json();

        if (result.errors) throw new Error(`GraphQL error: ${result.errors[0]?.message}`);

        return {
          past30Days: result.data.past30Days.aggregate.count,
          past90Days: result.data.past90Days.aggregate.count,
          past180Days: result.data.past180Days.aggregate.count,
          pastYear: result.data.pastYear.aggregate.count,
        };
      })(),
    ]);

    // Aggregate counts from all sources
    return {
      past30Days: lockupEVMCounts.past30Days + airdropsEVMCounts.past30Days,
      past90Days: lockupEVMCounts.past90Days + airdropsEVMCounts.past90Days,
      past180Days: lockupEVMCounts.past180Days + airdropsEVMCounts.past180Days,
      pastYear: lockupEVMCounts.pastYear + airdropsEVMCounts.pastYear,
    };
  } catch (error) {
    console.error("Error fetching aggregated time-based transaction counts:", error);
    throw error;
  }
}

/**
 * Fetch monthly transaction growth aggregated across all sources
 */
export async function fetchAggregatedMonthlyTransactionGrowth(): Promise<
  Array<{ month: string; cumulativeTransactions: number; newTransactions: number }>
> {
  const testnetChainIds = getTestnetChainIds();
  const now = new Date();
  const timeRanges: Array<{ label: string; timestamp: string }> = [];

  // Generate last 12 months
  for (let i = 11; i >= 0; i--) {
    const current = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999);
    const timestamp = Math.ceil(endOfMonth.getTime() / 1000).toString(); // Use ceil to include all milliseconds
    const label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    timeRanges.push({ label, timestamp });
  }

  try {
    // Fetch from both EVM sources in parallel
    const [lockupEVMData, airdropsEVMData] = await Promise.all([
      // Lockup EVM monthly cumulative transaction counts
      (async () => {
        const queries = timeRanges.map((range, index) => {
          return `
            month_${index}: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _lte: "${range.timestamp}" }
              }
            ) {
              aggregate {
                count
              }
            }
          `;
        });

        const query = `query GetLockupEVMMonthlyTransactionGrowth { ${queries.join("\n")} }`;

        const response = await fetch(LOCKUP_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`Lockup EVM HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<Record<string, { aggregate: { count: number } }>> =
          await response.json();
        if (result.errors)
          throw new Error(`Lockup EVM GraphQL error: ${result.errors[0]?.message}`);

        return timeRanges.map((_, index) => result.data[`month_${index}`]?.aggregate?.count ?? 0);
      })(),

      // Airdrops EVM monthly cumulative transaction counts
      (async () => {
        const queries = timeRanges.map((range, index) => {
          return `
            month_${index}: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _lte: "${range.timestamp}" }
              }
            ) {
              aggregate {
                count
              }
            }
          `;
        });

        const query = `query GetAirdropsEVMMonthlyTransactionGrowth { ${queries.join("\n")} }`;

        const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`Airdrops EVM HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<Record<string, { aggregate: { count: number } }>> =
          await response.json();
        if (result.errors)
          throw new Error(`Airdrops EVM GraphQL error: ${result.errors[0]?.message}`);

        return timeRanges.map((_, index) => result.data[`month_${index}`]?.aggregate?.count ?? 0);
      })(),
    ]);

    // Aggregate monthly data
    const monthlyData = timeRanges.map((range, index) => {
      const cumulativeTransactions = lockupEVMData[index] + airdropsEVMData[index];
      const previousCumulative =
        index > 0 ? lockupEVMData[index - 1] + airdropsEVMData[index - 1] : 0;
      const newTransactions = cumulativeTransactions - previousCumulative;

      return {
        cumulativeTransactions,
        month: range.label,
        newTransactions: Math.max(0, newTransactions),
      };
    });

    return monthlyData.filter((data) => data.cumulativeTransactions > 0);
  } catch (error) {
    console.error("Error fetching aggregated monthly transaction growth:", error);
    throw error;
  }
}

/**
 * Fetch 24-hour metrics aggregated across all sources
 */
export async function fetchAggregated24HourMetrics(): Promise<{
  streamsCreated: number;
  totalTransactions: number;
  claimsCreated: number;
}> {
  const testnetChainIds = getTestnetChainIds();
  const twentyFourHoursAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000).toString();

  try {
    const [lockupEVMMetrics, airdropsEVMMetrics, solanaStreams24h] = await Promise.all([
      // Lockup EVM 24-hour metrics
      (async () => {
        const query = `
          query GetLockupEVM24HourMetrics {
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

        const response = await fetch(LOCKUP_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`Lockup EVM HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<{
          streams24h: { aggregate: { count: number } };
          transactions24h: { aggregate: { count: number } };
        }> = await response.json();

        if (result.errors)
          throw new Error(`Lockup EVM GraphQL error: ${result.errors[0]?.message}`);

        return {
          streamsCreated: result.data.streams24h.aggregate.count,
          totalTransactions: result.data.transactions24h.aggregate.count,
        };
      })(),

      // Airdrops EVM 24-hour metrics (claims + transactions)
      (async () => {
        const query = `
          query GetAirdropsEVM24HourMetrics {
            claims24h: Action_aggregate(
              where: {
                chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
                timestamp: { _gte: "${twentyFourHoursAgo}" }
                category: { _eq: "Claim" }
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

        const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
          body: JSON.stringify({ query }),
          headers: getHeaders(),
          method: "POST",
        });

        if (!response.ok) throw new Error(`Airdrops EVM HTTP error! status: ${response.status}`);

        const result: GraphQLResponse<{
          claims24h: { aggregate: { count: number } };
          transactions24h: { aggregate: { count: number } };
        }> = await response.json();

        if (result.errors)
          throw new Error(`Airdrops EVM GraphQL error: ${result.errors[0]?.message}`);

        return {
          claimsCreated: result.data.claims24h.aggregate.count,
          totalTransactions: result.data.transactions24h.aggregate.count,
        };
      })(),

      fetchSolanaStreams24h(),
    ]);

    const aggregatedMetrics = {
      claimsCreated: airdropsEVMMetrics.claimsCreated,
      streamsCreated: lockupEVMMetrics.streamsCreated + solanaStreams24h,
      totalTransactions: lockupEVMMetrics.totalTransactions + airdropsEVMMetrics.totalTransactions,
    };

    console.log(`📊 Aggregated 24h metrics:
      - Streams Created (EVM + Solana): ${aggregatedMetrics.streamsCreated}
      - Claims Created: ${aggregatedMetrics.claimsCreated}
      - Total Transactions: ${aggregatedMetrics.totalTransactions}`);

    return aggregatedMetrics;
  } catch (error) {
    console.error("Error fetching aggregated 24-hour metrics:", error);
    throw error;
  }
}
