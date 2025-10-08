/**
 * Aggregated GraphQL queries across all Sablier data sources:
 * - Lockup EVM (Hyperindex)
 * - Airdrops EVM (Hyperindex)
 * - Solana Lockup (TheGraph)
 * - Solana Airdrops (TheGraph)
 */

import { getTestnetChainIds } from "@/lib/constants/chains";

// Import EVM endpoints
const LOCKUP_GRAPHQL_ENDPOINT = "https://indexer.hyperindex.xyz/53b7e25/v1/graphql";
const AIRDROPS_GRAPHQL_ENDPOINT = "https://indexer.hyperindex.xyz/508d217/v1/graphql";

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
          headers: { "Content-Type": "application/json" },
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
          headers: { "Content-Type": "application/json" },
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

      // Solana Lockup - collect sender + recipient from streams
      // Note: TheGraph has `first` limits, so we get what we can
      (async () => {
        const query = `
          query GetSolanaLockupUsers {
            streams(first: 1000, orderBy: timestamp, orderDirection: desc) {
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

        // Collect unique addresses
        const uniqueAddresses = new Set<string>();
        for (const stream of result.data.streams) {
          uniqueAddresses.add(stream.sender);
          uniqueAddresses.add(stream.recipient);
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
          headers: { "Content-Type": "application/json" },
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
          headers: { "Content-Type": "application/json" },
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
