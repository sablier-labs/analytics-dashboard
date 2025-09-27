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

    console.log(`Fetched total campaigns: ${result.data.Campaign_aggregate.aggregate.count}`);
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
    console.log(
      `Fetched monthly campaign creation: ${monthlyData.length} months, ${totalCampaigns} total campaigns`,
    );

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

    console.log(
      `Calculated recipient participation: ${percentage.toFixed(1)}% across ${result.data.Campaign.length} campaigns`,
    );
    console.log(
      `Total claims: ${totalClaimed.toLocaleString()}, Total recipients: ${totalRecipients.toLocaleString()}`,
    );

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

    console.log(
      `Calculated median claimers: ${median} from ${claimerCounts.length} campaigns with ≥10 claims`,
    );

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

    console.log(
      `Calculated median claim window: ${median.toFixed(1)} days from ${claimWindows.length} campaigns with expiration dates`,
    );

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

    console.log(
      `Fetched vesting distribution: ${instantCount} instant campaigns, ${vestingCount} vesting campaigns`,
    );

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

    console.log(
      `Fetched chain distribution: ${chainDistribution.length} chains, ${result.data.Campaign.length} total campaigns`,
    );

    return chainDistribution;
  } catch (error) {
    console.error("Error fetching chain distribution:", error);
    throw error;
  }
}

export interface CampaignCompletionRate {
  totalCampaigns: number;
  completedCampaigns: number;
  completionRate: number;
}

export interface CampaignCompletionResponse {
  total: {
    aggregate: {
      count: number;
    };
  };
  completed: {
    aggregate: {
      count: number;
    };
  };
}

export async function fetchCampaignCompletionRate(): Promise<CampaignCompletionRate> {
  const testnetChainIds = getTestnetChainIds();

  const query = `
    query GetCampaignCompletionRate {
      Campaign(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
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

    const result: GraphQLResponse<{ Campaign: Array<{ claimedCount: string; totalRecipients: string }> }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    const campaigns = result.data.Campaign;
    const totalCampaigns = campaigns.length;

    // Count campaigns where all recipients claimed (claimedCount == totalRecipients)
    const completedCampaigns = campaigns.filter(campaign =>
      campaign.claimedCount === campaign.totalRecipients
    ).length;

    const completionRate = totalCampaigns > 0 ? (completedCampaigns / totalCampaigns) * 100 : 0;

    const campaignCompletion: CampaignCompletionRate = {
      totalCampaigns,
      completedCampaigns,
      completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal place
    };

    console.log(
      `Fetched campaign completion rate: ${completedCampaigns}/${totalCampaigns} (${campaignCompletion.completionRate}%)`,
    );

    return campaignCompletion;
  } catch (error) {
    console.error("Error fetching campaign completion rate:", error);
    throw error;
  }
}

export interface AdminStats {
  admin: string;
  campaignCount: number;
  totalClaimers: number;
  totalRecipients: number;
  averageClaimRate: number;
  chainIds: string[];
}

export interface AdminStatsResponse {
  Campaign: Array<{
    admin: string;
    campaignCount: number;
    totalClaimers: string;
    totalRecipients: string;
    chainIds: string[];
  }>;
}

export async function fetchAdminLeaderboard(): Promise<AdminStats[]> {
  const testnetChainIds = getTestnetChainIds();

  const query = `
    query GetAdminLeaderboard {
      Campaign(
        where: {
          chainId: { _nin: ${JSON.stringify(testnetChainIds)} }
        }
      ) {
        admin
        claimedCount
        totalRecipients
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

    const result: GraphQLResponse<{ Campaign: Array<{ admin: string; claimedCount: string; totalRecipients: string; chainId: string }> }> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
    }

    // Group campaigns by admin
    const adminMap = new Map<string, {
      campaignCount: number;
      totalClaimers: number;
      totalRecipients: number;
      chainIds: Set<string>;
    }>();

    result.data.Campaign.forEach(campaign => {
      const admin = campaign.admin;
      const claimers = parseInt(campaign.claimedCount, 10);
      const recipients = parseInt(campaign.totalRecipients, 10);

      if (!adminMap.has(admin)) {
        adminMap.set(admin, {
          campaignCount: 0,
          totalClaimers: 0,
          totalRecipients: 0,
          chainIds: new Set<string>(),
        });
      }

      const stats = adminMap.get(admin)!;
      stats.campaignCount += 1;
      stats.totalClaimers += claimers;
      stats.totalRecipients += recipients;
      stats.chainIds.add(campaign.chainId);
    });

    // Convert to array and calculate average claim rates
    const adminStats: AdminStats[] = Array.from(adminMap.entries()).map(([admin, stats]) => {
      const averageClaimRate = stats.totalRecipients > 0
        ? (stats.totalClaimers / stats.totalRecipients) * 100
        : 0;

      return {
        admin,
        campaignCount: stats.campaignCount,
        totalClaimers: stats.totalClaimers,
        totalRecipients: stats.totalRecipients,
        averageClaimRate: Math.round(averageClaimRate * 10) / 10,
        chainIds: Array.from(stats.chainIds),
      };
    });

    // Sort by campaign count descending, then by total claimers
    const topAdmins = adminStats
      .sort((a, b) => {
        if (b.campaignCount !== a.campaignCount) {
          return b.campaignCount - a.campaignCount;
        }
        return b.totalClaimers - a.totalClaimers;
      })
      .slice(0, 10);

    console.log(
      `Fetched admin leaderboard: ${topAdmins.length} admins, top admin: ${topAdmins[0]?.campaignCount || 0} campaigns`,
    );

    return topAdmins;
  } catch (error) {
    console.error("Error fetching admin leaderboard:", error);
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

    console.log(
      `Fetched top performing campaigns: ${topCampaigns.length} campaigns, highest claimers: ${topCampaigns[0]?.claimedCount || 0}`,
    );

    return topCampaigns;
  } catch (error) {
    console.error("Error fetching top performing campaigns:", error);
    throw error;
  }
}
