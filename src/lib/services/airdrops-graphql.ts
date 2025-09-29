import { get } from "@vercel/edge-config";
import { getMainnetChainName, getTestnetChainIds } from "@/lib/constants/chains";

const AIRDROPS_GRAPHQL_ENDPOINT = "https://indexer.hyperindex.xyz/508d217/v1/graphql";

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
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
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
      count: result.data[`month${index}`].aggregate.count,
      month: range.label,
    }));

    const totalCampaigns = monthlyData.reduce((sum, month) => sum + month.count, 0);

    return monthlyData;
  } catch (error) {
    console.error("Error fetching monthly campaign creation:", error);
    throw error;
  }
}

export async function fetchRecipientParticipation(): Promise<RecipientParticipation> {
  const testnetChainIds = getTestnetChainIds();

  const query = `
    query GetRecipientParticipation {
      Campaign(
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

  try {
    const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
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

    // Calculate overall participation rate
    let totalClaimed = 0;
    let totalRecipients = 0;

    for (const campaign of result.data.Campaign) {
      totalClaimed += parseInt(campaign.claimedCount, 10);
      totalRecipients += parseInt(campaign.totalRecipients, 10);
    }

    const percentage = totalRecipients > 0 ? (totalClaimed / totalRecipients) * 100 : 0;


    return {
      campaignCount: result.data.Campaign.length,
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
    };
  } catch (error) {
    console.error("Error fetching recipient participation:", error);
    throw error;
  }
}

export async function fetchMedianClaimers(): Promise<number> {
  const testnetChainIds = getTestnetChainIds();

  const query = `
    query GetMedianClaimers {
      Campaign(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          claimedCount: { _gte: "10" }
        }
      ) {
        claimedCount
      }
    }
  `;

  try {
    const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
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

    // Extract claimers counts and sort for median calculation
    const claimerCounts = result.data.Campaign.map((campaign) =>
      parseInt(campaign.claimedCount, 10),
    ).sort((a, b) => a - b);

    if (claimerCounts.length === 0) {
      console.log("No campaigns with ≥10 claims found");
      return 0;
    }

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

  const query = `
    query GetMedianClaimWindow {
      Campaign(
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

  try {
    const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
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

    // Calculate claim windows in days and sort for median calculation
    const claimWindows = result.data.Campaign.map((campaign) => {
      const startTime = parseInt(campaign.timestamp, 10);
      const endTime = parseInt(campaign.expiration, 10);
      const durationSeconds = endTime - startTime;
      const durationDays = durationSeconds / (24 * 60 * 60); // Convert seconds to days
      return durationDays;
    })
      .filter((duration) => duration > 0) // Only include valid durations
      .sort((a, b) => a - b);

    if (claimWindows.length === 0) {
      console.log("No campaigns with valid expiration dates found");
      return 0;
    }

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
      headers: {
        "Content-Type": "application/json",
      },
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

  const query = `
    query GetChainDistribution {
      Campaign(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
        }
      ) {
        chainId
      }
    }
  `;

  try {
    const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse<{ Campaign: Array<{ chainId: string }> }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    // Aggregate campaigns by chainId
    const chainCounts = new Map<string, number>();

    for (const campaign of result.data.Campaign) {
      const currentCount = chainCounts.get(campaign.chainId) || 0;
      chainCounts.set(campaign.chainId, currentCount + 1);
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


export async function fetchTopPerformingCampaigns(): Promise<TopPerformingCampaign[]> {
  const testnetChainIds = getTestnetChainIds();

  const query = `
    query GetTopPerformingCampaigns {
      Campaign(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
          claimedCount: { _gte: "10" }
        }
        order_by: { claimedCount: desc }
        limit: 10
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

  try {
    const response = await fetch(AIRDROPS_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
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

    // Transform response to include chain names and claim rates
    const topCampaigns: TopPerformingCampaign[] = result.data.Campaign.map((campaign) => {
      const claimedCount = parseInt(campaign.claimedCount, 10);
      const totalRecipients = parseInt(campaign.totalRecipients, 10);
      const claimRate = totalRecipients > 0 ? (claimedCount / totalRecipients) * 100 : 0;

      return {
        id: campaign.id,
        chainId: campaign.chainId,
        chainName: getMainnetChainName(campaign.chainId),
        claimedCount: campaign.claimedCount,
        totalRecipients: campaign.totalRecipients,
        claimRate: Math.round(claimRate * 10) / 10, // Round to 1 decimal place
        timestamp: campaign.timestamp,
        expiration: campaign.expiration,
        admin: campaign.admin,
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
      timestamp: "", // Default value - not needed for display
      expiration: "", // Default value - not needed for display
      admin: "", // Default value - not needed for display
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
