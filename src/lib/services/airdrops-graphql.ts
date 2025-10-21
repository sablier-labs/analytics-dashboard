import { get } from "@vercel/edge-config";
import { getMainnetChainName, getTestnetChainIds } from "@/lib/constants/chains";
import { EVM_STABLECOINS } from "@/lib/constants/stablecoins";

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

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export interface TotalCampaignsResponse {
  Campaign_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface MonthlyCampaignCreation {
  month: string;
  count: number;
}

export interface RecipientParticipation {
  percentage: number;
  campaignCount: number;
}

export interface CampaignTimestamp {
  timestamp: string;
}

export interface ParticipationCampaign {
  claimedCount: string;
  totalRecipients: string;
}

export interface ParticipationResponse {
  Campaign: ParticipationCampaign[];
}

export interface MedianClaimersResponse {
  Campaign: Array<{
    claimedCount: string;
  }>;
}

export interface MedianClaimWindowResponse {
  Campaign: Array<{
    timestamp: string;
    expiration: string;
  }>;
}

export interface VestingDistribution {
  instant: number;
  vesting: number;
}

export interface VestingDistributionResponse {
  instant: {
    aggregate: {
      count: number;
    };
  };
  vesting: {
    aggregate: {
      count: number;
    };
  };
}

export interface ChainDistribution {
  chainId: string;
  chainName: string;
  count: number;
}

export interface ChainDistributionResponse {
  Campaign: Array<{
    chainId: string;
    count: number;
  }>;
}

export interface TopPerformingCampaign {
  id: string;
  chainId: string;
  chainName: string;
  claimedCount: string;
  totalRecipients: string;
  claimRate: number;
  timestamp: string;
  expiration: string;
  admin: string;
}

// Optimized campaign interface for Edge Config (only essential fields)
export interface OptimizedTopPerformingCampaign {
  id: string;
  chainId: string;
  chainName: string;
  claimedCount: string;
  totalRecipients: string;
  claimRate: number;
}

export interface CachedAirdropsData {
  totalCampaigns: number;
  monthlyCampaignCreation: MonthlyCampaignCreation[];
  monthlyClaimTrends: MonthlyClaimTrend[];
  recipientParticipation: RecipientParticipation;
  medianClaimers: number;
  medianClaimWindow: number;
  vestingDistribution: VestingDistribution;
  chainDistribution: ChainDistribution[];
  topPerformingCampaigns: OptimizedTopPerformingCampaign[];
  lastUpdated: string;
}

export interface TopPerformingCampaignsResponse {
  Campaign: Array<{
    id: string;
    chainId: string;
    claimedCount: string;
    totalRecipients: string;
    timestamp: string;
    expiration: string;
    admin: string;
  }>;
}

export interface MonthlyClaimTrend {
  month: string;
  count: number;
}

export interface ClaimActionResponse {
  Action: Array<{
    timestamp: string;
  }>;
}

export async function fetchTotalCampaigns(): Promise<number> {
  const testnetChainIds = getTestnetChainIds();

  const query = `
    query GetTotalCampaigns {
      Campaign_aggregate(
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
    const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: getHeaders(),
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<TotalCampaignsResponse> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    return result.data.Campaign_aggregate.aggregate.count;
  } catch (error) {
    console.error("Error fetching total campaigns:", error);
    throw error;
  }
}

export async function fetchMonthlyCampaignCreation(): Promise<MonthlyCampaignCreation[]> {
  const testnetChainIds = getTestnetChainIds();

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

  const query = `
    query GetMonthlyCampaignCreation {
      ${timeRanges
        .map(
          (range, index) => `
        month${index}: Campaign_aggregate(
          where: {
            chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
            timestamp: { _gte: "${range.startTimestamp}", _lte: "${range.endTimestamp}" }
          }
        ) {
          aggregate {
            count
          }
        }
      `,
        )
        .join("\n")}
    }
  `;

  try {
    const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: getHeaders(),
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<Record<string, { aggregate: { count: number } }>> =
      await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    // Convert response to monthly data
    const monthlyData: MonthlyCampaignCreation[] = timeRanges.map((range, index) => ({
      count: result.data[`month${index}`]?.aggregate?.count ?? 0,
      month: range.label,
    }));

    return monthlyData;
  } catch (error) {
    console.error("Error fetching monthly campaign creation:", error);
    throw error;
  }
}

export async function fetchRecipientParticipation(): Promise<RecipientParticipation> {
  const testnetChainIds = getTestnetChainIds();
  let totalClaimed = 0;
  let totalRecipients = 0;
  let campaignCount = 0;
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  try {
    // Paginate through all campaigns to ensure accurate participation rate
    while (hasMore) {
      const query = `
        query GetRecipientParticipation {
          Campaign(
            limit: ${limit}
            offset: ${offset}
            where: {
              chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
              claimedCount: { _gte: "10" }
            }
          ) {
            claimedCount
            totalRecipients
          }
        }
      `;

      const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: getHeaders(),
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<ParticipationResponse> = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.Campaign;

      // Accumulate totals for this batch
      for (const campaign of batch) {
        const claimedCount = parseInt(campaign.claimedCount, 10);
        if (Number.isNaN(claimedCount)) {
          throw new Error(`Invalid claimed count: ${campaign.claimedCount}`);
        }
        const recipientCount = parseInt(campaign.totalRecipients, 10);
        if (Number.isNaN(recipientCount)) {
          throw new Error(`Invalid total recipients: ${campaign.totalRecipients}`);
        }
        totalClaimed += claimedCount;
        totalRecipients += recipientCount;
        campaignCount++;
      }

      // Check if we need to fetch more
      hasMore = batch.length === limit;
      offset += limit;
    }

    const percentage = totalRecipients > 0 ? (totalClaimed / totalRecipients) * 100 : 0;

    return {
      campaignCount,
      percentage: Math.floor(percentage * 10) / 10, // Floor to 1 decimal place (never round up to 100%)
    };
  } catch (error) {
    console.error("Error fetching recipient participation:", error);
    throw error;
  }
}

export async function fetchMedianClaimers(): Promise<number> {
  const testnetChainIds = getTestnetChainIds();
  const allClaimerCounts: number[] = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  try {
    // Paginate through all campaigns to ensure accurate median calculation
    while (hasMore) {
      const query = `
        query GetMedianClaimers {
          Campaign(
            limit: ${limit}
            offset: ${offset}
            where: {
              chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
              claimedCount: { _gte: "10" }
            }
          ) {
            claimedCount
          }
        }
      `;

      const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: getHeaders(),
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<MedianClaimersResponse> = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.Campaign;

      // Collect claimers counts from this batch
      for (const campaign of batch) {
        const claimedCount = parseInt(campaign.claimedCount, 10);
        if (Number.isNaN(claimedCount)) {
          throw new Error(`Invalid claimed count: ${campaign.claimedCount}`);
        }
        allClaimerCounts.push(claimedCount);
      }

      // Check if we need to fetch more
      hasMore = batch.length === limit;
      offset += limit;
    }

    if (allClaimerCounts.length === 0) {
      console.log("No campaigns with ≥10 claims found");
      return 0;
    }

    // Sort all claimers counts for accurate median calculation
    const claimerCounts = allClaimerCounts.sort((a, b) => a - b);

    // Calculate median
    const median =
      claimerCounts.length % 2 === 0
        ? (claimerCounts[claimerCounts.length / 2 - 1] + claimerCounts[claimerCounts.length / 2]) /
          2
        : claimerCounts[Math.floor(claimerCounts.length / 2)];

    return Math.round(median);
  } catch (error) {
    console.error("Error fetching median claimers:", error);
    throw error;
  }
}

export async function fetchMedianClaimWindow(): Promise<number> {
  const testnetChainIds = getTestnetChainIds();
  const allClaimWindows: number[] = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  try {
    // Paginate through all campaigns to ensure accurate median calculation
    while (hasMore) {
      const query = `
        query GetMedianClaimWindow {
          Campaign(
            limit: ${limit}
            offset: ${offset}
            where: {
              chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
              _and: [
                { expiration: { _is_null: false } },
                { expiration: { _neq: "0" } }
              ]
            }
          ) {
            timestamp
            expiration
          }
        }
      `;

      const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: getHeaders(),
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<MedianClaimWindowResponse> = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.Campaign;

      // Calculate claim windows in days for this batch
      for (const campaign of batch) {
        const startTime = parseInt(campaign.timestamp, 10);
        if (Number.isNaN(startTime)) {
          throw new Error(`Invalid timestamp: ${campaign.timestamp}`);
        }
        const endTime = parseInt(campaign.expiration, 10);
        if (Number.isNaN(endTime)) {
          throw new Error(`Invalid expiration: ${campaign.expiration}`);
        }
        const durationSeconds = endTime - startTime;
        const durationDays = durationSeconds / (24 * 60 * 60); // Convert seconds to days
        if (durationDays > 0) {
          // Only include valid durations
          allClaimWindows.push(durationDays);
        }
      }

      // Check if we need to fetch more
      hasMore = batch.length === limit;
      offset += limit;
    }

    if (allClaimWindows.length === 0) {
      console.log("No campaigns with valid expiration dates found");
      return 0;
    }

    // Sort all claim windows for accurate median calculation
    const claimWindows = allClaimWindows.sort((a, b) => a - b);

    // Calculate median
    const median =
      claimWindows.length % 2 === 0
        ? (claimWindows[claimWindows.length / 2 - 1] + claimWindows[claimWindows.length / 2]) / 2
        : claimWindows[Math.floor(claimWindows.length / 2)];

    return Math.round(median);
  } catch (error) {
    console.error("Error fetching median claim window:", error);
    throw error;
  }
}

export async function fetchVestingDistribution(): Promise<VestingDistribution> {
  const testnetChainIds = getTestnetChainIds();

  const query = `
    query GetVestingDistribution {
      instant: Campaign_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          _or: [
            { lockup: { _is_null: true } },
            { lockup: { _eq: "" } }
          ]
        }
      ) {
        aggregate {
          count
        }
      }
      vesting: Campaign_aggregate(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          _and: [
            { lockup: { _is_null: false } },
            { lockup: { _neq: "" } }
          ]
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `;

  try {
    const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: getHeaders(),
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<VestingDistributionResponse> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const instantCount = result.data.instant.aggregate.count;
    const vestingCount = result.data.vesting.aggregate.count;

    return {
      instant: instantCount,
      vesting: vestingCount,
    };
  } catch (error) {
    console.error("Error fetching vesting distribution:", error);
    throw error;
  }
}

export async function fetchChainDistribution(): Promise<ChainDistribution[]> {
  const testnetChainIds = getTestnetChainIds();
  const chainCounts = new Map<string, number>();
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  try {
    // Paginate through all campaigns to ensure complete chain distribution
    while (hasMore) {
      const query = `
        query GetChainDistribution {
          Campaign(
            limit: ${limit}
            offset: ${offset}
            where: {
              chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
            }
          ) {
            chainId
          }
        }
      `;

      const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: getHeaders(),
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<{ Campaign: Array<{ chainId: string }> }> =
        await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.Campaign;

      // Aggregate campaigns by chainId for this batch
      for (const campaign of batch) {
        const currentCount = chainCounts.get(campaign.chainId) || 0;
        chainCounts.set(campaign.chainId, currentCount + 1);
      }

      // Check if we need to fetch more
      hasMore = batch.length === limit;
      offset += limit;
    }

    // Convert to array and add chain names
    const chainDistribution: ChainDistribution[] = Array.from(chainCounts.entries())
      .map(([chainId, count]) => ({
        chainId,
        chainName: getMainnetChainName(chainId),
        count,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return chainDistribution;
  } catch (error) {
    console.error("Error fetching chain distribution:", error);
    throw error;
  }
}

export async function fetchMonthlyClaimTrends(): Promise<MonthlyClaimTrend[]> {
  const testnetChainIds = getTestnetChainIds();

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

  const query = `
    query GetMonthlyClaimTrends {
      ${timeRanges
        .map(
          (range, index) => `
        month${index}: Action_aggregate(
          where: {
            chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
            timestamp: { _gte: "${range.startTimestamp}", _lte: "${range.endTimestamp}" }
            category: { _eq: "Claim" }
          }
        ) {
          aggregate {
            count
          }
        }
      `,
        )
        .join("\n")}
    }
  `;

  try {
    const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: getHeaders(),
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<Record<string, { aggregate: { count: number } }>> =
      await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    // Convert response to monthly data
    const monthlyData: MonthlyClaimTrend[] = timeRanges.map((range, index) => ({
      count: result.data[`month${index}`]?.aggregate?.count ?? 0,
      month: range.label,
    }));

    console.log("Monthly claim trends fetched:", monthlyData);
    return monthlyData;
  } catch (error) {
    console.error("Error fetching monthly claim trends:", error);
    throw error;
  }
}

export async function fetchTopPerformingCampaigns(): Promise<TopPerformingCampaign[]> {
  const testnetChainIds = getTestnetChainIds();
  const allCampaigns: Array<{
    id: string;
    chainId: string;
    claimedCount: string;
    totalRecipients: string;
    timestamp: string;
    expiration: string;
    admin: string;
  }> = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  try {
    // Fetch ALL campaigns first (with pagination)
    while (hasMore) {
      const query = `
        query GetTopPerformingCampaigns {
          Campaign(
            where: {
              chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
              claimedCount: { _gte: "10" }
            }
            limit: ${limit}
            offset: ${offset}
          ) {
            id
            chainId
            claimedCount
            totalRecipients
            timestamp
            expiration
            admin
          }
        }
      `;

      const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: getHeaders(),
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<TopPerformingCampaignsResponse> = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.Campaign;
      allCampaigns.push(...batch);

      hasMore = batch.length === limit;
      offset += limit;
    }

    // Now sort ALL campaigns by claimedCount and take top 10
    const sortedCampaigns = allCampaigns.sort((a, b) => {
      const claimedA = parseInt(a.claimedCount, 10);
      const claimedB = parseInt(b.claimedCount, 10);
      return claimedB - claimedA; // Descending order
    });

    const top10 = sortedCampaigns.slice(0, 10);

    // Transform to include chain names and claim rates
    const topCampaigns: TopPerformingCampaign[] = top10.map((campaign) => {
      const claimedCount = parseInt(campaign.claimedCount, 10);
      const totalRecipients = parseInt(campaign.totalRecipients, 10);
      const claimRate = totalRecipients > 0 ? (claimedCount / totalRecipients) * 100 : 0;

      return {
        admin: campaign.admin,
        chainId: campaign.chainId,
        chainName: getMainnetChainName(campaign.chainId),
        claimedCount: campaign.claimedCount,
        claimRate: Math.floor(claimRate * 10) / 10, // Floor to 1 decimal place (never round up to 100%)
        expiration: campaign.expiration,
        id: campaign.id,
        timestamp: campaign.timestamp,
        totalRecipients: campaign.totalRecipients,
      };
    });

    return topCampaigns;
  } catch (error) {
    console.error("Error fetching top performing campaigns:", error);
    throw error;
  }
}

// Cache functions following the same pattern as main analytics API

async function getCachedAirdropsData(): Promise<CachedAirdropsData | null> {
  try {
    const cached = await get<CachedAirdropsData>("airdrops");
    return cached || null;
  } catch (error) {
    console.error("Error reading from Edge Config for airdrops:", error);
    return null;
  }
}

export async function getCachedTotalCampaigns(): Promise<number> {
  const cached = await getCachedAirdropsData();
  if (cached?.totalCampaigns !== undefined) {
    return cached.totalCampaigns;
  }
  console.log("Cache miss - fetching total campaigns from GraphQL");
  return fetchTotalCampaigns();
}

export async function getCachedMonthlyCampaignCreation(): Promise<MonthlyCampaignCreation[]> {
  const cached = await getCachedAirdropsData();
  if (cached?.monthlyCampaignCreation) {
    return cached.monthlyCampaignCreation;
  }
  console.log("Cache miss - fetching monthly campaign creation from GraphQL");
  return fetchMonthlyCampaignCreation();
}

export async function getCachedMonthlyClaimTrends(): Promise<MonthlyClaimTrend[]> {
  const cached = await getCachedAirdropsData();
  if (cached?.monthlyClaimTrends) {
    return cached.monthlyClaimTrends;
  }
  console.log("Cache miss - fetching monthly claim trends from GraphQL");
  return fetchMonthlyClaimTrends();
}

export async function getCachedRecipientParticipation(): Promise<RecipientParticipation> {
  const cached = await getCachedAirdropsData();
  if (cached?.recipientParticipation) {
    return cached.recipientParticipation;
  }
  console.log("Cache miss - fetching recipient participation from GraphQL");
  return fetchRecipientParticipation();
}

export async function getCachedMedianClaimers(): Promise<number> {
  const cached = await getCachedAirdropsData();
  if (cached?.medianClaimers !== undefined) {
    return cached.medianClaimers;
  }
  console.log("Cache miss - fetching median claimers from GraphQL");
  return fetchMedianClaimers();
}

export async function getCachedMedianClaimWindow(): Promise<number> {
  const cached = await getCachedAirdropsData();
  if (cached?.medianClaimWindow !== undefined) {
    return cached.medianClaimWindow;
  }
  console.log("Cache miss - fetching median claim window from GraphQL");
  return fetchMedianClaimWindow();
}

export async function getCachedVestingDistribution(): Promise<VestingDistribution> {
  const cached = await getCachedAirdropsData();
  if (cached?.vestingDistribution) {
    return cached.vestingDistribution;
  }
  console.log("Cache miss - fetching vesting distribution from GraphQL");
  return fetchVestingDistribution();
}

export async function getCachedChainDistribution(): Promise<ChainDistribution[]> {
  const cached = await getCachedAirdropsData();
  if (cached?.chainDistribution) {
    return cached.chainDistribution;
  }
  console.log("Cache miss - fetching chain distribution from GraphQL");
  return fetchChainDistribution();
}

export async function getCachedTopPerformingCampaigns(): Promise<TopPerformingCampaign[]> {
  const cached = await getCachedAirdropsData();
  if (cached?.topPerformingCampaigns) {
    // Convert optimized campaigns back to full campaigns with default values for missing fields
    return cached.topPerformingCampaigns.map((campaign) => ({
      ...campaign,
      admin: "", // Default value - not needed for display
      expiration: "", // Default value - not needed for display
      timestamp: "", // Default value - not needed for display
    }));
  }
  console.log("Cache miss - fetching top performing campaigns from GraphQL");
  return fetchTopPerformingCampaigns();
}

export async function getAirdropsCacheInfo(): Promise<{
  isCached: boolean;
  lastUpdated?: string;
  age?: string;
}> {
  const cached = await getCachedAirdropsData();

  if (!cached?.lastUpdated) {
    return { isCached: false };
  }

  const lastUpdated = new Date(cached.lastUpdated);
  const now = new Date();
  const ageInHours = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60));

  return {
    age: ageInHours < 24 ? `${ageInHours} hours ago` : `${Math.floor(ageInHours / 24)} days ago`,
    isCached: true,
    lastUpdated: cached.lastUpdated,
  };
}

export interface StablecoinVolumeResponse {
  Campaign: Array<{
    id: string;
    chainId: string;
    aggregateAmount: string;
    asset: {
      decimals: string;
      symbol: string;
    };
  }>;
}

export async function fetchAirdropsStablecoinVolume(): Promise<number> {
  const testnetChainIds = getTestnetChainIds();
  let totalVolume = 0;
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetAirdropsStablecoinVolume {
          Campaign(
            limit: ${limit}
            offset: ${offset}
            where: {
              chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
              asset: {
                symbol: { _in: ${JSON.stringify(EVM_STABLECOINS)} }
              }
            }
          ) {
            id
            chainId
            aggregateAmount
            asset {
              decimals
              symbol
            }
          }
        }
      `;

      const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: getHeaders(),
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<StablecoinVolumeResponse> = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.Campaign;

      // Accumulate normalized volumes for this batch
      const batchVolume = batch.reduce((sum, campaign) => {
        const decimals = parseInt(campaign.asset.decimals, 10);
        if (Number.isNaN(decimals)) {
          throw new Error(`Invalid decimals value: ${campaign.asset.decimals}`);
        }
        const aggregateAmount = BigInt(campaign.aggregateAmount);
        const normalized = Number(aggregateAmount / BigInt(10) ** BigInt(decimals));

        // Debug suspicious values
        if (normalized > 10_000_000_000) {
          console.error(`⚠️  Suspicious airdrop volume detected!`);
          console.error(`   Campaign ID: ${campaign.id}`);
          console.error(`   Chain ID: ${campaign.chainId}`);
          console.error(`   Asset: ${campaign.asset.symbol}`);
          console.error(`   Normalized USD value: $${normalized.toLocaleString()}`);
          console.error(`   Raw aggregateAmount: ${campaign.aggregateAmount}`);
          console.error(`   Decimals: ${decimals}`);
        }

        return sum + normalized;
      }, 0);

      totalVolume += batchVolume;

      // Check if we need to fetch more
      hasMore = batch.length === limit;
      offset += limit;
    }

    return totalVolume;
  } catch (error) {
    console.error("Error fetching airdrops stablecoin volume:", error);
    throw error;
  }
}

export async function fetchAirdropsStablecoinVolumeTimeRange(days: number): Promise<number> {
  const testnetChainIds = getTestnetChainIds();
  const timestamp = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000).toString();
  let totalVolume = 0;
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  try {
    while (hasMore) {
      const query = `
        query GetAirdropsStablecoinVolumeTimeRange {
          Campaign(
            limit: ${limit}
            offset: ${offset}
            where: {
              chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
              timestamp: { _gte: "${timestamp}" }
              asset: {
                symbol: { _in: ${JSON.stringify(EVM_STABLECOINS)} }
              }
            }
          ) {
            id
            chainId
            aggregateAmount
            asset {
              decimals
              symbol
            }
          }
        }
      `;

      const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
        body: JSON.stringify({ query }),
        headers: getHeaders(),
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<StablecoinVolumeResponse> = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const batch = result.data.Campaign;

      // Accumulate normalized volumes for this batch
      const batchVolume = batch.reduce((sum, campaign) => {
        const decimals = parseInt(campaign.asset.decimals, 10);
        if (Number.isNaN(decimals)) {
          throw new Error(`Invalid decimals value: ${campaign.asset.decimals}`);
        }
        const aggregateAmount = BigInt(campaign.aggregateAmount);
        const normalized = Number(aggregateAmount / BigInt(10) ** BigInt(decimals));

        // Debug suspicious values
        if (normalized > 10_000_000_000) {
          console.error(`⚠️  Suspicious airdrop volume detected!`);
          console.error(`   Campaign ID: ${campaign.id}`);
          console.error(`   Chain ID: ${campaign.chainId}`);
          console.error(`   Asset: ${campaign.asset.symbol}`);
          console.error(`   Normalized USD value: $${normalized.toLocaleString()}`);
          console.error(`   Raw aggregateAmount: ${campaign.aggregateAmount}`);
          console.error(`   Decimals: ${decimals}`);
        }

        return sum + normalized;
      }, 0);

      totalVolume += batchVolume;

      // Check if we need to fetch more
      hasMore = batch.length === limit;
      offset += limit;
    }

    return totalVolume;
  } catch (error) {
    console.error("Error fetching airdrops stablecoin volume time range:", error);
    throw error;
  }
}
